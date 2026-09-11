import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms/Icon';

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Error styling + icon. The message is always text — never a red border alone. */
  error?: boolean;
  children: ReactNode;
}

/**
 * Helper or error text under a field. Give it an `id` and point the field's
 * `aria-describedby` at it (FormField does this wiring). Error text REPLACES
 * helper text rather than stacking under it, so the form does not jump.
 */
export function HelperText({ error = false, className, children, ...rest }: HelperTextProps) {
  return (
    <p
      className={cn(
        'flex items-start gap-1 text-sm',
        error ? 'text-error-strong' : 'text-text-muted',
        className,
      )}
      {...rest}
    >
      {error && <Icon icon={AlertCircle} size="sm" className="mt-px" />}
      <span>{children}</span>
    </p>
  );
}
