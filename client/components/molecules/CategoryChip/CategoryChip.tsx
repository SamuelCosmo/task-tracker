import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Chip, PALETTE_TEXT, PALETTE_TINT, type ChipSize } from '@/components/atoms';
import type { Category } from '@/lib/tasks';

export interface CategoryChipProps {
  /** `null` renders the Uncategorized chip. */
  category: Category | null;
  size?: ChipSize;
  /** Wraps the chip in a link to the filtered task list. */
  interactive?: boolean;
  className?: string;
}

/** A Chip in the category's verified colour pair. Fully rounded with a dot —
 *  shape and position are what keep it distinct from squared status badges. */
export function CategoryChip({ category, size = 'md', interactive = false, className }: CategoryChipProps) {
  const color = category?.color ?? 'slate';
  const name = category?.name ?? 'Uncategorized';
  const chip = (
    <Chip size={size} dot={color} className={cn(PALETTE_TINT[color], PALETTE_TEXT[color], className)}>
      {name}
    </Chip>
  );
  if (!interactive) return chip;
  const href = category ? `/tasks?category=${category.id}` : '/tasks?category=none';
  return (
    <Link href={href} className="rounded-full" aria-label={`Show ${name} tasks`}>
      {chip}
    </Link>
  );
}
