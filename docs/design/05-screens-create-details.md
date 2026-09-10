# Module 05 — Screens: Create / Edit Task & Task Details

> Output section 5, part 2 of 4.

---

## Resolved questions from Module 04

**1. "Save and add another" ships on desktop only.**

It is the batch-entry path that QuickAdd cannot serve once details are involved —
planning a week on Sunday evening means five tasks with real due dates and categories,
and reopening a modal four times is four wasted round trips. On mobile the create screen
is full-screen and the FAB is already thumb-adjacent, so the same behavior costs one tap
and the button would spend header width it cannot spare.

**2. Editing is split by interaction model, not by screen.**

- **The create/edit modal requires an explicit Save.** It is a committed editing session
  with multiple fields in flight; auto-saving on blur means an abandoned form silently
  becomes a real edit.
- **The detail view saves immediately, per field.** Status, priority, category, and due
  date are direct-manipulation controls there — choosing "High" from a dropdown *is* the
  action, and asking the user to then press Save is asking them to confirm something
  they already did. The title is inline-editable and commits on `Enter` or blur.

The two models are distinguishable because they look different: the modal has a footer
with buttons, the detail view has no footer at all.

*Why this split rather than one rule:* The detail view is where small corrections happen
("this is actually high priority") and the modal is where whole tasks are composed.
Forcing one model onto both makes one of them tedious.

---

## 5.5 Create Task

### 5.5.1 Entry points

Every one of these lands in the same component with different pre-fill:

| Entry point | Pre-fills |
|---|---|
| Sidebar "New task" / FAB / `N` | Nothing |
| QuickAdd → "Add details" | Whatever was typed, including parsed chips |
| Calendar day cell → `+` | `dueDate` = that day |
| Category page → "New task" | `categoryId` = that category |
| Task list while a filter is active | Any filter that maps to a single value (one category, one priority) |
| Empty state CTA | Nothing |

**Why filters pre-fill the form:** A user viewing `?category=work` who creates a task
almost always means a Work task, and a task that immediately vanishes from the list
because it did not match the active filter reads as a bug.

### 5.5.2 Desktop — modal (≥768px)

```
                    ┌────────────────────────────────────────────────────┐
                    │  New task                                      ✕   │  56px header
                    ├────────────────────────────────────────────────────┤
                    │                                                    │
                    │  Title *                                           │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │ Review the Q3 invoice batch                  │  │  autofocused
                    │  └──────────────────────────────────────────────┘  │
                    │                                                    │
                    │  Description                                       │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │ Cross-check the totals against the ledger    │  │
                    │  │ before sending to finance.                   │  │  auto-grows
                    │  └──────────────────────────────────────────────┘  │
                    │                                                    │
                    │  Priority                Due date                  │
                    │  ┌────────────────────┐  ┌──────────────────────┐  │
                    │  │ Low │Medium│ High  │  │ ▤ Tomorrow · Sep 11 ✕│  │
                    │  └────────────────────┘  └──────────────────────┘  │
                    │                                                    │
                    │  Category                                          │
                    │  ┌──────────────────────┐                          │
                    │  │ ● Work            ⌄  │                          │
                    │  └──────────────────────┘                          │
                    │                                                    │
                    ├────────────────────────────────────────────────────┤
                    │  Cancel      Save and add another     Create task  │  64px footer
                    └────────────────────────────────────────────────────┘
                     560px · radius-xl · shadow-modal · scrim rgba(15,23,42,.5)
```

**Layout rationale:** Title and description are full width because they are open-ended;
priority, due date, and category are compact controls sharing two rows. The form reads
as *"a title, some notes, and three small settings"* rather than as six stacked
questions — and perceived length drives form abandonment more than actual field count.

### 5.5.3 Field specification

| # | Field | Component | Required | Default | Notes |
|---|---|---|---|---|---|
| 1 | Title | `Input` | **Yes** | empty | Autofocused. `maxLength` 120, counter appears at 100. |
| 2 | Description | `Textarea` | No | empty | 4 rows, auto-grows to 240px. `maxLength` 2000. |
| 3 | Priority | `SegmentedControl` | No | **Medium** | Three segments, always visible — no dropdown. |
| 4 | Due date | `DatePicker` | No | **empty** | Presets first. Clearable. |
| 5 | Category | `Select` | No | **Uncategorized** | Options carry their `Dot`; last item is "＋ New category". |
| 6 | Status | `Select` | No | To do | **Hidden on create**, shown on edit. |

