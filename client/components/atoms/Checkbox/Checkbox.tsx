'use client';

import { useEffect, useId, useRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked?: boolean;
  /** Mixed state, e.g. "some of these are done". Cleared by the next click. */
  indeterminate?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Visible label. When omitted, pass `aria-label` — a checkbox must have a name. */
  label?: ReactNode;
  className?: string;
}

/**
 * The highest-frequency control in the product.
 *
 * - Visible box is 20px; the hit target is 36px on pointer and 44px on touch,
 *   padded out with negative margins so the layout still sees 20px.
 * - The real <input> is visually hidden but fully functional, so keyboard,
 *   forms, and assistive tech all come for free.
 * - Checking animates: fill scales 0.8→1 and the check draws, 150ms each. The
 *   global reduced-motion rule collapses both.
 *
 * Spec: docs/design/03-component-system.md §6.2 Checkbox
 */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  disabled,
  className,
  id: idProp,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const id = idProp ?? generatedId;

  // `indeterminate` is a DOM property, not an attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      htmlFor={id}
      className={cn(
        'group inline-flex items-center gap-2 text-body text-text-primary',
        disabled ? 'cursor-not-allowed text-text-disabled' : 'cursor-pointer',
        className,
      )}
    >
      {/* Hit-target wrapper: 20px box + 8px (pointer) or 12px (touch) on every side. */}
      <span className="relative -m-2 inline-flex shrink-0 p-2 pointer-coarse:-m-3 pointer-coarse:p-3">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : undefined}
          onChange={(event) => onChange?.(event.target.checked, event)}
          {...rest}
        />

        {/* The visible box. Every visual state is driven off the hidden input. */}
        <span
          aria-hidden
          className={cn(
            'relative flex h-5 w-5 items-center justify-center rounded-xs border-[1.5px] border-border-strong bg-transparent',
            'transition-[border-color,background-color] duration-(--duration-fast) ease-standard',
            // Hover (pointer only — Tailwind gates hover: behind (hover: hover)).
            'peer-enabled:group-hover:border-primary peer-enabled:group-hover:bg-primary-light',
            // Checked / mixed.
            'peer-checked:border-primary peer-indeterminate:border-primary',
            'peer-checked:peer-enabled:group-hover:border-primary-hover',
            // Keyboard focus ring on the box, since the input itself is hidden.
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus',
            // Disabled.
            'peer-disabled:border-text-disabled peer-disabled:bg-transparent',
          )}
        >
          {/* Fill layer — scales in on check. */}
          <span
            className={cn(
              'absolute inset-0 rounded-[3px] bg-primary opacity-0 scale-75',
              'transition-[opacity,transform,background-color] duration-(--duration-fast) ease-standard',
              'group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100',
              'group-has-[:indeterminate]:scale-100 group-has-[:indeterminate]:opacity-100',
              'group-has-[:checked]:group-hover:bg-primary-hover',
              'group-has-[:disabled]:bg-text-disabled group-has-[:disabled]:group-hover:bg-text-disabled',
            )}
          />
          {/* Check — draws left to right. */}
          <svg
            viewBox="0 0 14 14"
            className="relative h-3.5 w-3.5 text-on-primary group-has-[:indeterminate]:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M2.5 7.5 5.5 10.5 11.5 4"
              className={cn(
                '[stroke-dasharray:16] [stroke-dashoffset:16]',
                'transition-[stroke-dashoffset] duration-(--duration-fast) ease-standard',
                'group-has-[:checked]:[stroke-dashoffset:0]',
              )}
            />
          </svg>
          {/* Mixed-state dash. */}
          <span className="relative hidden h-0.5 w-2.5 rounded-full bg-on-primary group-has-[:indeterminate]:block" />
        </span>
      </span>

      {label && <span className="select-none">{label}</span>}
    </label>
  );
}
