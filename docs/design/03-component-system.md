# Module 03 — Component System

> Output section 6. Built entirely from the primitives in Module 02 — no component
> below introduces a color, size, radius, or duration that is not already a token.
>
> Organized by Atomic Design so the structure transfers directly to a component
> directory in either React or React Native.

---

## 6.0 Resolved questions

Three decisions were carried into this module. Resolving them first, because several
components depend on them.

**1. The "Done" status badge is neutral slate, not green.**
Completed tasks should recede. Green is the loudest remaining signal in a palette where
red is already spent on overdue, and spending it on a de-emphasized row inverts the
visual hierarchy — a screen of finished work would shout louder than a screen of
pending work. Done renders as a slate badge with a `check` icon at `--text-muted` on
`--surface-secondary`. Green stays reserved for the completion *animation* and for low
priority, where it is a momentary reward rather than a persistent state.

**2. Priority is a 3px left bar on the row plus a label in the metadata line — not a
third badge.**
A mobile row at 360px cannot fit a title, a status badge, a priority badge, a due date,
and a category. The bar costs three pixels of width, is readable in peripheral vision
while scanning a column, and — critically — is never the only indicator, because the
metadata line always spells out "High". A `PriorityBadge` component still exists, used
in the task detail view and inside the priority selector where there is room.

**3. "Uncategorized" is a real, selectable filter chip.**
Finding untriaged tasks is a genuine weekly-review need. An implicit bucket that cannot
be filtered to is a bucket users cannot clean out.

---

## 6.1 Atomic structure

```
atoms/          Cannot be broken down. Own no business logic. No layout margins.
  Button · IconButton · Input · Textarea · Checkbox · Badge · Chip · Icon
  Spinner · Skeleton · Divider · Label · HelperText · Kbd · Dot · ProgressBar

molecules/      Two or more atoms bound to a single purpose.
  FormField · SearchBar · Select · DatePicker · SegmentedControl · Menu
  PriorityBadge · StatusBadge · CategoryChip · NavItem · TaskMeta
  ProgressRing · Toast · EmptyState · StatTile

organisms/      Compose molecules into a functional region. May hold local UI state.
  TaskItem · TaskList · TaskForm · TaskDetail · QuickAdd · FilterBar
  Sidebar · BottomNav · TopBar · Modal · BottomSheet · SidePanel
  CategoryCard · CalendarGrid

templates/      Layout shells with no data.
  AppShell · ListLayout · DetailLayout · FormLayout

pages/          Route-level compositions. Data fetching lives here and nowhere else.
  Dashboard · Tasks · TaskDetailPage · Calendar · Categories · Settings
```

**Two rules that keep this from decaying:**

- **Atoms and molecules never fetch data and never own margins.** Spacing between
  components belongs to the parent. *Why:* A component that sets its own outer margin
  cannot be reused in a context with different rhythm, which is how design systems
  quietly fork into `Button` and `ButtonInSidebar`.
- **Nothing below `organisms/` knows what a Task is.** `Badge` takes a `tone`, not a
  `priority`. This is what lets the same 15 atoms serve every screen.

---

## 6.2 Atoms

### Button

The primary action atom. Five variants, three sizes.

```
┌──────────────────────────┐
│  ⊕   New task            │   icon (20px) · space-2 · label
└──────────────────────────┘
   ↑ space-4 padding-x, height by size
```

| Variant | Fill | Text | Border | Used for |
|---|---|---|---|---|
| `primary` | `--primary` | `--on-primary` | none | The one main action per screen |
| `secondary` | `--surface` | `--text-primary` | 1px `--border-strong` | Cancel, secondary actions |
| `ghost` | transparent | `--text-secondary` | none | Toolbar actions, low-emphasis |
| `danger` | `--error-strong` | `#ffffff` | none | Delete confirmation only |
| `link` | transparent | `--primary` | none | Inline text actions |

| Size | Height | Padding-x | Text | Icon | Radius |
|---|---|---|---|---|---|
| `sm` | 32px | `space-3` | `text-sm` | 16px | `radius-md` |
| `md` | 40px | `space-4` | `text-body` (500) | 20px | `radius-md` |
| `lg` | 48px | `space-5` | `text-body-lg` (500) | 20px | `radius-md` |

**Props:** `variant`, `size`, `iconLeft`, `iconRight`, `loading`, `disabled`,
`fullWidth`, `onPress`.

