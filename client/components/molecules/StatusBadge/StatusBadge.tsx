import { AlertCircle, Check, Circle, CircleDot, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/atoms';
import { STATUS_LABEL, type TaskStatus } from '@/lib/tasks';

/* Done is NEUTRAL, not green: completed tasks should recede, and green is the
   loudest signal left once red is spent on overdue. Module 03 §6.0. */
const STATUS: Record<TaskStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  TODO: { tone: 'neutral', icon: Circle },
  IN_PROGRESS: { tone: 'primary', icon: CircleDot },
  DONE: { tone: 'neutral', icon: Check },
};

export interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { tone, icon } = STATUS[status];
  return (
    <Badge tone={tone} icon={icon} className={className}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

/** Rendered IN ADDITION to the status badge, never instead of it. */
export function OverdueBadge({ className }: { className?: string }) {
  return (
    <Badge tone="error" icon={AlertCircle} className={className}>
      Overdue
    </Badge>
  );
}
