import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/atoms';

export type NavItemVariant = 'sidebar' | 'rail' | 'bottom';
export type NavBadgeTone = 'primary' | 'error';

export interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  variant?: NavItemVariant;
  /** A count renders a pill; `true` renders an 8px dot. Overdue counts use `error`. */
  badge?: number | true;
  badgeTone?: NavBadgeTone;
  className?: string;
}

/* --- badge --------------------------------------------------------------- */

const BADGE_TONE: Record<NavBadgeTone, string> = {
  primary: 'bg-primary text-on-primary',
  error: 'bg-error-strong text-on-error',
};

function NavBadge({ badge, tone }: { badge: number | true; tone: NavBadgeTone }) {
  if (badge === true) {
    return <span aria-hidden className={cn('h-2 w-2 rounded-full', BADGE_TONE[tone])} />;
  }
  return (
    <span
      className={cn(
        'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-caption tabular-nums',
        BADGE_TONE[tone],
      )}
    >
      {badge}
    </span>
  );
}

/** Suffix for the accessible name when the label itself is not visible. */
function badgeSuffix(badge: number | true | undefined): string {
  if (badge === undefined) return '';
  return badge === true ? ' (attention)' : ` (${badge})`;
}

/* --- variants ------------------------------------------------------------ */

type VariantProps = Required<Pick<NavItemProps, 'href' | 'icon' | 'label' | 'active'>> &
  Pick<NavItemProps, 'badge' | 'className'> & { badgeTone: NavBadgeTone };

/** Mobile bottom bar: icon over label, 2px top indicator. */
function BottomNavItem({ href, icon, label, active, badge, badgeTone, className }: VariantProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-label={`${label}${badgeSuffix(badge)}`}
      className={cn(
        'relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 select-none',
        'before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:content-[""]',
        active ? 'text-primary-strong before:bg-primary' : 'text-text-muted before:bg-transparent',
        className,
      )}
    >
      <span className="relative">
        <Icon icon={icon} size="lg" />
        {badge !== undefined && (
          <span className="absolute -top-1 -right-2">
            <NavBadge badge={badge} tone={badgeTone} />
          </span>
        )}
      </span>
      <span className="text-[11px] leading-4 font-medium">{label}</span>
    </Link>
  );
}

/** Desktop sidebar (icon + label + trailing badge) and tablet rail (icon only,
 *  label as tooltip and accessible name). Both carry the 3px left indicator. */
function SideNavItem({ href, icon, label, active, badge, badgeTone, className, rail }: VariantProps & { rail: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-label={rail ? `${label}${badgeSuffix(badge)}` : undefined}
      title={rail ? label : undefined}
      className={cn(
        'relative flex items-center rounded-md select-none',
        'transition-colors duration-(--duration-instant)',
        rail ? 'h-9 w-9 justify-center' : 'h-10 gap-3 px-3',
        'before:absolute before:top-2 before:bottom-2 before:-left-2 before:w-0.75 before:rounded-full before:content-[""]',
        active
          ? 'bg-primary-light text-primary-strong before:bg-primary'
          : 'text-text-secondary before:bg-transparent hover:bg-surface-secondary hover:text-text-primary',
        className,
      )}
    >
      <span className="relative shrink-0">
        <Icon icon={icon} size="md" />
        {rail && badge !== undefined && (
          <span className="absolute -top-1.5 -right-1.5">
            <NavBadge badge={badge} tone={badgeTone} />
          </span>
        )}
      </span>
      {!rail && (
        <>
          <span className={cn('flex-1 truncate', active ? 'text-body-strong' : 'text-body')}>{label}</span>
          {badge !== undefined && <NavBadge badge={badge} tone={badgeTone} />}
        </>
      )}
    </Link>
  );
}

/**
 * One nav primitive for the desktop sidebar, tablet icon rail and mobile bottom
 * bar. Three redundant active signals — fill, colour, indicator bar — plus
 * aria-current, because the nav is the user's only orientation cue and it must
 * survive colour-blindness and low contrast.
 * Spec: docs/design/03-component-system.md §6.3 NavItem
 */
export function NavItem({
  variant = 'sidebar',
  active = false,
  badgeTone = 'primary',
  ...rest
}: NavItemProps) {
  const props = { ...rest, active, badgeTone };
  if (variant === 'bottom') return <BottomNavItem {...props} />;
  return <SideNavItem {...props} rail={variant === 'rail'} />;
}
