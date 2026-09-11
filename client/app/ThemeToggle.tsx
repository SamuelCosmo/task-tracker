'use client';

import { useTheme, type Theme } from './theme';

const NEXT_LABEL: Record<Theme, string> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/**
 * Cycles system -> light -> dark. The icon reflects the *resolved* theme through
 * CSS alone, so it is correct on the very first paint and cannot cause a
 * hydration mismatch; only the label depends on React state.
 */
export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
      aria-label={`Theme: ${theme}. Switch to ${NEXT_LABEL[theme]}.`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
    >
      {/* Sun — shown in light mode */}
      <svg {...ICON_PROPS} className="dark:hidden">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Moon — shown in dark mode */}
      <svg {...ICON_PROPS} className="hidden dark:block">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