**States**

| State | Treatment |
|---|---|
| Hover | `primary` → `--primary-hover`; `secondary`/`ghost` → `--surface-secondary` |
| Active | Additional `scale(0.98)`, 100ms |
| Focus | 2px `--border-focus` ring at 2px offset |
| Loading | Label replaced by a 16px spinner **at the same width**; button stays disabled |
| Disabled | `--surface-secondary` fill, `--text-disabled` label, `aria-disabled="true"` |

**Rules**

- **One `primary` button per screen region.** Two primaries mean neither is primary.
- **Loading must not change width.** Measure the label, lock the width, swap in the
  spinner. *Why:* A shrinking button under the user's cursor causes mis-clicks on
  whatever lands underneath.
- `fullWidth` is the default on mobile for form actions, never on desktop.

---

### IconButton

A `Button` with no label. Square, centered icon.

| Size | Box | Icon | Touch target |
|---|---|---|---|
| `sm` | 32px | 16px | 44px (padded) |
| `md` | 40px | 20px | 44px |
| `lg` | 48px | 24px | 48px |

**Requires `label`** — used as `aria-label` and as the desktop tooltip content. The prop
is mandatory rather than optional; an icon button without a name is unusable to screen
readers and undiscoverable to everyone else.

---

### Input

```
  Title                                          ← Label, text-sm, --text-secondary
┌───────────────────────────────────────────┐
│ ⌕  Review the Q3 invoice batch         ✕  │   ← 40px, radius-md, 1px --border-strong
└───────────────────────────────────────────┘
  Keep it under 120 characters                 ← HelperText, text-sm, --text-muted
```

| Property | Value |
|---|---|
| Height | 40px (`md`), 32px (`sm`) |
| Padding-x | `space-3`; `space-2` when an adornment is present |
| Radius | `radius-md` |
| Border | 1px `--border-strong` |
| Fill | `--surface` |
| Text | `text-body`, `--text-primary` |
| Placeholder | `text-body`, `--text-muted` |

**Props:** `label`, `value`, `placeholder`, `iconLeft`, `iconRight`, `clearable`,
`error`, `helperText`, `size`, `disabled`, `readOnly`, `maxLength`.

**States**

| State | Treatment |
|---|---|
| Hover | Border → `--text-secondary` |
| Focus | Border → `--border-focus` (1px) **plus** the 2px focus ring |
| Error | Border → `--error-strong`, helper text → `--error-strong`, `alert-circle` 16px trailing, `aria-invalid="true"`, helper linked by `aria-describedby` |
| Disabled | `--surface-secondary` fill, `--text-disabled` text, border → `--border` |
| Read-only | `--surface-secondary` fill, `--text-primary` text, **no** border |

**Rules**

- **Labels are always visible and always present.** Placeholder-as-label is prohibited
  (Module 02 §4.11.9).
- **Error text replaces helper text**, it does not stack below it — stacking pushes the
  form down and shifts everything the user was looking at.
- `maxLength` shows a counter only in the last 20 characters of the budget. *Why:* A
  permanently visible counter reads as a constraint on a field that is rarely near it.

---

### Textarea

`Input` geometry with `min-height: 96px` (4 rows), `radius-md`, auto-growing to a
`max-height` of 240px before scrolling internally. Resize handle disabled — manual
resize breaks the layout grid and is redundant with auto-grow.

---

### Checkbox

The most important atom in the product.

| Property | Value |
|---|---|
| Box | 20px × 20px |
| Radius | `radius-xs` (4px) |
| Unchecked | 1.5px `--border-strong` border, transparent fill |
| Checked | `--primary` fill, `--on-primary` check icon (14px, 2px stroke) |
| Indeterminate | `--primary` fill, `--on-primary` 10px dash |
| Hit target | 44px touch / 36px pointer, centered on the box |

**States**

| State | Treatment |
|---|---|
| Hover (unchecked) | Border → `--primary`, fill → `--primary-light` |
| Hover (checked) | Fill → `--primary-hover` |
| Focus | 2px ring at 2px offset |
| Disabled | Border/fill → `--text-disabled`, no hover |

**Check animation:** fill scales from 0.8 → 1 over 150ms while the checkmark path draws
over 150ms. Under `prefers-reduced-motion`, both collapse to a 100ms opacity fade.

