import type { HTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms/Icon';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: ReactNode;
}

/* Every fill/text pair here is verified >=4.5:1 in both themes
   (docs/design/02-design-system.md §4.5.2). The atom knows nothing about tasks:
   StatusBadge and PriorityBadge (molecules) map domain values onto tones. */
const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-secondary text-text-muted',
  primary: 'bg-primary-light text-primary-strong',
  success: 'bg-success-light text-success-strong',
  warning: 'bg-warning-light text-warning-strong',
  error: 'bg-error-light text-error-strong',
  info: 'bg-info-light text-info-strong',
};

/**
 * Small, SQUARED, non-interactive status marker. Squared on purpose — Chip is
 * fully rounded, so the two are told apart by shape before colour.
 * Spec: docs/design/03-component-system.md §6.2 Badge
 */
export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-sm px-2 text-caption',
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {icon && <Icon icon={icon} size="xs" />}
      {children}
    </span>
  );
}
