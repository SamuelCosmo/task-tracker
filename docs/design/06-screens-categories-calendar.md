# Module 06 — Screens: Categories & Calendar

> Output section 5, part 3 of 4.

---

## Resolved questions

**1. The month view shows completed tasks, at 40% opacity with a struck-through title.**

A month grid is a record of what happened as much as a plan for what is next. Hiding
completed work makes the past two weeks render as empty cells, which is both
demotivating and factually misleading — it looks like nothing was done. 40% opacity puts
them clearly behind pending work in the visual hierarchy without erasing them. A filter
toggle can hide them for users who want a pure forward-looking plan.

**2. Categories do not support reordering in v1.**

With 4–8 categories, alphabetical order with "Uncategorized" pinned last is
deterministic and requires no state. Drag-reorder would need a persisted `order` column,
a keyboard-accessible alternative (Module 01 §1.4), and a mobile long-press interaction
— a meaningful amount of surface for a problem that does not exist at this scale.

**3. Day cells show task titles at `lg`+ and colored dots at `md`; below `md` the
calendar is an agenda list, not a grid.**

The arithmetic decides this. At `lg` the grid is ~1000px wide, so a cell is ~140px —
enough for a truncated title at `text-caption`. At `md` the grid is ~700px, so a cell is
~95px, which after padding leaves ~80px: roughly nine characters, which is not a title,
it is a fragment. Below `md` a seven-column grid gives each day ~45px, at which point a
grid is decorative and an agenda list is the honest form.

---

## 5.9 Categories

### 5.9.1 Purpose

Categories answer "which part of my life is this?" — a low-frequency management screen
whose job is mostly to be a **launchpad into filtered task lists**, not a place users
spend time.

*Why it is deliberately thin:* Category management is setup work. A screen that invites
tinkering with categories is a screen that lets users feel productive without completing
a task.

### 5.9.2 Desktop layout (≥1024px)

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR      │  Categories                              [ ＋ New category ] │
│              │  4 categories · 25 tasks                                     │
│              │                                                              │
│              │  ┌────────────────────────┐  ┌────────────────────────┐      │
│              │  │  ╭──╮                ⋯ │  │  ╭──╮                ⋯ │      │
│              │  │  │▤ │  Work            │  │  │♥ │  Health          │      │
│              │  │  ╰──╯                  │  │  ╰──╯                  │      │
│              │  │  12 tasks · 5 done     │  │  2 tasks · 2 done      │      │
│              │  │  ▬▬▬▬▬▭▭▭▭▭▭▭  42%     │  │  ▬▬▬▬▬▬▬▬▬▬▬▬ 100%     │      │
│              │  └────────────────────────┘  └────────────────────────┘      │
│              │  ┌────────────────────────┐  ┌────────────────────────┐      │
│              │  │  ╭──╮                ⋯ │  │  ╭──╮                ⋯ │      │
│              │  │  │☺ │  Personal        │  │  │✎ │  Study           │      │
│              │  │  ╰──╯                  │  │  ╰──╯                  │      │
│              │  │  4 tasks · 1 done      │  │  7 tasks · 0 done      │      │
│              │  │  ▬▬▬▭▭▭▭▭▭▭▭▭  25%     │  │  ▭▭▭▭▭▭▭▭▭▭▭▭  0%      │      │
│              │  └────────────────────────┘  └────────────────────────┘      │
│              │  ┌────────────────────────┐                                  │
│              │  │  ╭──╮                  │                                  │
│              │  │  │⌗ │  Uncategorized   │  ← always last, no ⋯ menu        │
│              │  │  ╰──╯                  │                                  │
│              │  │  3 tasks · 0 done      │                                  │
│              │  └────────────────────────┘                                  │
└──────────────┴──────────────────────────────────────────────────────────────┘
                 3-up grid at ≥1280px · 2-up at 1024–1279px · space-4 gap