**Rules**

- The checkbox is **never** the whole row's click target, and the row is never the
  checkbox's. They are two distinct targets with a gap between them.
  *Why:* Merging them makes "open the task" and "complete the task" the same gesture,
  and one of the two is destructive-feeling to get wrong.
- Toggling is **optimistic**: the UI updates immediately, the request follows, and a
  failure rolls the state back and raises an error toast. *Why:* A 200ms spinner on the
  highest-frequency interaction in the product is 200ms the user notices every time.

---

### Badge

A small, squared, non-interactive status marker.

| Property | Value |
|---|---|
| Height | 22px |
| Padding-x | `space-2` |
| Radius | `radius-sm` (6px) |
| Text | `text-caption` (12/16, 500) |
| Icon | 14px, optional, leading |

**Tones** (generic — the atom knows nothing about tasks):

| Tone | Fill | Text |
|---|---|---|
| `neutral` | `--surface-secondary` | `--text-muted` |
| `primary` | `--primary-light` | `--primary` (light) / `--primary-strong` (dark) |
| `success` | `--success-light` | `--success-strong` |
| `warning` | `--warning-light` | `--warning-strong` |
| `error` | `--error-light` | `--error-strong` |
| `info` | `--info-light` | `--info-strong` |

Every combination above is verified ≥4.5:1 in both themes (Module 02 §4.5.2).

---

### Chip

A **fully rounded**, optionally interactive tag. Deliberately a different shape from
`Badge` so the two are distinguishable at a glance without reading them.

| Property | Value |
|---|---|
| Height | 26px (`md`), 22px (`sm`) |
| Padding-x | `space-3` (`space-2` with a leading dot) |
| Radius | `radius-full` |
| Leading | 8px `Dot`, or a 14px icon |
| Trailing | Optional 14px `✕` when `removable` |

**Variants:** `static` (category display), `selectable` (filter chips — toggles between
outline and filled), `removable` (active filters, quick-add parsed tokens).

**Selected state:** `--primary-light` fill, `--primary` text, 1px `--primary` border, and
a leading 14px `check`. *Why the check:* selection must not rest on fill color alone.

---

### Icon, Spinner, Skeleton, Divider, Dot, Kbd, ProgressBar

| Atom | Spec |
|---|---|
| `Icon` | 16 / 20 / 24 / 32 / 48px per Module 02 §4.6; always `currentColor` |
| `Spinner` | 16 / 20 / 24px; 2px stroke; `--primary` or `currentColor`; 600ms linear rotation; hidden from a11y tree with the live region carrying the message instead |
| `Skeleton` | `--surface-secondary` fill, `radius-sm`; 1.6s shimmer sweeping 100% → −100%; respects reduced-motion by falling back to a static fill |
| `Divider` | 1px `--border`; horizontal full-bleed inside cards, `space-4` inset in lists |
| `Dot` | 8px circle, `radius-full`; category color; **decorative only** — always accompanied by a name |
| `Kbd` | `text-caption` mono, `--surface-secondary` fill, 1px `--border`, `radius-xs`, 4px padding-x |
| `ProgressBar` | 6px tall, `radius-full`, `--surface-secondary` track, `--primary` fill; 280ms width transition; `role="progressbar"` with `aria-valuenow/min/max` |

---

## 6.3 Molecules

### FormField

Wraps any input atom with its label, helper text, error text, and required marker. The
single place where the label/error/`aria-describedby` wiring lives.

**Why a wrapper rather than props on each input:** Otherwise every input atom
re-implements the same three-element layout, and they drift. One wrapper means one
place to fix accessibility wiring.

Optional fields are **not** marked; required fields carry a `*`. In this product only
`title` is required, so marking optional fields would mark almost everything.

---

### SearchBar

