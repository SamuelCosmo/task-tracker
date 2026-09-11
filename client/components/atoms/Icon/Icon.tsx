import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Size → [px, stroke]. Spec: docs/design/02-design-system.md §4.6 */
const SIZE: Record<IconSize, [number, number]> = {
  xs: [14, 1.5], // inside badges and chips (Module 03 §6.2)
  sm: [16, 1.5], // inline with text-sm / text-caption
  md: [20, 1.75], // default: buttons, list-row affordances, field adornments
  lg: [24, 2], // mobile bottom nav, screen headers, FAB
  xl: [32, 2], // empty-state accents
  '2xl': [48, 1.5], // empty-state primary graphic
};

export interface IconProps extends Omit<LucideProps, 'size' | 'strokeWidth' | 'ref'> {
  icon: LucideIcon;
  size?: IconSize;
  /**
   * Accessible name. Leave unset for decorative icons (the default) — they are
   * hidden from assistive tech and the surrounding control carries the label.
   */
  label?: string;
}

/**
 * The single icon primitive. Pins size and stroke to the design scale so no
 * caller picks an arbitrary pixel value, and inherits `currentColor` so the
 * same icon is correct in both themes.
 */
export function Icon({ icon: LucideIcon, size = 'md', label, className, ...rest }: IconProps) {
  const [px, stroke] = SIZE[size];
  return (
    <LucideIcon
      size={px}
      strokeWidth={stroke}
      absoluteStrokeWidth
      className={cn('shrink-0', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    />
  );
}
