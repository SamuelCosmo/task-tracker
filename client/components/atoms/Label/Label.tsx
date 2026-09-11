import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds a `*` marker. Optional fields are NOT marked — in this product only
   *  `title` is required, so marking optional fields would mark everything. */
  required?: boolean;
  children: ReactNode;
}

/** Always visible. Placeholder-as-label is prohibited (Module 02 §4.11). */
export function Label({ required = false, className, children, ...rest }: LabelProps) {
  return (
    <label className={cn('inline-flex items-center gap-1 text-sm text-text-secondary', className)} {...rest}>
      {children}
      {required && (
        <span aria-hidden className="text-error-strong">
          *
        </span>
      )}
    </label>
  );
}