```

### 5.9.3 CategoryCard specification

| Element | Spec |
|---|---|
| Container | `--surface`, `radius-lg`, 1px `--border`, `shadow-card`, `space-5` padding |
| Icon badge | 40px circle, category tint fill, 20px icon in the category color |
| Name | `text-h3`, `--text-primary` |
| Counts | "12 tasks · 5 done", `text-sm`, `--text-muted`, tabular |
| Progress | `ProgressBar`, 6px, track `--surface-secondary`, fill in the **category color** |
| Percentage | `text-caption` tabular, right-aligned on the bar's row |
| Overflow | `⋯` `IconButton`, top-right, hover-revealed on pointer, always visible on touch |

**Whole card is a link** to `/tasks?category=<id>`. Hover raises to `shadow-raised`.

**Progress bars use the category color, not `--primary`.** This is the one place where a
category's color is doing real work rather than decorating — four bars in four colors are
distinguishable at a glance, four indigo bars are not.

**Uncategorized is a real card**, always last, with no overflow menu (it cannot be
edited or deleted) and no progress bar. Per Module 03 §6.0 it is a genuine destination,
because finding untriaged tasks is a real weekly-review need.

### 5.9.4 Create / edit category

Small modal, 440px (bottom sheet on mobile):

```
┌──────────────────────────────────────────────┐
│  New category                            ✕   │
├──────────────────────────────────────────────┤
│  Name *                                      │
│  ┌────────────────────────────────────────┐  │
│  │ Finance                                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Color                                       │
│  ◉  ●  ●  ●  ●  ●  ●  ●                      │  ← 8 swatches, 32px
│  indigo sky emerald amber rose violet teal   │
│                    slate                     │
│                                              │
│  Icon                                        │
│  ┌────────────────────────────────────────┐  │
│  │ ▤  ♥  ☺  ✎  ⌂  ★  ⚑  ⌗  $  ✈  ⚙  ▲   │  │  ← 12 icons, 40px cells
│  └────────────────────────────────────────┘  │
│                                              │
│  Preview   ╭──╮                              │
│            │$ │  Finance                     │
│            ╰──╯                              │
├──────────────────────────────────────────────┤
│  Cancel                        Create        │
└──────────────────────────────────────────────┘
```

| Field | Rules |
|---|---|
| Name | Required, max 24 chars, unique (case-insensitive). Duplicate → "A category called Finance already exists" |
| Color | Required, one of the 8 verified pairs (Module 02 §4.5.5). Selected swatch gets a ring + check |
| Icon | Required, one of 12. Defaults to `tag` |

**A live preview of the resulting chip is shown**, because the choice being made is
purely visual and the swatch grid does not show how the combination will read in a task
row.

**Colors already in use are not disabled**, but carry a small "in use" caption. *Why not
disable:* Two categories in the same color is the user's call — with more than 8
categories it becomes unavoidable — and blocking it would make the eighth category
impossible to create.

**Why 8 colors and 12 icons rather than free input:** Every combination is pre-verified
for contrast in both themes (Module 02 §4.5.5). A hex picker guarantees that someone
eventually chooses something unreadable in dark mode, with no way to fix it afterward.

### 5.9.5 Delete category

The one flow in the product that **requires** a decision rather than offering undo,
because it has two legitimate meanings:

```
┌──────────────────────────────────────────────┐
│  Delete "Work"?                          ✕   │
├──────────────────────────────────────────────┤
│  This category has 12 tasks.                 │
│  What should happen to them?                 │
│                                              │
│  ◉  Keep the tasks, move to Uncategorized    │
│  ○  Delete the 12 tasks as well              │
│                                              │
├──────────────────────────────────────────────┤
│  Cancel                    Delete category   │
└──────────────────────────────────────────────┘
```

- The **safe option is preselected**, and the destructive one is never the default.
- With 0 tasks, the dialog is skipped entirely — delete happens immediately with an undo
  toast, like everything else.
- Choosing "Keep the tasks" is undoable via toast (the category is restored with its
  tasks reassigned back). Choosing "Delete the 12 tasks as well" is **not** undoable and
  the button says so: "Delete category and 12 tasks".

*Why this is the exception to the undo rule:* Undo works when there is exactly one thing
to reverse. Here the system genuinely cannot infer intent, and guessing wrong destroys
twelve tasks.

### 5.9.6 Category detail

`/categories/:id` **is not a separate design.** It renders the Task List (Module 04
§5.2) with `?category=<id>` applied, with three deltas:

- Header shows the category `Dot` + name instead of "Tasks", with a "← All tasks" link
  above it.
- The category chip is absent from `TaskMeta` in every row — it is constant across the
  whole list and would be pure repetition.
- The category's progress bar sits under the header.

*Why reuse rather than design a new screen:* A separate design would duplicate search,
filters, sorting, grouping, and empty states, and the two would drift apart within a
release.

### 5.9.7 Mobile and empty state

**Mobile (<768px):** single-column list of full-width cards, 88px tall, with the icon
badge left, name and counts stacked in the middle, and count + chevron right. The
progress bar spans the card's bottom edge as a 3px full-bleed strip.

**Empty state** (only reachable if the user deletes all four seeds): "No categories yet"
/ "Categories group your tasks by area of life — work, study, health." / `＋ New
category`, with the four seed names offered as one-tap restore chips.

### 5.9.8 Edge cases

| Case | Handling |
|---|---|
| 24-character name in a 140px card | Truncates with ellipsis; full name in `title` and on the detail screen |
| 20 categories | Grid keeps flowing; a search field appears above it past 12 |
| All tasks in one category | Nothing special — the other cards simply show 0 |
| Category with 0 tasks | Progress bar renders as an empty track with "0 tasks"; no percentage shown (0/0 is not 0%) |
| Two categories with the same color | Allowed; the icon and name disambiguate |

---

## 5.10 Calendar / Schedule

### 5.10.1 Purpose

The calendar answers **"when is this happening?"** — a question the list cannot answer,
because a list of dates is not a shape. Its job is to make workload distribution visible:
the Thursday with six tasks and the following week with none.

### 5.10.2 The two problems a task calendar must solve

Neither is obvious, and both drive the layout:

**Problem 1 — overdue tasks live in the past.** An overdue task sits on its original due
date, which scrolls off screen the moment the user navigates to next month. A calendar
that only renders the visible period silently hides the most urgent work in the product.
**Solution:** a persistent **overdue strip** pinned above the grid, present in every view
and every period.

**Problem 2 — tasks without a due date are invisible.** They exist, they matter, and the
calendar cannot place them. **Solution:** an **Unscheduled panel** listing them, from
which a date can be assigned in two taps — turning the calendar into a planning tool
rather than a read-only projection.

### 5.10.3 Desktop — month view (≥1024px)

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR      │  Calendar                       [Month│Agenda]   ⚙ Filters   │
│              │  ‹  September 2026  ›   [Today]                              │
│              ├──────────────────────────────────────────────────────────────┤
│              │  ⚠  3 overdue          Aug 28 · Sep 8 · Sep 9    View all →  │ ← pinned
│              ├──────────────────────────────────────────────────────────────┤
│              │   Mon    Tue    Wed    Thu    Fri    Sat    Sun               │
│              │  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                 │
│              │  │  31 │  1  │  2  │  3  │  4  │  5  │  6  │                 │
│              │  │     │▌Pay │     │▌Dra │     │     │     │                 │
│              │  │     │ rent│     │ ft… │     │     │     │                 │
│              │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│              │  │  7  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │                 │
│              │  │     │▌Sub │▌Ren │╭───╮│▌Call│     │     │                 │
│              │  │     │ mit⚠│ ew ⚠││10 ││ den │     │     │                 │
│              │  │     │     │     │╰───╯│ tist│     │     │                 │
│              │  │     │     │     │▌Rev │▌Book│     │     │                 │
│              │  │     │     │     │▌Cal │ fli │     │     │                 │
│              │  │     │     │     │ +2  │     │     │     │                 │
│              │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│              │  │ 14  │ 15  │ 16  │ 17  │ 18  │ 19  │ 20  │                 │
│              │  …                                                           │
│              │  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                 │
│              │  ▸ Unscheduled (7)                                           │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

Selecting a day opens the **day panel** on the right (the same 400px `SidePanel` used by
task details), listing that day's tasks in full row form with a `＋ Add task for Sep 10`
button at its foot.

*Why a panel rather than expanding the cell:* Expanding a cell reflows the entire grid
and moves every other day under the user's cursor. The panel leaves the month's shape
intact, which is the thing the user came to the calendar to see.

### 5.10.4 Day cell specification

| Property | Value |
|---|---|
| Size | Fluid width (~140px at `lg`), fixed 120px height |
| Radius | `radius-lg` |
| Border | 1px `--border` |
| Fill | `--surface` |
| Date number | `text-sm` tabular, `--text-secondary`, top-left, `space-2` inset |
| Task chips | Max 3, then "+N more" in `text-caption` `--text-muted` |
| Add affordance | `＋` `IconButton`, top-right, hover-revealed |

**Cell states**

| State | Treatment |
|---|---|
| Today | 2px `--info` border, date number in `--info` inside a filled circle |
| Selected | `--primary-light` fill, 1px `--primary` |
| Outside the current month | `--background` fill, date and chips at 45% opacity, still interactive |
| Weekend | `--surface-secondary` fill — a quiet structural cue, no semantic meaning |
| Has overdue tasks | 2px `--error` left edge |
| Empty | Nothing but the date number; the `＋` on hover is the only affordance |

**Task chip inside a cell** (at `lg`+):

```
▌ Review the Q3 inv…      2px priority bar + text-caption title, 20px tall,
                          radius-sm, --surface-secondary fill, 1-line truncated
