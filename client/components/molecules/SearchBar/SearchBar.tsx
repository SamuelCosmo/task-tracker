'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon, Kbd } from '@/components/atoms';

export interface SearchBarProps {
  value: string;
  /** Fires on every keystroke — keep the input controlled. */
  onChange: (value: string) => void;
  /** Fires debounced (250ms) — wire this to the URL / the fetch. */
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  /** Registers `/` and Cmd/Ctrl+K to focus the field from anywhere. */
  shortcut?: boolean;
  /** Announced politely, e.g. "12 tasks found". */
  resultsLabel?: string;
  /** 44px + fully rounded below md; 40px + radius-md above. */
  className?: string;
  'aria-label'?: string;
}

/**
 * Results update in place — search never navigates to a separate screen, so
 * refining a query is a zero-navigation loop. Esc clears and keeps focus.
 * Spec: docs/design/03-component-system.md §6.3 SearchBar
 */
export function SearchBar({
  value,
  onChange,
  onSearch,
  debounceMs = 250,
  placeholder = 'Search tasks…',
  shortcut = false,
  resultsLabel,
  className,
  'aria-label': ariaLabel = 'Search tasks',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(onSearch);
  useEffect(() => {
    latest.current = onSearch;
  });

  // Debounce: the URL is updated with `replace`, so back never steps through
  // keystrokes — but it still should not update 60 times a second.
  useEffect(() => {
    if (!latest.current) return;
    const handle = setTimeout(() => latest.current?.(value), debounceMs);
    return () => clearTimeout(handle);
  }, [value, debounceMs]);

  useEffect(() => {
    if (!shortcut) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const cmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (cmdK || (!typing && event.key === '/')) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && value) {
      event.preventDefault();
      event.stopPropagation();
      onChange('');
    }
  }

  function clear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div role="search" className={cn('relative flex w-full items-center', className)}>
      <span className="pointer-events-none absolute left-3 text-text-muted">
        <Icon icon={Search} size="md" />
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          'h-11 w-full rounded-full bg-surface-secondary pl-10 text-body text-text-primary placeholder:text-text-muted md:h-10 md:rounded-md',
          'border border-transparent transition-[background-color,border-color] duration-(--duration-instant)',
          'focus:border-border-focus focus:bg-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          // Native search decorations would duplicate our clear button.
          '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
          value ? 'pr-10' : 'pr-16 pointer-coarse:pr-3',
        )}
      />
      <span className="absolute right-2 flex items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface hover:text-text-primary"
          >
            <Icon icon={X} size="sm" />
          </button>
        ) : (
          shortcut && (
            <span className="hidden items-center gap-0.5 pointer-fine:flex" aria-hidden>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          )
        )}
      </span>
      {resultsLabel && (
        <span aria-live="polite" className="sr-only">
          {resultsLabel}
        </span>
      )}
    </div>
  );
}
