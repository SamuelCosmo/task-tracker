'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'momentum-theme';

/**
 * Runs before first paint, inlined into <head>.
 *
 * A dark-mode user seeing a white flash on every load is far worse than a few
 * milliseconds of render delay, and it is very visible at night — so this is
 * deliberately render-blocking.
 *
 * `system` sets no class at all, letting the `prefers-color-scheme` fallback in
 * globals.css decide. Spec: docs/design/09-light-dark-mode.md §9.8
 */
export const themeScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=(s==='light'||s==='dark')?s:'system';var d=document.documentElement;d.classList.remove('light','dark');if(t!=='system'){d.classList.add(t)}}catch(e){}})()`;

const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Private mode, blocked site data — fall back rather than throw.
    return 'system';
  }
}

/**
 * Suspend CSS transitions for one frame while the theme flips.
 *
 * Two reasons. The spec says theme changes are not animated (Module 09 §9.8) —
 * a 200ms cross-fade of every colour on the page is janky on long lists. And
 * more importantly: Chrome never completes a colour transition whose target
 * changed through the downlevelled light-dark() toggle, so any element with a
 * colour transition would FREEZE at the old theme's colour. Verified on
 * buttons, chips and inputs; elements without transitions were fine.
 */
function withoutTransitions(mutate: () => void) {
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  mutate();
  // Force a synchronous style + layout pass while transitions are disabled.
  // This also cancels any transition already stuck mid-flight.
  void document.documentElement.offsetHeight;
  // setTimeout rather than requestAnimationFrame: rAF does not fire in a
  // hidden tab, which would leave transitions disabled until it is shown.
  setTimeout(() => style.remove(), 0);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  withoutTransitions(() => {
    root.classList.remove('light', 'dark');
    if (theme !== 'system') root.classList.add(theme);
  });

  // Keep the mobile browser chrome in step with the page.
  const background = getComputedStyle(root).getPropertyValue('--background').trim();
  if (background) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = background;
  }
}

/* --- External store -------------------------------------------------------
   The theme lives in localStorage and the OS, not in React. Reading it through
   useSyncExternalStore gives a correct server snapshot and avoids setting state
   from an effect on mount. The snapshot is a single string so repeated reads are
   reference-stable. */

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  // Another tab changed the setting.
  window.addEventListener('storage', onChange);
  listeners.add(onChange);
  return () => {
    query.removeEventListener('change', onChange);
    window.removeEventListener('storage', onChange);
    listeners.delete(onChange);
  };
}

function getSnapshot() {
  const system = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  return `${readStoredTheme()}|${system}`;
}

// The server cannot know either value; the pre-paint script corrects the colours
// before anything is visible, so this only affects the toggle's label.
function getServerSnapshot() {
  return 'system|light';
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
}

const CYCLE: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [theme, systemTheme] = snapshot.split('|') as [Theme, ResolvedTheme];
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  const [announcement, setAnnouncement] = useState('');

  // DOM sync only — no state is set here. Re-applying what the pre-paint script
  // already did is idempotent, and this keeps meta[theme-color] correct when the
  // OS flips while the setting is 'system'.
  useEffect(() => {
    applyTheme(theme);
  }, [theme, resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: applyTheme below still takes effect for this session.
    }
    applyTheme(next);
    setAnnouncement(`Theme: ${next}`);
    emit();
  }, []);

  const cycleTheme = useCallback(() => setTheme(CYCLE[theme]), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </ThemeContext.Provider>
  );
}
