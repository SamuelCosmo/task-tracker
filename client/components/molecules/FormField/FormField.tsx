import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { HelperText, Label } from '@/components/atoms';

/** Props handed to the control so it is labelled and described correctly. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-required'?: true;
  invalid: boolean;
}

export interface FormFieldProps {
  label: ReactNode;
  required?: boolean;
  /** Shown below the control. Replaced (not stacked) by `error` when set. */
  helper?: ReactNode;
  /** Error message. Presence switches the field into its error state. */
  error?: ReactNode;
  /** Character budget. The counter appears only within the last 20 characters,
   *  so a rarely-approached limit does not read as a constraint. */
  count?: { value: number; max: number };
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Wraps any input atom with its label, helper/error text, and the
 * id / aria-describedby wiring between them. This is the single place that
 * wiring lives — every input atom re-implementing it is how it drifts.
 * Spec: docs/design/03-component-system.md §6.3 FormField
 */
export function FormField({ label, required, helper, error, count, className, children }: FormFieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const messageId = `${id}-message`;
  const hasError = error !== undefined && error !== null && error !== false;
  const message = hasError ? error : helper;
  const showCount = count !== undefined && count.max - count.value <= 20;
  const overBudget = count !== undefined && count.value > count.max;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={controlId} required={required}>
        {label}
      </Label>

      {children({
        id: controlId,
        'aria-describedby': message ? messageId : undefined,
        'aria-required': required || undefined,
        invalid: hasError || overBudget,
      })}

      {(message || showCount) && (
        <div className="flex items-start justify-between gap-3">
          {message ? (
            <HelperText id={messageId} error={hasError}>
              {message}
            </HelperText>
          ) : (
            <span />
          )}
          {showCount && (
            <span
              className={cn(
                'shrink-0 text-caption tabular-nums',
                overBudget ? 'text-error-strong' : 'text-text-muted',
              )}
              aria-live="polite"
            >
              {count.value}/{count.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