**Default rationale:**

- **Priority defaults to Medium, not Low.** Low is a judgement that most tasks do not
  deserve, and a list where everything is Low makes the priority signal useless. Medium
  is the honest "not yet triaged" value.
- **Due date defaults to empty, not today.** Defaulting to today manufactures false
  urgency and, within a week, an overdue list full of tasks the user never intended to
  schedule.
- **Priority is a segmented control, not a dropdown.** Three fixed options, all
  meaningful, chosen on nearly every task — that is exactly the case where a dropdown
  costs an extra click to show information that fits on screen anyway.
- **"＋ New category" is inside the category dropdown.** Otherwise realizing mid-form
  that the right category does not exist means abandoning the form.

### 5.5.4 Validation

| Rule | When | Presentation |
|---|---|---|
| Title required | On submit attempt | Field border `--error-strong`, helper text "Give the task a title", focus moves to the field |
| Title whitespace-only | On submit | Treated as empty, same message |
| Title > 120 chars | While typing | Input stops accepting; counter turns `--error-strong` |
| Description > 2000 chars | While typing | Same |
| Due date in the past | Never invalid | Allowed silently — backdating is legitimate |

**Validation runs on submit, not on blur.** *Why:* Blur validation fires while the user
is still filling the form — tabbing past an empty title on the way to the description
should not paint an error for something they are about to do.

The Save button is **never disabled**. An untouched form with an empty title shows
helper text ("Give the task a title") in `--text-muted`, not an error.

*Why not disable:* A disabled button gives the user no way to find out what is missing —
they press it, nothing happens, and there is no feedback loop. An enabled button that
explains the problem on press is strictly more informative.

### 5.5.5 Submit behavior

| Action | Result |
|---|---|
| **Create task** | Modal closes, task appears in the list with a 200ms highlight flash, toast: "Task created" |
| **Save and add another** *(desktop)* | Modal stays open; title and description clear; **priority, due date, and category persist**; focus returns to title; toast suppressed; the header count increments to "New task · 2 added" |
| **Cancel / `Esc` / scrim** | Closes silently if untouched; prompts "Discard this task?" if any field is dirty |
| **`Cmd/Ctrl + Enter`** | Submits from any field |
| **`Enter` in the title field** | Submits — the title alone is a valid task |

**Why the settings persist in "Save and add another":** Batch entry almost always shares
context — five Work tasks due Friday. Clearing the category and date would make the
feature slower than reopening the modal.

Creation is **optimistic**: the row appears immediately with the server-assigned id
filled in on response. On failure, the row is removed and an error toast offers "Retry",
which reopens the modal with everything the user typed still in place.

### 5.5.6 Mobile — full screen (<768px)

```
┌───────────────────────────────────┐
│  ✕   New task            Create   │  ← sticky header; Create is a text button
├───────────────────────────────────┤
│  Title *                          │
│  ┌───────────────────────────────┐│
│  │ Review the Q3 invoice batch   ││  autofocused, keyboard opens immediately
│  └───────────────────────────────┘│
│                                   │
│  Description                      │
│  ┌───────────────────────────────┐│
│  │ Cross-check the totals…       ││
│  │                               ││
│  └───────────────────────────────┘│
│                                   │
│  Priority                         │
│  ┌───────────────────────────────┐│
│  │  Low  │  Medium  │   High     ││  full width
│  └───────────────────────────────┘│
│                                   │
│  Due date                         │
│  ┌───────────────────────────────┐│
│  │ ▤  Tomorrow · Sep 11       ✕  ││  opens a bottom sheet
│  └───────────────────────────────┘│
│                                   │
│  Category                         │
│  ┌───────────────────────────────┐│
│  │ ●  Work                    ⌄  ││  opens a bottom sheet
│  └───────────────────────────────┘│
│                                   │
└───────────────────────────────────┘
```

