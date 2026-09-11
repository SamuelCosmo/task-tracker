import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Keyboard-shortcut hint. Pointer-only UI — hide it on touch at the call site. */
export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border bg-surface-secondary px-1',
        'font-mono text-caption text-text-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