```
┌──────────────────────────────────────────────────┐
│ ⌕   Search tasks…                        ⌘K / ✕  │
└──────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Height | 40px desktop, 44px mobile |
| Radius | `radius-md` desktop, `radius-full` mobile |
| Fill | `--surface-secondary`, no border at rest |
| Focus | `--surface` fill, 1px `--border-focus`, plus focus ring |

**Behavior**

- **Debounced at 250ms**, and the URL is updated with `replace`, not `push`.
- The clear `✕` appears only when there is a value; `Esc` clears and keeps focus.
- Results update **in place** — search never navigates to a separate results screen.
  *Why:* Keeping the user on the list preserves their filters and scroll context, and
  makes refining a query a zero-navigation loop.
- A `⌘K`/`Ctrl K` hint sits at the trailing edge on desktop and is hidden on touch.
- Live region announces "12 tasks found" so the result count reaches screen readers.

---

### Select / Menu (Dropdown)

One primitive serving the status selector, sort menu, and row overflow menu.

| Property | Value |
|---|---|
| Trigger | `Input`-shaped (`Select`) or `IconButton` (`Menu`) |
| Surface | `--surface-overlay` (dark) / `--surface` (light), `radius-lg`, `shadow-overlay`, 1px `--border` |
| Item height | 36px |
| Item padding | `space-3` |
| Min width | Trigger width, max 320px |
| Enter | 150ms, scale 0.96 → 1, origin at the trigger |

**Behavior:** opens on click (never hover), closes on `Esc`/outside click/select,
returns focus to the trigger. `↑`/`↓` move, `Enter` selects, typing jumps to a match.
Selected items carry a trailing `check`, not a colored background alone. Destructive
items sit in a final group below a divider, in `--error-strong`.

**Why click and not hover:** Hover menus are unusable on touch and produce accidental
opens while the pointer travels across a toolbar.

---

### DatePicker

Two-part molecule: a text trigger plus a calendar popover.

```
  Due date
┌─────────────────────────────────┐
│ ▤  Tomorrow · Sep 11        ✕   │
└─────────────────────────────────┘
        ↓ opens
┌─────────────────────────────────┐
│  Today   Tomorrow   Next week   │  ← presets, always first
│ ─────────────────────────────── │
│  ‹     September 2026       ›   │
│  M  T  W  T  F  S  S            │
│  1  2  3  4  5  6  7            │
│  8  9 [10] 11 12 13 14          │  ← 10 = today, ringed
│ …                               │
│ ─────────────────────────────── │
│  No due date                    │
└─────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Day cell | 36px square, `radius-md`, `text-sm` tabular |
| Today | 1px `--info` ring, `--info` text |
| Selected | `--primary` fill, `--on-primary` text |
| Outside month | `--text-disabled`, still selectable |
| Past dates | Selectable, `--text-muted` — backdating is legitimate |

**Rules**

- **Presets come before the grid.** "Today", "Tomorrow", "Next week" cover the large
  majority of real due dates in one tap; making users navigate a month grid for
  "tomorrow" is the most common friction point in task apps.
- **"No due date" is an explicit option**, not just a cleared field.
- Trigger shows a **relative label plus the absolute date** ("Tomorrow · Sep 11").
  *Why:* Relative alone is ambiguous after midnight; absolute alone requires the user to
  do date arithmetic.
- Keyboard: arrows move by day, `PageUp/Down` by month, `Home/End` to week bounds,
  `Enter` selects, `Esc` closes. `aria-activedescendant` tracks the focused day.
- Mobile: opens as a bottom sheet, day cells grow to 44px.

---

### SegmentedControl

Used for view switching (All / Today / Upcoming / Completed) and calendar mode.

| Property | Value |
|---|---|
| Height | 36px |
| Track | `--surface-secondary`, `radius-md`, 2px inner padding |
| Segment | `radius-sm`, `text-sm` (500) |
| Selected | `--surface` fill, `--text-primary`, `shadow-card` |
| Motion | Selected background slides 200ms |

`role="tablist"` with arrow-key navigation. Falls back to a horizontally scrollable chip
row below 480px when segment labels would truncate.

---

### StatusBadge · PriorityBadge · CategoryChip

The three task-semantic molecules. Each binds a generic atom to a domain value.

**StatusBadge** — `Badge` with fixed mappings:

| Status | Tone | Icon | Label |
|---|---|---|---|
| To do | `neutral` | `circle` | To do |
| In progress | `primary` | `circle-dot` | In progress |
| Done | `neutral` | `check` | Done |
| *Overdue* (derived overlay) | `error` | `alert-circle` | Overdue |

Overdue is rendered **in addition to** the status badge, never instead of it.

**PriorityBadge** — `Badge` with an icon and label; used in detail and form contexts:

| Priority | Tone | Icon | Bar color (in `TaskItem`) |
|---|---|---|---|
| High | `error` | `chevron-up` | `--error` |
| Medium | `warning` | `minus` | `--warning` |
| Low | `success` | `chevron-down` | `--success` |