| Change | Reason |
|---|---|
| Full screen, not a modal | A modal over a keyboard-shrunk viewport leaves ~a third of the screen usable |
| Create is a header text button, not a footer button | A footer button sits under the keyboard; a header button is always reachable |
| Fields stack, all full width | Two-column controls at 360px give each ~160px, too narrow for the date's "Tomorrow · Sep 11" label |
| ✕ replaces Cancel | Header width is scarce and ✕ is unambiguous next to a titled screen |
| "Save and add another" is absent | Per the resolved question above |
| Date and category open bottom sheets | Popovers anchored near the bottom of a phone open off-screen |

**Keyboard handling:** the form scrolls so the focused field sits just above the keyboard,
with `space-6` of clearance. The header stays pinned. The description's auto-grow is
capped at 3 rows while the keyboard is open, so the following fields stay reachable.

### 5.5.7 Draft persistence

A dirty create form is written to local storage on every change, debounced 500ms, and
restored if the user returns within 24 hours — showing a dismissible "Restored your
draft" bar at the top of the form.

*Why:* On mobile, an incoming call or an app switch destroys the form. Losing typed
content is the one failure in this product that no undo can repair, which is also why
it earns the only confirmation dialog (Module 01 §3.8).

Drafts clear on successful submit and on explicit discard.

---

## 5.6 Edit Task

Identical component, four deltas:

| Delta | Detail |
|---|---|
| Title | "Edit task" |
| Status field | **Visible**, as a `Select` above Priority |
| Primary button | "Save changes", disabled until the form is dirty |
| Footer | No "Save and add another"; a "Delete" `ghost` button in `--error-strong` sits at the far left |

- Cancel on an unmodified form closes silently; on a dirty form it prompts.
- Saving shows "Changes saved" and closes.
- Changing status to Done from the edit form does everything the checkbox does,
  including setting `completedAt` and running the completion animation on the underlying
  row after the modal closes.

**Why Save is disabled here but not on create:** On create, a disabled button hides
*what is missing*. On edit, a disabled button communicates *that nothing has changed* —
which is complete information, not a hidden requirement.

---

## 5.7 Task Details

### 5.7.1 Desktop — side panel (≥1024px)

```
┌──────────────┬────────────────────────────────┬─────────────────────────────┐
│ SIDEBAR      │  Tasks                         │  ✕                    ✎  ⋯  │
│              │  ──────────────────────────    │─────────────────────────────│
│              │  OVERDUE                    3  │                             │
│              │  ┌──────────────────────────┐  │  Review the Q3 invoice      │
│              │  │▌☐ Submit expense report ⋯│  │  batch                      │
│              │  ├──────────────────────────┤  │  ▲ inline-editable, text-h2 │
│              │  │▌☐ Renew the domain     ⋯ │  │                             │
│              │  └──────────────────────────┘  │  [In progress] [Overdue]    │
│              │  TODAY                      4  │                             │
│              │  ┌──────────────────────────┐  │  ┌───────────────────────┐  │
│              │  │▌☐ Review the Q3 invo…  ⋯ │◀─┤  │  ✓  Mark as completed │  │
│              │  │  ← selected, primary-light│  │  └───────────────────────┘  │
│              │  └──────────────────────────┘  │                             │
│              │  …                             │  Status     In progress  ⌄  │
│              │                                │  Priority   High         ⌄  │
│              │                                │  Due date   Sep 8  (2d ago) │
│              │                                │  Category   ● Work       ⌄  │
│              │                                │  ─────────────────────────  │
│              │                                │  Created    1 Sep 2026      │
│              │                                │  Updated    9 Sep 2026      │
│              │                                │  ─────────────────────────  │
│              │                                │  DESCRIPTION                │
│              │                                │  Cross-check the totals     │
│              │                                │  against the ledger before  │
│              │                                │  sending to finance.        │
│              │                                │                             │
└──────────────┴────────────────────────────────┴─────────────────────────────┘
                                                  400px · no scrim · list stays live
```

