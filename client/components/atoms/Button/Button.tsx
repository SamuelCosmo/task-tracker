import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms/Icon';
import { Spinner } from '@/components/atoms/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  /** Replaces the label with a spinner at the same width and blocks activation. */
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

/* Spec: docs/design/03-component-system.md §6.2 Button */

const BASE =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md select-none ' +
  'transition-[background-color,color,border-color,transform] duration-(--duration-instant) ' +
  'active:scale-[0.98] ' +
  // Native disabled: fill drops to the inset tone, label to the disabled tier.
  'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-secondary disabled:text-text-disabled ' +
  // Loading uses aria-disabled (not native disabled) so a focused button keeps
  // focus instead of dumping it on <body>. pointer-events-none blocks the click
  // and the hover state; keyboard activation is guarded in the handler.
  'aria-disabled:pointer-events-none aria-disabled:active:scale-100';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'border border-border-strong bg-surface text-text-primary hover:bg-surface-secondary',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
  danger: 'bg-error-strong text-on-error hover:brightness-95 dark:hover:brightness-105',
  link: 'bg-transparent text-primary-strong underline-offset-4 hover:underline disabled:bg-transparent',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-body font-medium',
  lg: 'h-12 gap-2 px-5 text-body-lg font-medium',
};

/* Link buttons keep the height (so they align with siblings) but not the padding. */
const LINK_SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-1 text-sm',
  md: 'h-10 gap-2 px-1 text-body font-medium',
  lg: 'h-12 gap-2 px-1 text-body-lg font-medium',
};

const ICON_SIZE: Record<ButtonSize, 'sm' | 'md'> = { sm: 'sm', md: 'md', lg: 'md' };
const SPINNER_SIZE: Record<ButtonSize, 'sm' | 'md'> = { sm: 'sm', md: 'sm', lg: 'md' };

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  className,
  type = 'button',
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Enter/Space on a focused, loading button still fire a click event.
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={cn(
        BASE,
        VARIANT[variant],
        variant === 'link' ? LINK_SIZE[size] : SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {/* The label stays in the layout but invisible while loading, which is
          what locks the width without measuring anything. */}
      <span className={cn('contents', loading && 'invisible')}>
        {iconLeft && <Icon icon={iconLeft} size={ICON_SIZE[size]} />}
        <span className="truncate">{children}</span>
        {iconRight && <Icon icon={iconRight} size={ICON_SIZE[size]} />}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={SPINNER_SIZE[size]} />
        </span>
      )}
    </button>
  );
}
