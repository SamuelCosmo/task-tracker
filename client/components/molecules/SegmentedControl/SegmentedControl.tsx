'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export interface SegmentOption<V extends string> {
  value: V;
  label: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string> {
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible name for the group, e.g. "Priority" or "View". */
  label: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Mutually-exclusive choice with every option visible — used where a dropdown
 * would cost a click to reveal 3–4 options that fit on screen anyway.
 * Radio semantics with roving focus; arrows move, Home/End jump.
 * The selected background slides between equal-width segments (200ms).
 * Spec: docs/design/03-component-system.md §6.3 SegmentedControl
 */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  fullWidth = false,
  className,
}: SegmentedControlProps<V>) {
  const groupId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  function focusAndSelect(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    refs.current[index]?.focus();
    onChange(option.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = enabled[(pos + 1) % enabled.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next !== undefined) focusAndSelect(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'relative isolate grid rounded-md bg-surface-secondary p-0.5',
        size === 'md' ? 'h-9' : 'h-8',
        fullWidth ? 'w-full' : 'w-fit',
        className,
      )}
      // Plain 1fr (auto min), not minmax(0,1fr): under w-fit the latter collapses
      // every track to 0. With an auto minimum, each fr track sizes to the widest
      // item — equal segments that fit their content.
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {/* Sliding selected background. Equal columns → position is index × 100%. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 -z-10 rounded-sm bg-surface shadow-card transition-transform duration-(--duration-base) ease-standard"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            id={`${groupId}-${option.value}`}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 text-sm font-medium select-none',
              'transition-colors duration-(--duration-instant)',
              selected ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
              'disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:text-text-disabled',
            )}
          >
            {option.icon && <Icon icon={option.icon} size="sm" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
