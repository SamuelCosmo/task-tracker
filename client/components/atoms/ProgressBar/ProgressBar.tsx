import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 0–100. */
  value: number;
  /** Accessible name, e.g. "Today's progress". */
  label: string;
  /** Override the fill (e.g. a category colour class). Defaults to primary. */
  fillClassName?: string;
}

/** 6px track, 280ms fill transition. Spec: Module 03 §6.2 ProgressBar */
export function ProgressBar({ value, label, fillClassName, className, ...rest }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary', className)}
      {...rest}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary transition-[width] duration-(--duration-slow) ease-standard',
          fillClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