The chevron direction means the icon alone communicates rank, which matters for the
red/green confusion pair.

**CategoryChip** — `Chip` with the category's `Dot` (or icon) and name in its verified
color pair from Module 02 §4.5.5. Interactive variant navigates to
`/tasks?category=<id>`.

---

### NavItem

| Property | Value |
|---|---|
| Height | 40px (sidebar), 36px (rail), 56px (bottom bar column) |
| Padding | `space-3` |
| Radius | `radius-md` |
| Icon | 20px (sidebar/rail), 24px (bottom bar) |
| Label | `text-body`; `text-body-strong` when active |
| Badge | Count pill or 8px dot, trailing (sidebar) / top-right of icon (bottom bar) |

**Active:** `--primary-light` fill, `--primary` icon and label, 3px `--primary` left bar
(sidebar/rail) or 2px top bar (bottom nav), plus `aria-current="page"`.
**Hover:** `--surface-secondary` fill.

Three redundant active signals — fill, color, and indicator bar — because the sidebar is
the user's only orientation cue and it must survive both color-blindness and low
contrast conditions.

---

### TaskMeta

The single-line metadata row reused in every task representation.

```
▤ Tomorrow  ·  ● Work  ·  High
```

- Items in fixed order: **due date → category → priority**, separated by a 4px middot at
  `--text-disabled`.
- `text-sm`, `--text-muted`; the due date turns `--error-strong` when overdue and
  `--warning-strong` when due within 2 days.
- Empty items are **omitted**, not rendered as "—". *Why:* Placeholders for absent
  optional data add visual noise proportional to how little the user has filled in.
- Below 380px, the category truncates before the due date; the due date never truncates.

**Date formatting:** "Today", "Tomorrow", "Yesterday", then weekday name within 7 days
("Friday"), then "Sep 24", then "Sep 24, 2027" once the year differs.

---

### ProgressRing · StatTile

**ProgressRing** — 64px, 6px stroke, `--surface-secondary` track, `--primary` fill,
starting at 12 o'clock, 280ms sweep. Center holds the percentage in `text-h3` tabular.
Used once, on the dashboard.

**StatTile** — a small card: 20px icon in a tinted circle, a `text-h1` tabular value, a
`text-sm` `--text-muted` label. Optional trailing delta. Whole tile is a link to the
corresponding filtered list.

**Why the tile is a link:** A count the user cannot act on is trivia. "4 overdue" should
be one tap from the four tasks.

---

### Toast

| Property | Value |
|---|---|
| Position | Bottom-center mobile, bottom-left desktop; 16px from edges, above the bottom nav |
| Surface | `--text-primary` fill with `--surface` text (inverted), `radius-lg`, `shadow-modal` |
| Height | 48px min, max 2 lines |
| Duration | 5s default, **8s when it carries an Undo** |
| Enter/exit | Slide + fade, 200ms / 150ms |
| Stack | Max 3; oldest dismissed first |

**Variants:** `neutral`, `success`, `error` (adds a 16px leading icon), and `undo`
(adds a `link`-variant action).

**The undo contract:** deleting a task removes it from the list immediately and shows
"Task deleted · Undo" for 8 seconds. The destructive request is only committed when the
toast expires. *Why:* This makes delete instant and reversible at once, and it is the
reason the product has no delete confirmation dialog.

Toasts render in an `aria-live="polite"` region; error toasts use `assertive`.

---

### EmptyState

```
        ┌───────────┐
        │    ◇      │      48px line-art icon in a 96px --surface-secondary circle
        └───────────┘
        Nothing due today          text-h3, --text-primary
        You're all caught up.      text-body, --text-secondary, max 40ch
        ┌──────────────┐
        │  + New task  │           primary Button (optional secondary link below)
        └──────────────┘
```

Vertically centered in its container, `space-10` padding, max-width 320px. Full
copy per situation is specified in Module 07.

**Rule:** every empty state has **an icon, a headline, one sentence, and at least one
action**. An empty state without an action is a dead end (Module 01, principle 5).

---

## 6.4 Organisms

### TaskItem

One component, two layout variants. The row is used in lists; the card is used on the
dashboard and in calendar day cells.