```

Completed chips render at 40% opacity with a struck-through title (per the resolved
question). Overdue chips carry a trailing 12px `alert-circle` in `--error-strong`.

**Why 3 chips and not "as many as fit":** A variable cap makes row heights unequal and
the grid ragged. A fixed cap keeps every cell the same height, which is what makes the
month scannable as a density map — and density is the entire reason the month view
exists.

### 5.10.5 Tablet — month view (768–1023px)

Cells drop to ~95px wide and 88px tall. **Task chips become dots**: a horizontal row of
up to 5 8px dots in priority colors, then "+N".

```
┌─────┐
│ 10  │
│ ● ● │   ← 8px dots, priority-colored, wrapping to 2 rows max
│ ● +2│
└─────┘
```

Tapping any day opens the day panel, which is where titles are actually read. Dots carry
an `aria-label` ("4 tasks, 1 overdue") so the information is not lost to assistive tech
— the dots are a density signal, not the content.

### 5.10.6 Mobile — agenda view (<768px)

A seven-column grid at 360px gives each day ~45px. The month grid is replaced by an
**agenda list**: a continuous, date-grouped, vertically scrolling list.

```
┌───────────────────────────────────┐
│  Calendar                 ⌕   ⚙   │
│  ‹  September 2026  ›    [Today]  │
├───────────────────────────────────┤
│ ⚠ 3 overdue            View all → │  ← pinned
├───────────────────────────────────┤
│  ▬▬▬  compact month strip  ▬▬▬    │
│  M  T  W  T  F  S  S              │
│  7  8  9 [10] 11 12 13            │  ← one week, swipeable, dots under dates
│     ●  ●   ●●●  ●                 │
├───────────────────────────────────┤
│  TODAY · THU 10 SEP            4  │  ← sticky group header
│  ┌───────────────────────────────┐│
│  │▌☐ Review the Q3 invoice batch ││
│  │▌   ● Work · High              ││
│  ├───────────────────────────────┤│
│  │▌☐ Call the dentist            ││
│  └───────────────────────────────┘│
│  FRI 11 SEP                    2  │
│  ┌───────────────────────────────┐│
│  │▌☐ Book the flights            ││
│  └───────────────────────────────┘│
│  SAT 12 SEP                       │
│  No tasks                         │
│  …                          ╭───╮ │
│                             │ + │ │
├─────────────────────────────╰───╯─┤
│  ⌂     ☑③    ▤      ⌗             │
└───────────────────────────────────┘
```

- A **compact one-week strip** sits above the agenda: seven date cells with density dots,
  swipeable week by week, tapping a date scrolls the agenda to it. It preserves the
  "shape of the week" that the grid provided, at a cost of ~64px.
- Agenda groups are sticky date headers with counts, identical in style to the task
  list's group headers.
- **Empty days render as "No tasks"** in `--text-muted` rather than being skipped.
  *Why:* Skipping them makes a light week look like a dense one, since the user cannot
  see the gaps that are the actual information.
- The agenda loads 30 days forward, extending on scroll; scrolling up loads backward.
- Due-date chips are omitted from rows here — the group header already states the date.

### 5.10.7 Overdue strip

Pinned directly under the period navigation in every view and every period.

| Element | Spec |
|---|---|
| Container | `--error-light` fill, 1px `--error-strong` at 30%, `radius-lg`, 44px tall |
| Icon | `alert-circle` 20px `--error-strong` |
| Text | "3 overdue", `text-body-strong`, `--error-strong` |
| Dates | The overdue dates, `text-sm`, `--text-secondary`, truncating past 3 |
| Action | "View all →" → `/tasks?overdue=true` |

Hidden entirely at zero. Clicking a date jumps the calendar to that date and selects it.

### 5.10.8 Unscheduled panel

A collapsed `▸ Unscheduled (7)` disclosure at the foot of the month view, and a bottom
sheet on mobile.

Expanded, it lists undated tasks as compact rows, each with a `▤ Set date` action that
opens the `DatePicker` directly — **two taps from "unplanned" to "scheduled"**.

On desktop, tasks can also be dragged from the panel onto a day cell, with the drop
target highlighted in `--primary-light`. Per Module 01 §1.4, drag is never the only
path; `Set date` is always present.

*Why this earns its space:* Undated tasks are exactly the ones that get forgotten, and
the calendar is the only screen where their absence is conspicuous. Putting the fix
where the problem is visible is the difference between a calendar that displays a plan
and one that helps make it.

### 5.10.9 Navigation and interaction

| Control | Behavior |
|---|---|
| `‹` / `›` | Previous / next month (or week, in the mobile strip) |
| **Today** | Returns to the current period and selects today; disabled when already there |
| Month label | Click opens a month/year picker |
| `←` `→` | Move the focused day by one |
| `↑` `↓` | Move by one week |
| `PageUp` / `PageDown` | Previous / next month |
| `Home` / `End` | First / last day of the week |
| `T` | Jump to today |
| `Enter` | Open the focused day's panel |
| Swipe left/right (touch) | Previous / next period |

The grid is `role="grid"` with `aria-selected` on the selected day and
`aria-activedescendant` tracking focus. Each cell's accessible name is the full date plus
its task summary: "Thursday 10 September, 4 tasks, 1 overdue".

**Filters apply to the calendar** exactly as they do to the list, sharing the same URL
params — so `?category=2` filters the month grid and the agenda identically. Status
filters default to excluding nothing, so the calendar is complete by default.

### 5.10.10 Week view — deferred

A week view (7 columns × hour rows) is **not** in v1, because tasks in this product have
a due *date*, not a due *time*. An hour grid would render every task in a single
all-day row at the top and leave 90% of the screen empty. It becomes worth designing
only if time-of-day is added to the model.

### 5.10.11 Edge cases

| Case | Handling |
|---|---|
| A day with 12 tasks | 3 chips + "+9 more"; the panel scrolls |
| Month starting on Sunday with a Monday week start | 6-row grid; the grid height adapts, cells keep 120px |
| February in a non-leap year | 5 rows; the container shrinks rather than padding with an empty row |
| Week start preference | Settings-driven (Mon/Sun); headers and grid recompute |
| Locale month/day names | From the browser locale; dates are `Intl`-formatted, never hand-concatenated |
| Task completed from a calendar chip | Chip fades to 40% in place; the day's count updates; it does not disappear |
| Due date changed via drag | Optimistic move, toast: "Moved to Sep 14 · Undo" |
| Navigating 12 months ahead with nothing scheduled | Empty grid with a centered "Nothing scheduled in March 2027" + "Back to today" |
| DST transition | Dates are date-only; all comparisons use local midnight, so no shift occurs |

---

## Decisions locked by this module

1. Completed tasks stay visible in the calendar at 40% opacity.
2. Categories are alphabetical with Uncategorized pinned last; no reordering in v1.
3. Day cells: titles at `lg`+, dots at `md`, agenda list below `md`.
4. A persistent overdue strip appears in every calendar view and period.
5. An Unscheduled panel makes undated tasks schedulable in two taps.
6. Day selection opens a side panel; cells never expand in place.
7. Category cards use the category color for their progress bar.
8. Deleting a non-empty category requires an explicit choice; the safe option is the
   default. Everything else in the product uses undo.
9. Category detail reuses the Task List rather than being its own screen.
10. Week view is deferred until tasks carry a time.

## Carried into Module 07

- Whether empty states use line-art illustrations or icon-in-a-circle.
  *(Leaning: icon-in-a-circle — a bespoke illustration set is a real production and
  maintenance cost, needs two theme variants each, and at this product's tone a 48px
  icon in a tinted circle reads as intentional rather than unfinished.)*
