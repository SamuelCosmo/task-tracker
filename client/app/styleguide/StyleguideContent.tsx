'use client';

import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleDot,
  Minus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import ThemeToggle from '@/app/ThemeToggle';
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  Divider,
  Dot,
  HelperText,
  Icon,
  IconButton,
  Input,
  Kbd,
  Label,
  PALETTE_BG,
  PALETTE_COLORS,
  PALETTE_TEXT,
  PALETTE_TINT,
  ProgressBar,
  Skeleton,
  Spinner,
  Textarea,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonVariant,
  type PaletteColor,
} from '@/components/atoms';

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link'];
const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const ICON_BUTTON_VARIANTS: IconButtonVariant[] = ['ghost', 'secondary', 'primary', 'danger'];
const BADGE_TONES: BadgeTone[] = ['neutral', 'primary', 'success', 'warning', 'error', 'info'];
const FILTER_NAMES = ['Work', 'Personal', 'Study', 'Health', 'Uncategorized'] as const;
type FilterName = (typeof FILTER_NAMES)[number];
const FILTER_DOT: Record<FilterName, PaletteColor> = {
  Work: 'indigo',
  Personal: 'rose',
  Study: 'violet',
  Health: 'emerald',
  Uncategorized: 'slate',
};

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

export function StyleguideContent() {
  const [checks, setChecks] = useState({ a: false, b: true, c: false });
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState<Set<FilterName>>(new Set(['Work']));
  const [progress, setProgress] = useState(58);
  const allDone = checks.a && checks.b && checks.c;
  const someDone = !allDone && (checks.a || checks.b || checks.c);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary">Styleguide</h1>
          <p className="text-sm text-text-muted">Phase 1 atoms · 16 of 16 · every state · both themes</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-6">
        <Section title="Button">
          {BUTTON_SIZES.map((size) => (
            <Row key={size} label={`size ${size}`}>
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </Row>
          ))}
          <Row label="with icons">
            <Button iconLeft={Plus}>New task</Button>
            <Button variant="secondary" iconRight={ArrowRight}>
              View all
            </Button>
            <Button variant="ghost" iconLeft={Calendar}>
              Today
            </Button>
            <Button variant="danger" iconLeft={Trash2}>
              Delete
            </Button>
            <Button variant="link" iconRight={ArrowRight}>
              See upcoming
            </Button>
          </Row>
          <Row label="loading — width must not change">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} loading>
                {variant}
              </Button>
            ))}
          </Row>
          <Row label="disabled">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} disabled>
                {variant}
              </Button>
            ))}
          </Row>
          <Row label="full width">
            <Button fullWidth iconLeft={Check}>
              Mark as completed
            </Button>
          </Row>
        </Section>

        <Section title="IconButton">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Row key={size} label={`size ${size}`}>
              {ICON_BUTTON_VARIANTS.map((variant) => (
                <IconButton
                  key={variant}
                  icon={variant === 'danger' ? Trash2 : Pencil}
                  label={`${variant} action`}
                  variant={variant}
                  size={size}
                />
              ))}
            </Row>
          ))}
          <Row label="loading / disabled">
            <IconButton icon={Search} label="Searching" loading />
            <IconButton icon={Search} label="Search" variant="secondary" loading />
            <IconButton icon={Pencil} label="Edit" disabled />
            <IconButton icon={Pencil} label="Edit" variant="primary" disabled />
          </Row>
        </Section>

        <Section title="Checkbox">
          <Row label="states">
            <Checkbox label="Unchecked" />
            <Checkbox label="Checked" checked readOnly />
            <Checkbox label="Indeterminate" indeterminate readOnly />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled checked" disabled checked readOnly />
            <Checkbox aria-label="No visible label" />
          </Row>
          <Row label="interactive — parent reflects children">
            <div className="flex flex-col gap-3">
              <Checkbox
                label="All tasks"
                checked={allDone}
                indeterminate={someDone}
                onChange={(next) => setChecks({ a: next, b: next, c: next })}
              />
              <div className="ml-6 flex flex-col gap-3">
                <Checkbox
                  label="Review the Q3 invoice batch"
                  checked={checks.a}
                  onChange={(next) => setChecks({ ...checks, a: next })}
                />
                <Checkbox
                  label="Call the dentist"
                  checked={checks.b}
                  onChange={(next) => setChecks({ ...checks, b: next })}
                />
                <Checkbox
                  label="Send the sprint summary"
                  checked={checks.c}
                  onChange={(next) => setChecks({ ...checks, c: next })}
                />
              </div>
            </div>
          </Row>
        </Section>

        <Section title="Spinner · Icon">
          <Row label="spinner sizes">
            <Spinner size="sm" label="Loading small" />
            <Spinner size="md" label="Loading medium" />
            <Spinner size="lg" label="Loading large" />
            <span className="text-primary">
              <Spinner label="Inherits colour" />
            </span>
          </Row>
          <Row label="icon sizes — stroke scales with size">
            <Icon icon={Calendar} size="sm" />
            <Icon icon={Calendar} size="md" />
            <Icon icon={Calendar} size="lg" />
            <Icon icon={Calendar} size="xl" />
            <Icon icon={Calendar} size="2xl" className="text-text-muted" />
          </Row>
        </Section>

        <Section title="Input · Textarea">
          <Row label="sizes">
            <div className="w-64"><Input size="md" placeholder="Medium (default)" /></div>
            <div className="w-64"><Input size="sm" placeholder="Small" /></div>
          </Row>
          <Row label="adornments · clearable">
            <div className="w-64"><Input iconLeft={Search} placeholder="Search tasks…" /></div>
            <div className="w-64"><Input iconRight={Calendar} placeholder="Due date" /></div>
            <div className="w-64">
              <Input
                iconLeft={Search}
                clearable
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery('')}
                placeholder="Type to reveal the clear button"
              />
            </div>
          </Row>
          <Row label="invalid · disabled · read-only">
            <div className="w-64"><Input invalid placeholder="Invalid" /></div>
            <div className="w-64"><Input disabled placeholder="Disabled" /></div>
            <div className="w-64"><Input readOnly defaultValue="Read-only value" /></div>
          </Row>
          <Row label="with Label and HelperText (FormField will wire these)">
            <div className="flex w-80 flex-col gap-1.5">
              <Label htmlFor="sg-title" required>Title</Label>
              <Input id="sg-title" placeholder="Review the Q3 invoice batch" aria-describedby="sg-help" />
              <HelperText id="sg-help">Keep it under 120 characters</HelperText>
            </div>
            <div className="flex w-80 flex-col gap-1.5">
              <Label htmlFor="sg-title-err">Title</Label>
              <Input id="sg-title-err" invalid aria-describedby="sg-err" />
              <HelperText id="sg-err" error>Give the task a title</HelperText>
            </div>
          </Row>
          <Row label="textarea — auto-grows to 240px then scrolls">
            <div className="w-80">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cross-check the totals against the ledger before sending to finance."
              />
            </div>
            <div className="w-80"><Textarea disabled placeholder="Disabled" /></div>
          </Row>
        </Section>

        <Section title="Badge · Chip · Dot">
          <Row label="badge tones — squared">
            {BADGE_TONES.map((tone) => (
              <Badge key={tone} tone={tone}>{tone}</Badge>
            ))}
          </Row>
          <Row label="badge with icon">
            <Badge tone="neutral" icon={Circle}>To do</Badge>
            <Badge tone="primary" icon={CircleDot}>In progress</Badge>
            <Badge tone="neutral" icon={Check}>Done</Badge>
            <Badge tone="error" icon={AlertCircle}>Overdue</Badge>
            <Badge tone="error" icon={ChevronUp}>High</Badge>
            <Badge tone="warning" icon={Minus}>Medium</Badge>
            <Badge tone="success" icon={ChevronDown}>Low</Badge>
          </Row>
          <Row label="chip static — fully rounded, with dots">
            {PALETTE_COLORS.map((color) => (
              <Chip key={color} dot={color}>{color}</Chip>
            ))}
          </Row>
          <Row label="chip static — tinted (what CategoryChip will do)">
            {PALETTE_COLORS.map((color) => (
              <Chip key={color} dot={color} className={cn(PALETTE_TINT[color], PALETTE_TEXT[color])}>
                {color}
              </Chip>
            ))}
          </Row>
          <Row label="chip selectable — filter chips">
            {FILTER_NAMES.map((name) => (
              <Chip
                key={name}
                variant="selectable"
                selected={filters.has(name)}
                onSelect={(next) => {
                  const copy = new Set(filters);
                  if (next) copy.add(name);
                  else copy.delete(name);
                  setFilters(copy);
                }}
              >
                {name}
              </Chip>
            ))}
            <Chip variant="selectable" selected={false} onSelect={() => {}} disabled>
              Disabled
            </Chip>
          </Row>
          <Row label="chip removable — active filters">
            {[...filters].map((name) => (
              <Chip
                key={name}
                variant="removable"
                dot={FILTER_DOT[name]}
                onRemove={() => {
                  const copy = new Set(filters);
                  copy.delete(name);
                  setFilters(copy);
                }}
              >
                {name}
              </Chip>
            ))}
            {filters.size === 0 && (
              <span className="text-sm text-text-muted">Select a filter above to see it here.</span>
            )}
            <Chip variant="removable" size="sm" icon={Calendar} onRemove={() => {}}>
              Tomorrow
            </Chip>
          </Row>
          <Row label="dots — decorative, always beside a name">
            {PALETTE_COLORS.map((color) => (
              <span key={color} className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                <Dot color={color} />
                {color}
              </span>
            ))}
          </Row>
        </Section>

        <Section title="ProgressBar · Skeleton · Divider · Kbd">
          <Row label="progress">
            <div className="flex w-80 flex-col gap-3">
              <ProgressBar value={progress} label="Today's progress" />
              <ProgressBar value={42} label="Work" fillClassName={PALETTE_BG.indigo} />
              <ProgressBar value={100} label="Health" fillClassName={PALETTE_BG.emerald} />
              <ProgressBar value={0} label="Study" fillClassName={PALETTE_BG.violet} />
            </div>
            <Button size="sm" variant="secondary" onClick={() => setProgress((p) => (p + 25) % 125)}>
              Advance
            </Button>
          </Row>
          <Row label="skeleton — task row geometry, varied widths">
            <div className="flex w-full max-w-md flex-col gap-2">
              {['60%', '75%', '45%', '68%', '55%'].map((w, i) => (
                <div key={i} className="flex h-14 items-center gap-3 rounded-lg border border-border px-4">
                  <Skeleton shape="circle" width={20} height={20} />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton shape="text" width={w} />
                    <Skeleton height={12} width="40%" />
                  </div>
                </div>
              ))}
            </div>
          </Row>
          <Row label="divider">
            <div className="flex w-80 flex-col gap-3">
              <span className="text-sm">Above</span>
              <Divider />
              <span className="text-sm">Below (full-bleed)</span>
              <Divider inset />
              <span className="text-sm">Below (inset)</span>
            </div>
            <div className="flex h-10 items-center gap-3">
              <span className="text-sm">Left</span>
              <Divider orientation="vertical" />
              <span className="text-sm">Right</span>
            </div>
          </Row>
          <Row label="kbd">
            <span className="inline-flex items-center gap-1 text-sm text-text-muted">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd> to search
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-text-muted">
              <Kbd>N</Kbd> new task
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-text-muted">
              <Kbd>Esc</Kbd> close
            </span>
          </Row>
        </Section>
      </div>
    </div>
  );
}
