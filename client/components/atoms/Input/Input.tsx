'use client';

import { useRef, type ComponentProps, type MouseEvent } from 'react';
import { AlertCircle, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms/Icon';

export type InputSize = 'sm' | 'md';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: InputSize;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  /** Shows a clear button while there is a value. Requires a controlled `value`. */
  clearable?: boolean;
  onClear?: () => void;
  /** Error styling + `aria-invalid`. Pair with a HelperText via `aria-describedby`. */
  invalid?: boolean;
}

/* Spec: docs/design/03-component-system.md §6.2 Input.
   This atom is the control only. Label, helper/error text, and the id wiring
   between them belong to the FormField molecule — one place to get it right. */

export const inputClassName = cn(
  'w-full rounded-md border border-border-strong bg-surface text-text-primary placeholder:text-text-muted',
  'transition-[border-color,background-color] duration-(--duration-instant)',
  'hover:border-text-secondary',
  // 1px border recolour on focus, plus the global 2px :focus-visible ring.
  'focus:border-border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
  'aria-invalid:border-error-strong aria-invalid:hover:border-error-strong',
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-secondary disabled:text-text-disabled disabled:placeholder:text-text-disabled',
  // Read-only: the value still matters, so it keeps primary text; no border.
  'read-only:border-transparent read-only:bg-surface-secondary read-only:hover:border-transparent',
);

const SIZE: Record<InputSize, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-body',
};

/* Horizontal padding: space-3 plain; space-2 + adornment + space-2 per side otherwise. */
const PAD_LEFT = { none: 'pl-3', icon: 'pl-9' };
const PAD_RIGHT = { 0: 'pr-3', 1: 'pr-9', 2: 'pr-16' };

export function Input({
  size = 'md',
  iconLeft,
  iconRight,
  clearable = false,
  onClear,
  invalid = false,
  className,
  value,
  disabled,
  readOnly,
  ref,
  ...rest
}: InputProps) {
  const innerRef = useRef<HTMLInputElement>(null);
  const showClear = clearable && !disabled && !readOnly && value !== undefined && String(value).length > 0;
  const trailingCount = (showClear ? 1 : 0) + (invalid ? 1 : 0) + (iconRight && !invalid ? 1 : 0);

  function setRefs(node: HTMLInputElement | null) {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onClear?.();
    innerRef.current?.focus();
  }

  return (
    <span className="relative flex w-full items-center">
      {iconLeft && (
        <span className="pointer-events-none absolute left-2 text-text-muted">
          <Icon icon={iconLeft} size="md" />
        </span>
      )}

      <input
        ref={setRefs}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        className={cn(
          inputClassName,
          SIZE[size],
          iconLeft ? PAD_LEFT.icon : PAD_LEFT.none,
          PAD_RIGHT[Math.min(trailingCount, 2) as 0 | 1 | 2],
          className,
        )}
        {...rest}
      />

      <span className="absolute right-2 flex items-center gap-1">
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear"
            className="flex h-6 w-6 items-center justify-center rounded-xs text-text-muted hover:bg-surface-secondary hover:text-text-primary"
          >
            <Icon icon={X} size="sm" />
          </button>
        )}
        {invalid ? (
          <Icon icon={AlertCircle} size="md" className="text-error-strong" label="Invalid" />
        ) : (
          iconRight && <Icon icon={iconRight} size="md" className="pointer-events-none text-text-muted" />
        )}
      </span>
    </span>
  );
}
