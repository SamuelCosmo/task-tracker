import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export type EmptyStateSize = 'full' | 'section';

export interface EmptyStateProps {
  icon: LucideIcon;
  /** States the situation. */
  title: string;
  /** Explains or reassures — one sentence, under 12 words where possible. */
  description?: string;
  /** The exit. Every empty state has at least one action, or it is a dead end. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  /** Green icon for the single celebrated state: "All done for today". */
  tone?: 'neutral' | 'success';
  className?: string;
}

/**
 * Icon in a tinted circle, headline, one sentence, action(s). No illustrations:
 * an illustration set is ~24 themed assets for decoration.
 * Spec: docs/design/07-empty-loading-error-states.md §7.2
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'full',
  tone = 'neutral',
  className,
}: EmptyStateProps) {
  const full = size === 'full';
  return (
    <div
      className={cn(
        'mx-auto flex max-w-xs flex-col items-center text-center',
        full ? 'gap-5 py-10' : 'gap-3 py-6',
        className,
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full',
          full ? 'h-24 w-24' : 'h-16 w-16',
          tone === 'success' ? 'bg-success-light text-success-strong' : 'bg-surface-secondary text-text-muted',
        )}
      >
        <Icon icon={icon} size={full ? '2xl' : 'xl'} />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className={cn(full ? 'text-h3' : 'text-body-strong', 'text-text-primary')}>{title}</h3>
        {description && (
          <p className={cn(full ? 'text-body' : 'text-sm', 'text-text-secondary')}>{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-col items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
