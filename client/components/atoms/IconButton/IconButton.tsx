import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon, type IconSize } from '@/components/atoms/Icon';
import { Spinner } from '@/components/atoms/Spinner';

export type IconButtonVariant = 'secondary' | 'ghost' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: LucideIcon;
  /**
   * Required. Becomes the accessible name and the desktop tooltip. An icon button
   * without a name is unusable to screen readers and undiscoverable to everyone
   * else — so the type system refuses to let you omit it.
   */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

/* Spec: docs/design/03-component-system.md §6.2 IconButton */

const BASE =
  'relative inline-flex shrink-0 items-center justify-center rounded-md select-none ' +
  'transition-[background-color,color,border-color,transform] duration-(--duration-instant) ' +
  'active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-secondary disabled:text-text-disabled ' +
  'aria-disabled:pointer-events-none aria-disabled:active:scale-100';

const VARIANT: Record<IconButtonVariant, string> = {
  secondary: 'border border-border-strong bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  danger: 'bg-transparent text-error-strong hover:bg-error-light',
};

/* Box size, with the touch target padded out to >=44px via a pseudo-element so
   the visible box stays the size the layout expects. */
const SIZE: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 after:absolute after:-inset-1.5 after:content-[""]',
  md: 'h-10 w-10 after:absolute after:-inset-0.5 after:content-[""]',
  lg: 'h-12 w-12',
};

const ICON: Record<IconButtonSize, IconSize> = { sm: 'sm', md: 'md', lg: 'lg' };

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  onClick,
  ...rest
}: IconButtonProps) {
  const inert = disabled || loading;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : <Icon icon={icon} size={ICON[size]} />}
    </button>
  );
}