**No scrim, and the list stays interactive** — that is the entire reason for choosing a
panel over a modal here. Clicking another row swaps the panel's contents without a close
and reopen.

### 5.7.2 Region specifications

#### Header (sticky, 56px)

`✕` at the left; `✎ Edit` and `⋯` overflow at the right. No title text — the task title
is the first thing in the body at `text-h2`, and repeating it in the header would spend
a row on a duplicate.

#### Title

`text-h2` (20/28, 600), **inline-editable**: clicking turns it into a borderless input
with the same type styling, committing on `Enter` or blur and reverting on `Esc`. Wraps
to a maximum of three lines, then scrolls.

*Why inline rather than edit-modal-only:* Fixing a typo in a title is the single most
common edit, and routing it through a modal with a Save button is four interactions for
a two-character change.

#### Badge row

`StatusBadge` plus, when applicable, the `Overdue` badge. `space-2` gap.

#### Primary action

Full-width `Button`, `primary`, 40px, `space-5` margin above and below.

| Task state | Label | Icon | Variant |
|---|---|---|---|
| To do / In progress | Mark as completed | `check` | `primary` |
| Done | Reopen task | `rotate-ccw` | `secondary` |

**Placed above the metadata, not in the header.** It is the action the user came for in
the majority of visits; putting it in a 40px header icon row makes the most important
control the smallest one on the screen.

#### Metadata grid

Two columns: labels in a fixed 96px column, `text-sm` `--text-muted`; values `text-body`
`--text-primary`. Row height 36px.

| Row | Editable | Control |
|---|---|---|
| Status | Yes | Inline `Select`, saves on selection |
| Priority | Yes | Inline `Select` with `PriorityBadge` options |
| Due date | Yes | Inline `DatePicker` trigger |
| Category | Yes | Inline `Select` with `Dot`s |
| — divider — | | |
| Created | No | Absolute date, `--text-muted` |
| Updated | No | Absolute date + relative age, `--text-muted` |

Editable rows show a `⌄` on hover and carry a focus ring; read-only rows have neither, so
the two groups are distinguishable before being clicked. The divider between them makes
that split explicit.

**Dates always show absolute plus relative:** "Sep 8 (2 days ago)". Relative alone is
ambiguous across midnight; absolute alone makes the reader do arithmetic. Overdue due
dates render in `--error-strong` with an `alert-circle`.

Each inline edit saves optimistically and announces politely ("Priority set to High").
On failure the value reverts and an error toast offers Retry.

#### Description

`DESCRIPTION` overline, then `text-body-lg` at `max-width: 65ch`, preserving line breaks.

Empty description → a `ghost` "＋ Add a description" button rather than an empty area.
*Why a button and not blank space:* Blank space reads as a rendering failure; a button
reads as an invitation and costs the same room.

#### Overflow menu

Duplicate, Copy link, then — below a divider — **Delete** in `--error-strong`.

### 5.7.3 Mobile — full screen (<768px)

```
┌───────────────────────────────────┐
│  ←                        ✎   ⋯   │  56px sticky
├───────────────────────────────────┤
│  Review the Q3 invoice batch      │  text-h2, tap to edit
│                                   │
│  [In progress] [Overdue]          │
│                                   │
│  ┌───────────────────────────────┐│
│  │   ✓   Mark as completed       ││  48px, full width
│  └───────────────────────────────┘│
│                                   │
│  Status        In progress     ⌄  │  48px rows (touch)
│  Priority      High            ⌄  │
│  Due date      Sep 8 (2d ago)  ⌄  │
│  Category      ● Work          ⌄  │
│  ─────────────────────────────────│
│  Created       1 Sep 2026         │
│  Updated       9 Sep 2026         │
│  ─────────────────────────────────│
│  DESCRIPTION                      │
│  Cross-check the totals against   │
│  the ledger before sending to     │
│  finance.                         │
│                                   │
└───────────────────────────────────┘
```

Metadata rows grow to 48px for touch. Inline selects open as bottom sheets. The primary
button grows to 48px. No FAB on this screen — the primary action already occupies that
role. Swiping right from the left edge goes back, matching the platform gesture.