```
variant="row"  (desktop, 56px)
┌─┬────────────────────────────────────────────────────────────┬───┐
│▌│  ☐   Review the Q3 invoice batch                           │ ⋯ │
│▌│      ▤ Tomorrow · ● Work · High                            │   │
└─┴────────────────────────────────────────────────────────────┴───┘
 ▲ 3px priority bar, full row height

variant="card"  (dashboard / calendar)
┌────────────────────────────────────────┐
│ ▌ ☐  Review the Q3 invoice batch       │
│ ▌    ▤ Tomorrow · ● Work               │
│ ▌    [In progress]                     │
└────────────────────────────────────────┘
```

| Zone | Content | Width |
|---|---|---|
| Priority bar | 3px, `radius-full`, priority color | fixed |
| Checkbox | `Checkbox`, 44px target | fixed |
| Body | Title (`text-body-strong`, 1 line, truncated) + `TaskMeta` | fluid |
| Trailing | `StatusBadge` (desktop only) + overflow `IconButton` | fixed |

**States**

| State | Treatment |
|---|---|
| Rest | `--surface`, 1px `--border`, `radius-lg`, `shadow-card` |
| Hover | `shadow-raised`, border → `--border-strong`; overflow button fades in |
| Focus (row) | 2px ring at 2px offset around the whole row |
| Selected (keyboard nav) | `--primary-light` fill, 1px `--primary` |
| Completed | 60% opacity, title struck through in `--text-muted`, priority bar → `--border` |
| Overdue | Due date in `--error-strong` + `alert-circle`; priority bar unchanged |
| Dragging | `shadow-modal`, `scale(1.02)`, 4° tilt |

**Rules**

- **The overflow button appears on hover on desktop but is always visible on touch.**
  *Why:* There is no hover on touch; a hover-only affordance is an unreachable feature.
- Completed rows stay in place for 400ms after checking, then animate out of filtered
  views. *Why:* Instant removal makes the user doubt what they clicked and destroys the
  ability to immediately un-check a mis-tap.
- The whole row is a link *except* the checkbox and the overflow button, which stop
  propagation.
- Mobile adds swipe gestures — right to complete, left to reveal delete — but both
  actions remain available in the overflow menu, per Module 01's no-drag-only rule.

---

### TaskList

Owns grouping, virtualization, and the loading/empty branches.

- **Grouping** by the active sort's natural key: due date sort groups into *Overdue,
  Today, Tomorrow, This week, Later, No due date*; priority sort groups into High/
  Medium/Low. Group headers are `text-overline` `--text-muted`, sticky at `z-sticky`,
  with a count.
- **Completed tasks collapse** into a "Completed (12)" disclosure at the bottom, closed
  by default, except in the Completed view.
- **Virtualized above 100 rows**, with row height fixed by the density mode — which is
  why the density decision had to be made in Module 02.
- Gap between rows: `space-2`. Gap between groups: `space-6`.

---

### QuickAdd

```
┌─────────────────────────────────────────────────────────┐
│ ⊕  Add a task…                                          │
└─────────────────────────────────────────────────────────┘
        ↓ focused, with parsed tokens
┌─────────────────────────────────────────────────────────┐
│ ⊕  Pay the electricity bill                             │
│    [● Work ✕] [▤ Tomorrow ✕] [High ✕]        ⏎ to add   │
└─────────────────────────────────────────────────────────┘
```

- Collapsed: 44px, `--surface-secondary`, `radius-md`, `plus` icon + placeholder.
- Focused: expands to show parsed chips and a hint row. `Enter` submits, `Esc` collapses.
- Parses `#category`, `!priority`, and natural dates as the user types (Module 01 §3.6),
  **removing the matched text from the title** and rendering it as a removable chip.
- After submit the field **stays focused and empty** so several tasks can be added in a
  row without re-clicking.
- An "Add details" link opens the full form pre-filled with whatever has been typed —
  nothing typed is ever lost by escalating to the full form.

---

### TaskForm

Used inside a modal (desktop) and as a full screen (mobile). Field order:

1. **Title** — `Input`, autofocused, required
2. **Description** — `Textarea`, optional
3. **Priority** — `SegmentedControl` (Low / Medium / High), defaults Medium
4. **Due date** — `DatePicker`, defaults empty
5. **Category** — `Select` with color dots, defaults Uncategorized
6. **Status** — `Select`, defaults To do; **hidden on create**, shown on edit

**Rules**

