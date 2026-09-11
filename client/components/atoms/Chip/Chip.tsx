import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Check, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms/Icon';
import { Dot, type PaletteColor } from '@/components/atoms/Dot';

export type ChipSize = 'sm' | 'md';

interface ChipBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  size?: ChipSize;
  /** Leading 8px colour dot. */
  dot?: PaletteColor;
  /** Leading 14px icon (ignored when `dot` is set). */
  icon?: LucideIcon;
  children: ReactNode;
}

export interface StaticChipProps extends ChipBaseProps {
  variant?: 'static';
}

export interface SelectableChipProps extends ChipBaseProps {
  /** Filter chips. Toggles outline → filled, and shows a leading check when
   *  selected so selection never rests on fill colour alone. */
  variant: 'selectable';
  selected: boolean;
  onSelect: (selected: boolean) => void;
  disabled?: boolean;
}

export interface RemovableChipProps extends ChipBaseProps {
  /** Active filters, quick-add tokens. The ✕ is its own button with its own name. */
  variant: 'removable';
  onRemove: () => void;
  /** Plain-text name for the remove button. Defaults to the chip's text content. */
  label?: string;
  disabled?: boolean;
}

export type ChipProps = StaticChipProps | SelectableChipProps | RemovableChipProps;

/* FULLY ROUNDED on purpose — Badge is squared. Spec: Module 03 §6.2 Chip */
const BASE =
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full text-caption select-none ' +
  'transition-[background-color,color,border-color] duration-(--duration-instant)';

const SIZE: Record<ChipSize, { base: string; withLeading: string }> = {
  sm: { base: 'h-[22px] gap-1 px-2', withLeading: 'h-[22px] gap-1 pl-1.5 pr-2' },
  md: { base: 'h-[26px] gap-1.5 px-3', withLeading: 'h-[26px] gap-1.5 pl-2 pr-3' },
};

const STATIC = 'bg-surface-secondary text-text-secondary';
const OUTLINE =
  'border border-border bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary';
const SELECTED = 'border border-primary bg-primary-light text-primary-strong';
const DISABLED =
  'cursor-not-allowed border-transparent bg-surface-secondary text-text-disabled hover:bg-surface-secondary hover:text-text-disabled';

/* Chip-specific props that must not reach the DOM element. */
const OWN_KEYS = [
  'variant',
  'size',
  'dot',
  'icon',
  'className',
  'children',
  'selected',
  'onSelect',
  'onRemove',
  'label',
  'disabled',
] as const;

function domProps(props: ChipProps): HTMLAttributes<HTMLElement> {
  const out: Record<string, unknown> = { ...props };
  for (const key of OWN_KEYS) delete out[key];
  return out as HTMLAttributes<HTMLElement>;
}

function Leading({ dot, icon }: { dot?: PaletteColor; icon?: LucideIcon }) {
  if (dot) return <Dot color={dot} />;
  if (icon) return <Icon icon={icon} size="xs" />;
  return null;
}

export function Chip(props: ChipProps) {
  const { size = 'md', dot, icon, className, children } = props;
  const sizeClass = dot || icon ? SIZE[size].withLeading : SIZE[size].base;
  const rest = domProps(props);

  if (props.variant === 'selectable') {
    const { selected, onSelect, disabled } = props;
    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => onSelect(!selected)}
        className={cn(BASE, sizeClass, selected ? SELECTED : OUTLINE, disabled && DISABLED, className)}
        {...rest}
      >
        {selected ? <Icon icon={Check} size="xs" /> : <Leading dot={dot} icon={icon} />}
        {children}
      </button>
    );
  }

  if (props.variant === 'removable') {
    const { onRemove, label, disabled } = props;
    const name = label ?? (typeof children === 'string' ? children : 'item');
    function handleRemove(event: MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      onRemove();
    }
    return (
      <span className={cn(BASE, sizeClass, 'pr-1', STATIC, disabled && DISABLED, className)} {...rest}>
        <Leading dot={dot} icon={icon} />
        {children}
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label={`Remove ${name}`}
          className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:bg-border hover:text-text-primary disabled:pointer-events-none"
        >
          <Icon icon={X} size="xs" />
        </button>
      </span>
    );
  }

  return (
    <span className={cn(BASE, sizeClass, STATIC, className)} {...rest}>
      <Leading dot={dot} icon={icon} />
      {children}
    </span>
  );
}
