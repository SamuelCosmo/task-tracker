'use client';

import { useState, type ReactNode } from 'react';
import {
  Calendar,
  CircleDot,
  Copy,
  Home,
  Link2,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react';
import { Button, IconButton } from '@/components/atoms';
import {
  DatePicker,
  FormField,
  Menu,
  NavItem,
  SearchBar,
  Select,
  ToastProvider,
  useToast,
} from '@/components/molecules';
import { PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, TASK_STATUSES, type Priority, type TaskStatus } from '@/lib/tasks';

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

function ToastDemo() {
  const { toast } = useToast();
  const [log, setLog] = useState<string[]>([]);
  const note = (s: string) => setLog((l) => [s, ...l].slice(0, 4));
  return (
    <Row label="toast — undo defers the request until the toast expires">
      <Button size="sm" variant="secondary" onClick={() => toast({ message: 'Task created' })}>
        Neutral
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => toast({ message: 'Changes saved', variant: 'success' })}
      >
        Success
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({
            message: "Couldn't update the task",
            variant: 'error',
            action: { label: 'Retry', onClick: () => note('retry clicked') },
          })
        }
      >
        Error + Retry
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() =>
          toast({
            message: 'Task deleted',
            action: { label: 'Undo', onClick: () => note('UNDO → row restored, no request sent') },
            onExpire: () => note('EXPIRED → DELETE request sent now'),
          })
        }
      >
        Delete (8s undo)
      </Button>
      <ul className="w-full text-sm text-text-muted" aria-live="polite">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Row>
  );
}

export function InteractiveSection() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState('');
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [priority, setPriority] = useState<Priority | null>('MEDIUM');
  const [category, setCategory] = useState<string | null>(null);
  const [due, setDue] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState('');

  return (
    <ToastProvider>
      <Section title="SearchBar · Select · Menu">
        <Row label="search — / or ⌘K focuses, Esc clears, onSearch debounced 250ms">
          <div className="w-full max-w-md">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={setSearched}
              shortcut
              resultsLabel={searched ? `${searched.length} tasks found` : undefined}
            />
          </div>
          <span className="text-sm text-text-muted">debounced: “{searched}”</span>
        </Row>
        <Row label="select — combobox + listbox, typeahead, trailing check">
          <div className="w-56">
            <FormField label="Status">
              {(field) => (
                <Select
                  {...field}
                  value={status}
                  onChange={setStatus}
                  placeholder="Choose a status"
                  options={TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s], text: STATUS_LABEL[s] }))}
                />
              )}
            </FormField>
          </div>
          <div className="w-56">
            <FormField label="Priority">
              {(field) => (
                <Select
                  {...field}
                  value={priority}
                  onChange={setPriority}
                  options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p], text: PRIORITY_LABEL[p] }))}
                />
              )}
            </FormField>
          </div>
          <div className="w-56">
            <FormField label="Category">
              {(field) => (
                <Select
                  {...field}
                  value={category}
                  onChange={setCategory}
                  placeholder="Uncategorized"
                  options={[
                    { value: 'work', label: 'Work', dot: 'indigo' },
                    { value: 'personal', label: 'Personal', dot: 'rose' },
                    { value: 'study', label: 'Study', dot: 'violet' },
                    { value: 'health', label: 'Health', dot: 'emerald' },
                    { value: 'archived', label: 'Archived', dot: 'slate', disabled: true },
                  ]}
                  footer={
                    <Button variant="ghost" size="sm" fullWidth className="justify-start">
                      ＋ New category
                    </Button>
                  }
                />
              )}
            </FormField>
          </div>
          <div className="w-56">
            <FormField label="Disabled" helper="Read-only context">
              {(field) => <Select {...field} value="TODO" onChange={() => {}} disabled options={[{ value: 'TODO', label: 'To do' }]} />}
            </FormField>
          </div>
        </Row>
        <Row label="menu — click to open, destructive last, Esc returns focus">
          <Menu
            trigger={(props) => <IconButton {...props} icon={MoreHorizontal} label="More actions" />}
            groups={[
              [
                { label: 'Edit', icon: Pencil, shortcut: 'E', onSelect: () => setLastAction('Edit') },
                { label: 'Duplicate', icon: Copy, onSelect: () => setLastAction('Duplicate') },
                { label: 'Copy link', icon: Link2, onSelect: () => setLastAction('Copy link'), disabled: true },
              ],
              [{ label: 'Delete', icon: Trash2, destructive: true, shortcut: '⌫', onSelect: () => setLastAction('Delete') }],
            ]}
          />
          <Menu
            align="start"
            trigger={(props) => (
              <Button {...props} variant="secondary" size="sm">
                Sort: Due date
              </Button>
            )}
            groups={[
              [
                { label: 'Due date', onSelect: () => setLastAction('Sort: due') },
                { label: 'Priority', onSelect: () => setLastAction('Sort: priority') },
                { label: 'Recently created', onSelect: () => setLastAction('Sort: created') },
                { label: 'Title A–Z', onSelect: () => setLastAction('Sort: title') },
              ],
            ]}
          />
          <span className="text-sm text-text-muted">last: {lastAction || '—'}</span>
        </Row>
      </Section>

      <Section title="DatePicker · Toast · NavItem">
        <Row label="date picker — presets first, relative · absolute, No due date is explicit">
          <div className="w-72">
            <FormField label="Due date">
              {(field) => <DatePicker {...field} value={due} onChange={setDue} />}
            </FormField>
          </div>
          <div className="w-72">
            <FormField label="Disabled">
              {(field) => <DatePicker {...field} value="2026-09-11" onChange={() => {}} disabled />}
            </FormField>
          </div>
          <span className="text-sm text-text-muted">value: {due ?? 'null'}</span>
        </Row>

        <ToastDemo />

        <Row label="nav — sidebar">
          <div className="flex w-56 flex-col gap-1 rounded-lg border border-border bg-background p-2 pl-4">
            <NavItem href="#" icon={Home} label="Home" variant="sidebar" active />
            <NavItem href="#" icon={ListChecks} label="Tasks" variant="sidebar" badge={3} badgeTone="error" />
            <NavItem href="#" icon={Calendar} label="Calendar" variant="sidebar" />
            <NavItem href="#" icon={Tag} label="Categories" variant="sidebar" badge />
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-2 pl-4">
            <NavItem href="#" icon={Home} label="Home" variant="rail" />
            <NavItem href="#" icon={ListChecks} label="Tasks" variant="rail" active badge={3} badgeTone="error" />
            <NavItem href="#" icon={Calendar} label="Calendar" variant="rail" />
            <NavItem href="#" icon={Tag} label="Categories" variant="rail" />
          </div>
        </Row>
        <Row label="nav — bottom bar (mobile)">
          <div className="flex w-full max-w-sm rounded-lg border border-border bg-surface">
            <NavItem href="#" icon={Home} label="Home" variant="bottom" />
            <NavItem href="#" icon={ListChecks} label="Tasks" variant="bottom" active badge={3} badgeTone="error" />
            <NavItem href="#" icon={Calendar} label="Calendar" variant="bottom" />
            <NavItem href="#" icon={CircleDot} label="Categories" variant="bottom" />
          </div>
        </Row>
      </Section>
    </ToastProvider>
  );
}
