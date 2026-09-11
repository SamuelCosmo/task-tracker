import { ChevronDown, ChevronUp, Minus, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/atoms';
import { PRIORITY_LABEL, type Priority } from '@/lib/tasks';

/* The chevron direction carries rank on its own, which matters for the
   red/green confusion pair. Module 03 §6.3. */
const PRIORITY: Record<Priority, { tone: BadgeTone; icon: LucideIcon }> = {
  HIGH: { tone: 'error', icon: ChevronUp },
  MEDIUM: { tone: 'warning', icon: Minus },
  LOW: { tone: 'success', icon: ChevronDown },
};

/** Row-bar colour per priority, for TaskItem's 3px left bar. */
export const PRIORITY_BAR: Record<Priority, string> = {
  HIGH: 'bg-priority-high',
  MEDIUM: 'bg-priority-medium',
  LOW: 'bg-priority-low',
};

export interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

/** Used in detail and form contexts where there is room. In list rows,
 *  priority is a 3px bar + a text label in TaskMeta instead. */
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { tone, icon } = PRIORITY[priority];
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
