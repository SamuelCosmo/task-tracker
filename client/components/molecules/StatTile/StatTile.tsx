import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export type StatTone = 'neutral' | 'primary' | 'success' | 'info' | 'error';

export interface StatTileProps {
  icon: LucideIcon;
  value: number;
  label: string;
  /** Every tile links somewhere: a count the user cannot act on is trivia. */
  href: string;
  tone?: StatTone;
  className?: string;
}

const ICON_TONE: Record<StatTone, string> = {
  neutral: 'bg-surface-secondary text-text-secondary',
  primary: 'bg-primary-light text-primary-strong',
  success: 'bg-success-light text-success-strong',
  info: 'bg-info-light text-info-strong',
  error: 'bg-error-light text-error-strong',
};

/** Spec: Module 03 §6.3 StatTile, Module 04 §5.1.3 */
export function StatTile({ icon, value, label, href, tone = 'neutral', className }: StatTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card',
        'transition-[box-shadow,border-color] duration-(--duration-base) hover:border-border-strong hover:shadow-raised',
        className,
      )}
    >
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', ICON_TONE[tone])}>
        <Icon icon={icon} size="md" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-h1 tabular-nums leading-none text-text-primary">{value}</span>
        <span className="mt-1 truncate text-sm text-text-muted">{label}</span>
      </span>
    </Link>
  );
}
