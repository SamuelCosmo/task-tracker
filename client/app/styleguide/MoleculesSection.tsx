'use client';

import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  Plus,
  SearchX,
  Sun,
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/atoms';
import {
  CategoryChip,
  EmptyState,
  FormField,
  OverdueBadge,
  PriorityBadge,
  ProgressRing,
  SegmentedControl,
  StatTile,
  StatusBadge,
  TaskMeta,
} from '@/components/molecules';
import { todayISO } from '@/lib/dates';
import { PRIORITIES, PRIORITY_LABEL, TASK_STATUSES, type Category, type Priority } from '@/lib/tasks';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Work', color: 'indigo', icon: 'briefcase' },
  { id: 2, name: 'Personal', color: 'rose', icon: 'user' },
  { id: 3, name: 'Study', color: 'violet', icon: 'book-open' },
  { id: 4, name: 'Health', color: 'emerald', icon: 'heart' },
];

function shiftDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-h3 text-text-primary">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-overline uppercase text-text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function MoleculesSection() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [view, setView] = useState<'all' | 'today' | 'upcoming' | 'completed'>('today');
  const [ring, setRing] = useState(58);

  const titleError = title.length > 0 && title.trim().length === 0 ? 'Give the task a title' : undefined;

  return (
    <>
      <Section title="FormField · SegmentedControl">
        <Row label="form field — label, helper, counter in last 20 chars, error replaces helper">
          <div className="w-80">
            <FormField
              label="Title"
              required
              helper="Keep it under 120 characters"
              error={titleError}
              count={{ value: title.length, max: 120 }}
            >
              {(field) => (
                <Input
                  {...field}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type 100+ characters to see the counter"
                />
              )}
            </FormField>
          </div>
          <div className="w-80">
            <FormField label="Description" helper="Optional">
              {(field) => (
                <Textarea {...field} value={notes} onChange={(e) => setNotes(e.target.value)} />
              )}
            </FormField>
          </div>
          <div className="w-80">
            <FormField label="Due date" error="Pick a date in YYYY-MM-DD format">
              {(field) => <Input {...field} defaultValue="not-a-date" />}
            </FormField>
          </div>
        </Row>
        <Row label="segmented — priority (radiogroup, arrows move)">
          <SegmentedControl
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
          />
          <span className="text-sm text-text-muted">selected: {priority}</span>
        </Row>
        <Row label="segmented — views, full width, sm">
          <div className="w-full max-w-md">
            <SegmentedControl
              label="View"
              size="sm"
              fullWidth
              value={view}
              onChange={setView}
              options={[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today', icon: Sun },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'completed', label: 'Completed', disabled: true },
              ]}
            />
          </div>
        </Row>
      </Section>

      <Section title="StatusBadge · PriorityBadge · CategoryChip · TaskMeta">
        <Row label="status — done is neutral, overdue is additive">
          {TASK_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
          <OverdueBadge />
        </Row>
        <Row label="priority — chevron carries rank without colour">
          {PRIORITIES.map((p) => (
            <PriorityBadge key={p} priority={p} />
          ))}
        </Row>
        <Row label="category chips — verified tint pairs, Uncategorized is real">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} category={c} />
          ))}
          <CategoryChip category={null} />
          <CategoryChip category={CATEGORIES[0]} interactive />
        </Row>
        <Row label="task meta — due → category → priority; empties omitted">
          <div className="flex w-full max-w-md flex-col gap-2">
            <TaskMeta dueDate={shiftDays(-2)} category={CATEGORIES[0]} priority="HIGH" done={false} />
            <TaskMeta dueDate={shiftDays(0)} category={CATEGORIES[3]} priority="MEDIUM" done={false} />
            <TaskMeta dueDate={shiftDays(1)} category={CATEGORIES[1]} priority="LOW" done={false} />
            <TaskMeta dueDate={shiftDays(4)} category={CATEGORIES[2]} priority="MEDIUM" done={false} />
            <TaskMeta dueDate={shiftDays(30)} category={null} priority="LOW" done={false} />
            <TaskMeta dueDate={shiftDays(400)} category={CATEGORIES[0]} priority="HIGH" done={false} />
            <TaskMeta dueDate={null} category={CATEGORIES[0]} priority="MEDIUM" done={false} />
            <TaskMeta dueDate={shiftDays(-2)} category={CATEGORIES[0]} priority="HIGH" done />
            <TaskMeta dueDate={shiftDays(0)} category={CATEGORIES[0]} priority="HIGH" done={false} hideCategory />
          </div>
        </Row>
      </Section>

      <Section title="ProgressRing · StatTile · EmptyState">
        <Row label="ring — 100% is the one persistent green">
          <ProgressRing value={ring} label="Today's progress" />
          <ProgressRing value={0} label="Nothing yet" />
          <ProgressRing value={100} label="All done" />
          <Button size="sm" variant="secondary" onClick={() => setRing((r) => (r + 21) % 121)}>
            Advance
          </Button>
        </Row>
        <Row label="stat tiles — every tile is a link">
          <div className="grid w-full max-w-lg grid-cols-2 gap-3">
            <StatTile icon={ListChecks} value={12} label="Pending" href="/tasks?status=todo,in_progress" />
            <StatTile icon={CheckCircle2} value={7} label="Completed" href="/tasks?view=completed" tone="success" />
            <StatTile icon={Calendar} value={4} label="Due today" href="/tasks?view=today" tone="info" />
            <StatTile icon={AlertCircle} value={3} label="Overdue" href="/tasks?overdue=true" tone="error" />
          </div>
        </Row>
        <Row label="empty — first use / cleared / filtered">
          <div className="grid w-full gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={ListChecks}
                title="No tasks yet"
                description="Everything you add will show up here."
                action={<Button iconLeft={Plus}>New task</Button>}
              />
            </div>
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={CheckCircle2}
                tone="success"
                title="All done for today"
                description="7 of 7 tasks completed."
                action={<Button variant="link">View upcoming</Button>}
              />
            </div>
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={SearchX}
                title={'No tasks match "invoice"'}
                description="Try a different word, or clear your filters."
                action={<Button variant="secondary">Clear search</Button>}
                secondaryAction={<Button variant="link">Clear all filters</Button>}
              />
            </div>
          </div>
        </Row>
        <Row label="empty — section size">
          <div className="w-full max-w-sm rounded-lg border border-border">
            <EmptyState
              size="section"
              icon={CircleDashed}
              title="Nothing due today"
              description="You're all caught up. Enjoy the quiet."
              action={<Button variant="link">View upcoming</Button>}
            />
          </div>
        </Row>
      </Section>
    </>
  );
}
