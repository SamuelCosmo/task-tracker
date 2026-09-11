'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Dot, Icon, inputClassName, type PaletteColor } from '@/components/atoms';
import { Popover } from '@/components/molecules/Popover';

export interface SelectOption<V extends string> {
  value: V;
  label: ReactNode;
  /** Plain text used for typeahead and the trigger's accessible value. */
  text?: string;
  icon?: LucideIcon;
  dot?: PaletteColor;
  disabled?: boolean;
}

export interface SelectProps<V extends string> {
  options: SelectOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  placeholder?: string;
  /** From FormField, or set directly. */
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: true;
  'aria-label'?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** Rendered after a divider at the end of the list — e.g. "+ New category". */
  footer?: ReactNode;
  className?: string;
}

/**
 * Input-shaped trigger + listbox popover. Opens on click or ArrowDown/Enter/
 * Space (never hover); ↑↓ move, Enter selects, typing jumps to a match, Esc
 * closes and returns focus. The selected item carries a trailing check, not a
 * coloured background alone. Spec: Module 03 §6.3 Select
 */
export function Select<V extends string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  id,
  invalid = false,
  disabled = false,
  size = 'md',
  footer,
  className,
  ...aria
}: SelectProps<V>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({ buffer: '', at: 0 });

  const selected = options.find((o) => o.value === value) ?? null;
  const enabledIndexes = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const close = useCallback(() => setOpen(false), []);

  // Keyboard handling lives on the listbox, so it — not the popover panel —
  // must hold focus while open.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openList(startAt?: number) {
    if (disabled) return;
    const selectedIndex = options.findIndex((o) => o.value === value);
    setActiveIndex(startAt ?? (selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1)));
    setOpen(true);
  }

  function commit(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close();
  }

  function move(delta: number) {
    // Functional update so held-down keys step from the latest index, not a
    // stale closure.
    setActiveIndex((current) => {
      const pos = enabledIndexes.indexOf(current);
      return enabledIndexes[Math.max(0, Math.min(enabledIndexes.length - 1, pos + delta))] ?? current;
    });
  }

  function jumpTo(char: string) {
    const now = Date.now();
    const state = typeahead.current;
    state.buffer = now - state.at < 500 ? state.buffer + char : char;
    state.at = now;
    const needle = state.buffer.toLowerCase();
    const match = options.findIndex(
      (o) => !o.disabled && (o.text ?? String(o.label)).toLowerCase().startsWith(needle),
    );
    if (match >= 0) setActiveIndex(match);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openList();
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      // Typing on a closed select changes the value directly, like a native one.
      const match = options.findIndex(
        (o) => !o.disabled && (o.text ?? String(o.label)).toLowerCase().startsWith(event.key.toLowerCase()),
      );
      if (match >= 0) onChange(options[match].value);
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? -1);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Tab':
        close();
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) jumpTo(event.key);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          inputClassName,
          size === 'md' ? 'h-10 text-body' : 'h-8 text-sm',
          'flex items-center gap-2 pr-2 pl-3 text-left',
          !selected && 'text-text-muted',
          className,
        )}
        {...aria}
      >
        {selected?.dot && <Dot color={selected.dot} />}
        {selected?.icon && <Icon icon={selected.icon} size="sm" className="text-text-muted" />}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <Icon
          icon={ChevronDown}
          size="sm"
          className={cn('text-text-muted transition-transform duration-(--duration-fast)', open && 'rotate-180')}
        />
      </button>

      <Popover open={open} onClose={close} anchorRef={triggerRef} matchWidth initialFocus="none">
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          onKeyDown={onListKeyDown}
          className="max-w-xs outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerMove={() => !option.disabled && setActiveIndex(index)}
                onClick={() => commit(index)}
                className={cn(
                  'flex h-9 cursor-default items-center gap-2 rounded-md px-3 text-body text-text-primary select-none',
                  isActive && 'bg-surface-secondary',
                  option.disabled && 'cursor-not-allowed text-text-disabled',
                )}
              >
                {option.dot && <Dot color={option.dot} />}
                {option.icon && <Icon icon={option.icon} size="sm" className="text-text-muted" />}
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <Icon icon={Check} size="sm" className="text-primary-strong" />}
              </div>
            );
          })}
          {footer && (
            <>
              <div role="separator" className="my-1 h-px bg-border" />
              {footer}
            </>
          )}
        </div>
      </Popover>
    </>
  );
}