### 5.7.4 Panel navigation (desktop)

- `↑`/`↓` move to the previous/next task **in the underlying list's current order**,
  including across group boundaries, without closing the panel.
- The corresponding row scrolls into view and takes the selected style.
- `Esc` closes the panel and returns focus to the row it was showing.
- At the list's end, `↓` does nothing — no wrap.

*Why no wrap:* Silent wrapping makes the user believe they have reviewed everything when
they have looped. A hard stop is a truthful boundary.

### 5.7.5 Delete flow

```
  ⋯ → Delete
        │
        ├─▶ Panel closes immediately
        ├─▶ Row removed from the list immediately
        ├─▶ Toast: "Task deleted · Undo"   (8 seconds)
        │        │
        │        ├─ Undo pressed  ──▶ Row restored in place, panel does not reopen
        │        └─ Toast expires ──▶ DELETE request is sent
        │
        └─▶ Request fails ──▶ Row restored, error toast: "Couldn't delete · Retry"
```

**The request is not sent until the toast expires.** That is what makes undo instant and
truly free rather than a delete-then-recreate that loses the id.

No confirmation dialog. Per Module 01 §1.2 principle 5, undo beats confirm: it is faster
in the common case and safer in the rare one, because confirmation dialogs are dismissed
reflexively.

### 5.7.6 Not-found and error states

| Case | Handling |
|---|---|
| Task id does not exist | Panel/screen shows an `EmptyState`: "This task no longer exists" + "Back to tasks". Desktop closes the panel after the user acknowledges. |
| Task deleted in another tab | Same, on next fetch |
| Load fails | Skeleton is replaced by an inline error with Retry — the panel does not close, so the user does not lose their place in the list |

### 5.7.7 Edge cases

| Case | Handling |
|---|---|
| Title of 120 characters | Wraps to 3 lines in the panel, then scrolls internally; the list row still truncates to one |
| Description of 2000 characters | Panel body scrolls; header and primary action stay sticky |
| Description with URLs | Linkified, `--primary`, underlined on hover, `rel="noopener noreferrer"` |
| Task completed from the list while its panel is open | Panel updates in place; primary action flips to "Reopen task" |
| Category deleted while the panel is open | Category row falls back to "Uncategorized" with a toast |
| Panel open at 1024px, window resized to 900px | Panel becomes a full-screen route; the list is preserved behind it |
| Due date changed to a past date | Overdue badge appears immediately, without a refetch |

---

## 5.8 The three core flows, end to end

**Fastest creation — 2 interactions:**
```
Tap QuickAdd → type "Call the dentist" → Enter
```

**Creation with details — 5 interactions:**
```
N → type title → Tab → pick priority → pick due date → Cmd+Enter
```

**Completion — 1 interaction:**
```
Tap the checkbox (from list, dashboard, calendar, or detail)
```

**Deletion — 2 interactions, reversible for 8 seconds:**
```
⋯ → Delete   (Undo available)
```

These four numbers are the design's actual success criterion. Any change that increases
one of them needs to justify itself against Module 01's principle 3.

---

## Decisions locked by this module

1. "Save and add another" is desktop-only and preserves priority, due date, and category.
2. The modal requires an explicit Save; the detail view saves per field, immediately.
3. Priority defaults to Medium; due date defaults to empty.
4. The create form's Save button is never disabled; the edit form's is, until dirty.
5. Validation runs on submit, never on blur.
6. Title is inline-editable in the detail view.
7. The primary action sits above the metadata, full width — not in the header.
8. Metadata always shows absolute dates with relative age alongside.
9. Delete defers the request until the undo window closes.
10. Create-form drafts persist to local storage for 24 hours.

## Carried into Module 06

- Whether the calendar's month view shows completed tasks by default.
  *(Leaning: yes but at 40% opacity — a month grid is a record of what happened as much
  as a plan, and hiding completed work makes past weeks look empty.)*
- Whether categories support reordering.
  *(Leaning: no in v1 — with 4–8 categories, alphabetical plus a pinned "Uncategorized"
  is sufficient, and drag-reorder would need a keyboard-accessible alternative per
  Module 01.)*