- **Status is hidden when creating.** A task being created is by definition "To do";
  showing the field adds a decision with exactly one sensible answer.
- Fields 3–6 sit in a **single two-column row on desktop** and stack on mobile, so the
  form reads as "title, description, and a row of small settings" rather than as six
  stacked questions. *Why:* Perceived form length drives abandonment more than actual
  field count.
- **`Cmd/Ctrl + Enter` submits from anywhere** in the form.
- Save is disabled only while the title is empty, and the reason is shown as helper text
  rather than as an error, since an untouched form is not an error state.
- Editing is **dirty-tracked**: Cancel on an unmodified form closes silently; on a
  modified form it prompts (the single confirmation dialog in the product, per Module 01
  §3.8).

---

### TaskDetail

Side panel (desktop, 400px), full screen (mobile).

```
┌──────────────────────────────────────────┐
│ ← Back                        ✎   ⋯      │  ← header, sticky
├──────────────────────────────────────────┤
│  Review the Q3 invoice batch             │  text-h2
│  [In progress] [Overdue]                 │  badges
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ✓  Mark as completed              │  │  primary, full width
│  └────────────────────────────────────┘  │
│                                          │
│  Priority      High                      │  ← metadata grid, 2 columns
│  Due date      Sep 8, 2026 (2 days ago)  │
│  Category      ● Work                    │
│  Created       Sep 1, 2026               │
│  Updated       Sep 9, 2026               │
│                                          │
│  ─────────────────────────────────────   │
│  Description                             │  text-overline
│  Cross-check the totals against…         │  text-body-lg, max 65ch
└──────────────────────────────────────────┘
```

- **The completion button is the primary action and sits above the metadata**, not in
  the header. It reads "Mark as completed" or "Reopen task" depending on state.
- Metadata is a label/value grid: labels `text-sm` `--text-muted` in a fixed 96px
  column, values `text-body` `--text-primary`.
- Relative age is shown **next to** absolute dates, never instead of them.
- Delete lives in the overflow menu, in `--error-strong`, and triggers the undo toast.
- Desktop: `↑`/`↓` move to the previous/next task in the underlying list without
  closing the panel.

---

### Modal · BottomSheet · SidePanel

| | Modal | BottomSheet | SidePanel |
|---|---|---|---|
| Breakpoint | ≥768px | <768px | ≥1024px |
| Width / height | 560px (440px small), max 90vh | 100% width, max 92vh | 400px, full height |
| Radius | `radius-xl` | `radius-xl` top only | 0 (flush right) |
| Elevation | `shadow-modal` | `shadow-modal` | `shadow-modal` + 1px left `--border` |
| Enter | Fade + scale 0.96→1, 280ms | Slide up, 320ms | Slide from right, 280ms |
| Scrim | `rgba(15,23,42,.5)` light / `rgba(0,0,0,.65)` dark | same | **none** |
| Dismiss | `Esc`, scrim click, ✕ | `Esc`, scrim, swipe down | `Esc`, ✕, outside click |

Shared contract: focus is trapped and restored to the trigger on close; body scroll is
locked; `role="dialog"` with `aria-modal="true"` and `aria-labelledby` on the title;
header and footer are sticky while the body scrolls; a history entry is pushed so system
back closes the overlay.

**The side panel has no scrim** because the list behind it stays interactive — that is
the entire point of choosing a panel over a modal on desktop.

---

### FilterBar

```
┌───────────────────────────────────────────────────────────────┐
│ [All][Today][Upcoming][Completed]      ⇅ Due date   ⚙ Filters │
├───────────────────────────────────────────────────────────────┤
│ ● Work ✕    High ✕    Clear all                               │  ← only when active
└───────────────────────────────────────────────────────────────┘
```

- Sticky below the header at `z-sticky`.
- The **Filters** button carries a count badge when filters are active.
- **Active filters are always shown as removable chips.** *Why:* Hidden active filters
  are the single most common cause of "my task disappeared" — the user must be able to
  see and undo the reason a list looks empty without opening a panel.
- Popover on desktop, bottom sheet on mobile. Filters apply live, with no Apply button;
  Clear all resets to defaults.

---

### Sidebar · BottomNav · TopBar

Per Module 01 §3.2–3.4. Component-level specifics:

