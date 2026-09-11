import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** CSS width — a percentage keeps title bars varied (60/75/45/68/55%). */
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  shape?: 'rect' | 'text' | 'circle';
}

/**
 * Placeholder that mirrors the real element's geometry. Sizes MUST match the
 * final layout or the page jumps on load, which is worse than the wait.
 * The 1.6s shimmer collapses to a static fill under prefers-reduced-motion via
 * the global rule. Hidden from assistive tech — the loading region's
 * `aria-busy` carries the state instead.
 * Spec: docs/design/07-empty-loading-error-states.md §7.5
 */
export function Skeleton({ width, height, shape = 'rect', className, style, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative block overflow-hidden bg-surface-secondary',
        shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        shape === 'text' && 'h-3.5',
        className,
      )}
      style={{ width, height, ...style }}
      {...rest}
    >
      <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-surface to-transparent motion-reduce:hidden" />
    </span>
  );
}
