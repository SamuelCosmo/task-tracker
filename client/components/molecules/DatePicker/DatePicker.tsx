'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon, inputClassName } from '@/components/atoms';
import { Popover } from '@/components/molecules/Popover';
import { formatAbsoluteDate, formatRelativeDate, parseISODate, todayISO } from '@/lib/dates';

export interface DatePickerProps {
  /** YYYY-MM-DD or null. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  id?: string;
  'aria-describedby'?: string;
  'aria-required'?: true;
  'aria-label'?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Injectable for tests. */
  today?: string;
  className?: string;
}

/* --- date-string arithmetic (local calendar days, never instants) --------- */

function toISO(date: Date): string {
  return todayISO(date);
}

function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function addMonths(iso: string, months: number): string {
  const d = parseISODate(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  // Clamp to the target month's length so Jan 31 + 1 month is Feb 28, not Mar 3.
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** The 42 cells (6 weeks) covering the month that contains `iso`. */
function monthGrid(iso: string, weekStartsOn: 0 | 1): string[] {
  const first = parseISODate(`${monthKey(iso)}-01`);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(toISO(first), -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function weekdayLabels(weekStartsOn: 0 | 1, locale?: string): string[] {
  // 2024-01-07 is a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + weekStartsOn + i).toLocaleDateString(locale, { weekday: 'narrow' }),
  );
}

/**
 * Text trigger + calendar popover. Presets come BEFORE the grid: today,
 * tomorrow and next week cover most real due dates in one tap. The trigger
 * shows relative AND absolute ("Tomorrow · Sep 11"). "No due date" is an
 * explicit option. Roving-focus grid: arrows move by day, PageUp/Down by month,
 * Home/End to week bounds, Enter selects, Esc closes.
 * Spec: docs/design/03-component-system.md §6.3 DatePicker
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'No due date',
  weekStartsOn = 1,
  id,
  invalid = false,
  disabled = false,
  today: todayProp,
  className,
  ...aria
}: DatePickerProps) {
  const today = todayProp ?? todayISO();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridId = useId();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<string>(value ?? today);

  const close = useCallback(() => setOpen(false), []);

  function openPicker() {
    if (disabled) return;
    setFocused(value ?? today);
    setOpen(true);
  }

  function select(iso: string | null) {
    onChange(iso);
    close();
  }

  // Keep DOM focus on the focused cell as it moves (roving tabindex).
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [open, focused]);

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => addDays(focused, -((parseISODate(focused).getDay() - weekStartsOn + 7) % 7)),
      End: () => addDays(focused, 6 - ((parseISODate(focused).getDay() - weekStartsOn + 7) % 7)),
    };
    if (event.key in moves) {
      event.preventDefault();
      setFocused(moves[event.key]());
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(focused);
    } else if (event.key.toLowerCase() === 't') {
      event.preventDefault();
      setFocused(today);
    }
  }

  const cells = monthGrid(focused, weekStartsOn);
  const viewMonth = monthKey(focused);
  const monthLabel = parseISODate(`${viewMonth}-01`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const presets: { label: string; iso: string }[] = [
    { label: 'Today', iso: today },
    { label: 'Tomorrow', iso: addDays(today, 1) },
    { label: 'Next week', iso: addDays(today, 7) },
  ];

  return (
    <>
      <span className="relative flex w-full items-center">
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="dialog"
          aria-controls={open ? gridId : undefined}
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openPicker())}
          className={cn(
            inputClassName,
            'flex h-10 items-center gap-2 pl-3 text-left text-body',
            value ? 'pr-9' : 'pr-3',
            !value && 'text-text-muted',
            className,
          )}
          {...aria}
        >
          <Icon icon={Calendar} size="md" className="shrink-0 text-text-muted" />
          {value ? (
            <span className="truncate">
              {formatRelativeDate(value, today)}
              <span className="text-text-muted"> · {formatAbsoluteDate(value)}</span>
            </span>
          ) : (
            placeholder
          )}
        </button>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear due date"
            className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-xs text-text-muted hover:bg-surface-secondary hover:text-text-primary"
          >
            <Icon icon={X} size="sm" />
          </button>
        )}
      </span>

      <Popover
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        initialFocus="none"
        role="dialog"
        aria-label="Choose a due date"
        className="w-[296px] p-3"
      >
        {/* Presets first — they cover the large majority of real due dates. */}
        <div className="mb-3 flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => select(preset.iso)}
              className={cn(
                'h-8 flex-1 rounded-md border border-border text-sm text-text-secondary',
                'hover:border-border-strong hover:text-text-primary',
                value === preset.iso && 'border-primary bg-primary-light text-primary-strong',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFocused(addMonths(focused, -1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary"
          >
            <Icon icon={ChevronLeft} size="md" />
          </button>
          <span className="text-body-strong text-text-primary" aria-live="polite">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setFocused(addMonths(focused, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary"
          >
            <Icon icon={ChevronRight} size="md" />
          </button>
        </div>

        <div
          ref={gridRef}
          id={gridId}
          role="grid"
          aria-label={monthLabel}
          onKeyDown={onGridKeyDown}
          className="grid grid-cols-7 gap-y-0.5"
        >
          <div role="row" className="contents">
            {weekdayLabels(weekStartsOn).map((label, i) => (
              <div
                key={i}
                role="columnheader"
                className="flex h-8 items-center justify-center text-caption text-text-muted"
              >
                {label}
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, week) => (
            <div key={week} role="row" className="contents">
              {cells.slice(week * 7, week * 7 + 7).map((iso) => {
                const isToday = iso === today;
                const isSelected = iso === value;
                const outside = monthKey(iso) !== viewMonth;
                const past = iso < today;
                return (
                  <div
                    key={iso}
                    role="gridcell"
                    aria-selected={isSelected}
                    className="flex items-center justify-center"
                  >
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={iso === focused ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={formatAbsoluteDate(iso)}
                      onClick={() => select(iso)}
                      onFocus={() => setFocused(iso)}
                      className={cn(
                        'h-9 w-9 rounded-md text-sm tabular-nums pointer-coarse:h-11 pointer-coarse:w-11',
                        'hover:bg-surface-secondary',
                        outside ? 'text-text-disabled' : past ? 'text-text-muted' : 'text-text-primary',
                        isToday && !isSelected && 'text-info-strong ring-1 ring-info ring-inset',
                        isSelected && 'bg-primary text-on-primary hover:bg-primary-hover',
                      )}
                    >
                      {parseISODate(iso).getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={() => select(null)}
            className="h-8 w-full rounded-md text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
          >
            No due date
          </button>
        </div>
      </Popover>
    </>
  );
}