**Sidebar (240px)** — logo row (56px), primary `Button` "New task", nav group, a
`CATEGORIES` overline with `NavItem`-styled category rows and counts, then a footer with
the theme toggle and Settings pinned to the bottom. Scrolls internally if categories
overflow; header and footer stay fixed.

**BottomNav (56px + safe area)** — 4 equal columns, 24px icon over an 11px label, 2px
top indicator on the active item, 1px `--border` top edge, `--surface` fill with no
transparency. *Why opaque:* translucent bars over a scrolling list make both the bar and
the list harder to read, for a purely decorative gain.

**TopBar** — 56px mobile / 64px desktop, sticky, `--background` fill with a 1px bottom
border that **appears only once the content has scrolled**. Mobile shows a contextual
title with back/search/overflow; desktop shows the greeting and the search bar.

---

### CategoryCard

`radius-lg` card: a 40px tinted circle with the category icon, name in `text-h3`,
"12 tasks · 4 done" in `text-sm` `--text-muted`, a thin `ProgressBar` in the category
color, and an overflow menu (Edit / Delete). Hover raises to `shadow-raised`. The whole
card links to the filtered list.

Deleting a category asks what happens to its tasks (move to Uncategorized, or delete
them) — this is not undo-able as a single action, so it is one of the few places a
choice is required rather than assumed.

---

## 6.5 Loading states

Four mechanisms, each with a defined trigger. **Skeletons are the default; spinners are
the exception.**

| Mechanism | Used when | Spec |
|---|---|---|
| **Skeleton** | Initial load of a known layout (list, dashboard, detail) | Mirrors the real layout's geometry exactly: 5 skeleton rows at the real row height, with bars at 60%/40% width for title/meta |
| **Inline spinner** | An action inside a button | Replaces the label at locked width |
| **Optimistic update** | Checkbox toggle, quick-add submit, category assign | No loading UI at all; roll back and toast on failure |
| **Progress overlay** | Never in v1 | — |

**Rules**

- **Skeletons must match the real layout's dimensions.** A skeleton that is the wrong
  height causes a layout jump on load, which is worse than a spinner.
- **No loading state below 200ms.** Anything faster flashes and reads as a glitch;
  render the skeleton only after a 200ms delay.
- **Never a full-screen spinner.** The shell — sidebar, header, nav — renders
  immediately and only the content region shows skeletons. *Why:* The chrome is already
  known at first paint (the app is server-rendered), so blanking it discards information
  the user could already be orienting against.
- Loading regions carry `aria-busy="true"`, and completion is announced politely.

---

## 6.6 Naming and file conventions

```
components/
  atoms/Button/{Button.tsx, Button.types.ts, index.ts}
  molecules/SearchBar/…
  organisms/TaskItem/…
```

- **One folder per component**, PascalCase, with a barrel `index.ts`.
- **Props are semantic, never presentational.** `tone="error"`, not `color="red"`;
  `variant="primary"`, not `isBlue`. *Why:* Presentational props hardcode the current
  theme into every call site and make a token change a codebase-wide refactor.
- **Booleans are prefixed** `is` / `has` / `can`, except the shorthand flags
  `disabled`, `loading`, `required`, `readOnly`, which follow platform convention.
- **Every component exposes `testID`** (or `data-testid`) so the same selectors work in
  web and React Native tests.
- **No component sets its own outer margin** (§6.1).

---

## Decisions locked by this module

1. Done is a neutral slate badge; green is reserved for the completion moment and low
   priority.
2. Priority is a 3px left bar plus a metadata label in list contexts, a badge elsewhere.
3. "Uncategorized" is a real, selectable filter chip.
4. `Badge` is squared, `Chip` is fully rounded — shape distinguishes them before color.
5. Completion, quick-add, and category assignment are optimistic with rollback.
6. Delete is instant + undo toast; the only confirmation dialogs are discarding a dirty
   form and deleting a category that owns tasks.
7. Skeletons over spinners; the app shell never blanks.
8. Overflow actions are hover-revealed on pointer, always visible on touch.

## Carried into Module 04

- Whether the dashboard leads with the progress ring or with today's list on mobile.
  *(Leaning: today's list — principle 1 says the next action outranks the summary, and
  the ring costs a full thumb-scroll of vertical space.)*
- Whether calendar day cells show task titles or only count dots at `md` and below.
  *(Leaning: dots below `lg`, titles at `lg`+ — a 40px cell cannot hold readable text.)*
