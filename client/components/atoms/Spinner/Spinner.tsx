import { cn } from '@/lib/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE: Record<SpinnerSize, number> = { sm: 16, md: 20, lg: 24 };

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /**
   * Accessible name. Omit when the spinner sits inside something that already
   * announces its busy state (a Button with `loading`), so it isn't read twice.
   */
  label?: string;
}

/**
 * Indeterminate progress indicator. Inherits `currentColor`, so it takes the
 * colour of whatever it sits in. Spec: docs/design/03-component-system.md §6.2
 */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const px = SIZE[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={cn('shrink-0 animate-spin [animation-duration:600ms]', className)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
