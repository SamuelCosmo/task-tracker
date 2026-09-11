import type { ReactNode } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Dot, Icon } from '@/components/atoms';
import { formatAbsoluteDate, formatRelativeDate, isDueSoon, isOverdue, todayISO } from '@/lib/dates';
import { PRIORITY_LABEL, type Category, type Priority } from '@/lib/tasks';

export interface TaskMetaProps {
  dueDate: string | null;
  category: Category | null;
  priority: Priority;
  done: boolean;
  /** Omit the category when the list is already filtered to one. */
  hideCategory?: boolean;
  /** Injectable for tests and for the calendar (which knows its own "today"). */
  today?: string;
  className?: string;
}

/**
 * The single-line metadata row reused in every task representation.
 * Fixed order: due date → category → priority. Empty items are OMITTED, not
 * rendered as "—". The due date never truncates; the category does first.
 * Spec: docs/design/03-component-system.md §6.3 TaskMeta
 */
export function TaskMeta({
  dueDate,
  category,
  priority,
  done,
  hideCategory = false,
  today = todayISO(),
  className,
}: TaskMetaProps) {
  const overdue = isOverdue(dueDate, done, today);
  const dueSoon = isDueSoon(dueDate, done, today);

  const items: ReactNode[] = [];

  if (dueDate) {
    items.push(
      <time
        key="due"
        dateTime={dueDate}
        title={formatAbsoluteDate(dueDate)}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 whitespace-nowrap',
          overdue && 'text-error-strong',
          dueSoon && 'text-warning-strong',
        )}
      >
        <Icon icon={overdue ? AlertCircle : Calendar} size="xs" />
        {formatRelativeDate(dueDate, today)}
      </time>,
    );
  }

  if (!hideCategory) {
    items.push(
      <span key="cat" className="inline-flex min-w-0 items-center gap-1.5">
        <Dot color={category?.color ?? 'slate'} />
        <span className="truncate">{category?.name ?? 'Uncategorized'}</span>
      </span>,
    );
  }

  items.push(
    <span key="pri" className="shrink-0 whitespace-nowrap">
      {PRIORITY_LABEL[priority]}
    </span>,
  );

  return (
    <div className={cn('flex min-w-0 items-center gap-2 text-sm text-text-muted', className)}>
      {items.map((item, index) => (
        <span key={index} className="contents">
          {index > 0 && (
            <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-text-disabled" />
          )}
          {item}
        </span>
      ))}
    </div>
  );
}
