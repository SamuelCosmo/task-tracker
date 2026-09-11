import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** The 8 fixed palette names. A palette name, not a domain concept. */
export type PaletteColor = 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal' | 'slate';

export const PALETTE_COLORS: PaletteColor[] = [
  'indigo',
  'sky',
  'emerald',
  'amber',
  'rose',
  'violet',
  'teal',
  'slate',
];

export const PALETTE_BG: Record<PaletteColor, string> = {
  indigo: 'bg-category-indigo',
  sky: 'bg-category-sky',
  emerald: 'bg-category-emerald',
  amber: 'bg-category-amber',
  rose: 'bg-category-rose',
  violet: 'bg-category-violet',
  teal: 'bg-category-teal',
  slate: 'bg-category-slate',
};

export const PALETTE_TEXT: Record<PaletteColor, string> = {
  indigo: 'text-category-indigo',
  sky: 'text-category-sky',
  emerald: 'text-category-emerald',
  amber: 'text-category-amber',
  rose: 'text-category-rose',
  violet: 'text-category-violet',
  teal: 'text-category-teal',
  slate: 'text-category-slate',
};

export const PALETTE_TINT: Record<PaletteColor, string> = {
  indigo: 'bg-category-indigo-tint',
  sky: 'bg-category-sky-tint',
  emerald: 'bg-category-emerald-tint',
  amber: 'bg-category-amber-tint',
  rose: 'bg-category-rose-tint',
  violet: 'bg-category-violet-tint',
  teal: 'bg-category-teal-tint',
  slate: 'bg-category-slate-tint',
};

export interface DotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: PaletteColor;
}

/**
 * 8px colour dot. DECORATIVE ONLY — hidden from assistive tech and always
 * accompanied by a name. Colour never carries meaning alone (Module 02 §4.5.3).
 */
export function Dot({ color = 'slate', className, ...rest }: DotProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', PALETTE_BG[color], className)}
      {...rest}
    />
  );
}
