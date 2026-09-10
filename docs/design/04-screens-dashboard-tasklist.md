# Module 04 — Screens: Dashboard & Task List

> Output section 5, part 1 of 4. Every element referenced here is a component defined
> in Module 03; nothing new is invented at screen level.

---

## Resolved question from Module 03

**The mobile dashboard leads with today's list, not the progress ring.**

The 64px ring plus its card costs roughly 140px — about a fifth of a phone viewport —
to communicate a number the user cannot act on. Module 01's first principle ranks the
next action above the summary, so on mobile the ring is replaced by a **32px-tall
progress strip** (a `ProgressBar` with "7 of 12 done today" beside it) that sits *below*
the today list. The full ring is kept on tablet and desktop, where it occupies a right
rail that costs the task list nothing.

---

## 5.1 Dashboard

### 5.1.1 Purpose

The dashboard answers three questions in this order:

1. **What needs my attention right now?** (overdue + due today)
2. **Can I capture something quickly?** (quick add)
3. **How am I doing?** (progress, counts)

Anything that does not serve one of those three is not on this screen.

### 5.1.2 Desktop layout (≥1024px)

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR      │  Good morning, Samuel                        [⌕ Search…  ⌘K] │
│  240px       │  Wednesday, 10 September                                     │
│              │                                                              │
│              │  ┌────────────────────────────────────────────────────────┐  │
│  + New task  │  │ ⊕  Add a task…                                         │  │
│              │  └────────────────────────────────────────────────────────┘  │
│  ⌂ Home      │                                                              │
│  ☑ Tasks  ③  │  ┌──────────────────────────────────┐ ┌────────────────────┐│
│  ▤ Calendar  │  │ ⚠ 3 overdue tasks      View all →│ │  Today's progress  ││
│  ⌗ Categories│  └──────────────────────────────────┘ │                    ││
│              │                                       │       ╭─────╮      ││
│  CATEGORIES  │  Today                        4 tasks │       │ 58% │      ││
│  ● Work   12 │  ┌────────────────────────────────┐   │       ╰─────╯      ││
│  ● Personal 4│  │▌☐ Review the Q3 invoice batch ⋯│   │     7 of 12 done   ││
│  ● Study   7 │  │▌   ▤ Today · ● Work · High     │   │                    ││
│  ● Health  2 │  ├────────────────────────────────┤   ├────────────────────┤│
│              │  │▌☐ Call the dentist           ⋯ │   │ ☑ 12    Pending    ││
│              │  │▌   ▤ Today · ● Health · Medium │   │ ✓  7    Completed  ││
│              │  ├────────────────────────────────┤   │ ▤  4    Due today  ││
│  ☀ Theme     │  │▌☑ Send the sprint summary    ⋯ │   │ ⚠  3    Overdue    ││
│  ⚙ Settings  │  │▌   ▤ Today · ● Work            │   ├────────────────────┤│
│              │  └────────────────────────────────┘   │  Quick actions     ││
│              │                                       │  + New task        ││
│              │  Recently updated                     │  ▤ Today's tasks   ││
│              │  ┌────────────────────────────────┐   │  ⚠ Overdue         ││
│              │  │▌☐ Draft the Q4 roadmap       ⋯ │   │  ⌗ New category    ││
│              │  │▌   ▤ Friday · ● Work · High    │   └────────────────────┘│
│              │  ├────────────────────────────────┤        320px fixed      │
│              │  │▌☐ Book the flights           ⋯ │                         │
│              │  └────────────────────────────────┘                         │
└──────────────┴─────────────────────────────────────────────────────────────┘
                 fluid main column          space-6 gap      right rail
```

**Why tasks are on the left and stats on the right:** Western reading order puts the
first fixation top-left. The actionable column earns that position; the summary column
is supporting evidence and can afford to be found second. Reversing this is the most
common dashboard mistake — it leads with a number and buries the work.

### 5.1.3 Region specifications

#### Greeting header

| Element | Spec |
|---|---|
| Greeting | `text-display` (32/40, 600), `--text-primary` |
| Date | `text-body`, `--text-secondary`, full format: "Wednesday, 10 September" |
| Search | `SearchBar`, 320px, right-aligned, desktop only |
| Padding | `space-8` top, `space-6` bottom |

Greeting text switches on local time: **Good morning** (<12:00), **Good afternoon**
(12:00–17:59), **Good evening** (≥18:00). Name comes from settings; with no name set it
falls back to "Good morning" with no comma.

*Why a greeting at all:* It is the cheapest available signal that the app is a personal
tool rather than a database front-end, and it gives the date a natural home — and the
date is genuinely load-bearing on a screen whose entire content is relative to "today".

#### QuickAdd

Full width of the main column, directly under the greeting. Spec in Module 03 §6.4.
On this screen it is **not** autofocused.

*Why not autofocused:* The dashboard is opened to read as often as to write. Stealing
focus means a user who opened it to check their day and pressed `↓` types into a field
instead of scrolling.

#### Overdue callout (conditional)

Renders only when `overdueCount > 0`.

| Element | Spec |
|---|---|
| Container | `--error-light` fill, 1px `--error-strong` at 30% opacity, `radius-lg`, `space-4` padding |
| Icon | `alert-circle`, 20px, `--error-strong` |
| Text | "3 overdue tasks" — `text-body-strong`, `--error-strong` |
| Action | "View all →" `link` Button to `/tasks?status=todo,in_progress&overdue=true` |

It is a **single summary bar, not a list**. The overdue tasks themselves already appear
at the top of the Today section; listing them twice would make a bad day look
catastrophic and push the actionable list below the fold.

#### Today section

The core of the screen.

**Contents:** all tasks that are overdue **or** due today, in any non-`DONE` status,
plus tasks completed today (so the section reflects the day's actual shape).

**Sort order:**
1. Overdue, by due date ascending (oldest first)
2. Due today, by priority descending, then by creation time
3. Completed today, always last, at 60% opacity

**Cap: 7 items**, then a "View all 14 →" link. *Why 7:* Beyond that the list stops being
a focus list and becomes a task list — and there is a whole screen for that. A capped
list also guarantees the "Recently updated" section stays reachable without scrolling
past an unbounded region.

Section header: "Today" in `text-h3`, with the count in `text-sm` `--text-muted`
right-aligned.

#### Progress card

| Element | Spec |
|---|---|
| Container | `--surface`, `radius-lg`, 1px `--border`, `shadow-card`, `space-5` padding |
| Title | "Today's progress", `text-h3` |
| Ring | `ProgressRing` 64px, centered, `--primary` fill |
| Caption | "7 of 12 done", `text-sm`, `--text-muted`, tabular |

**Denominator is today's tasks only**, not all tasks ever.
*Why:* An all-time completion percentage converges toward a meaningless constant within
weeks and can never be moved by a good day. A daily denominator makes the ring
responsive to actual effort, which is the only thing that makes a progress indicator
motivating rather than decorative.

At 100%, the ring switches to `--success`, the caption reads "All done for today", and a
`check-circle` replaces the percentage. This is the one place green is spent on a
persistent state, and it is earned.

#### Stat tiles

Four `StatTile`s in a 2×2 grid inside the right rail: **Pending**, **Completed**,
**Due today**, **Overdue**.

| Tile | Value | Links to |
|---|---|---|
| Pending | count of `TODO` + `IN_PROGRESS` | `/tasks?status=todo,in_progress` |
| Completed | count of `DONE` | `/tasks?view=completed` |
| Due today | count due today, not done | `/tasks?view=today` |
| Overdue | count overdue | `/tasks?overdue=true` |

Every tile is a link (Module 03 §6.3). The Overdue tile renders in `error` tone when
non-zero and in `neutral` tone at zero — so a good day looks calm rather than
permanently alarming.

#### Quick actions

Four `ghost` buttons stacked in the rail: New task, Today's tasks, Overdue, New category.

*Why these four:* One create action, two high-frequency filtered views, and the only
setup action a user performs more than once. Anything else on this list would be a
shortcut to something already one click away in the sidebar.

#### Recently updated

Last 5 tasks by `updatedAt` within the past 7 days, **excluding anything already shown
in the Today section**.

*Why exclude:* A task edited this morning and due today would otherwise appear twice on
one screen, which makes the dashboard look like it is padding itself.

Empty within 7 days → the section is omitted entirely, not shown empty. A dashboard
section that says "nothing here" for a *supporting* region is noise; empty states are
for primary content.

### 5.1.4 Tablet layout (768–1023px)

The right rail moves **below** the main column and becomes a horizontal band:

```
┌────┬──────────────────────────────────────────────┐
│ +  │  Good morning, Samuel                        │
│ ⌂  │  Wednesday, 10 September          [⌕ Search] │
│ ☑ ③│  ┌────────────────────────────────────────┐  │
│ ▤  │  │ ⊕  Add a task…                         │  │
│ ⌗  │  └────────────────────────────────────────┘  │
│    │  ⚠ 3 overdue tasks                View all → │
│ ⚙  │  Today                              4 tasks  │
│    │  [ task rows … ]                             │
│    │  ┌──────────┬──────────────────────────────┐ │
│    │  │  ╭────╮  │ ☑ 12  ✓ 7  ▤ 4  ⚠ 3          │ │
│    │  │  │58% │  │ (4 stat tiles in a row)      │ │
│    │  │  ╰────╯  │                              │ │
│    │  └──────────┴──────────────────────────────┘ │
│    │  Recently updated                            │
└────┴──────────────────────────────────────────────┘
```

Progress ring and stat tiles share one card, ring left at a fixed 140px, tiles in a 4-up
row. Quick actions are dropped — at this width the icon rail is one tap away and the
buttons would be pure duplication.

### 5.1.5 Mobile layout (<768px)

```
┌───────────────────────────────────┐
│ Good morning              ⌕   ⋮   │  ← TopBar, 56px, sticky
├───────────────────────────────────┤
│ Samuel                            │  text-h1 (24px, not 32)
│ Wednesday, 10 September           │  text-sm, --text-muted
│                                   │
│ ┌───────────────────────────────┐ │
│ │ ⊕  Add a task…                │ │  ← QuickAdd, 44px
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ ⚠ 3 overdue          View all→│ │
│ └───────────────────────────────┘ │
│                                   │
│ Today                    4 tasks  │
│ ┌───────────────────────────────┐ │
│ │▌☐ Review the Q3 invoice batch │ │  ← 64px rows
│ │▌   ▤ Today · ● Work           │ │
│ ├───────────────────────────────┤ │
│ │▌☐ Call the dentist            │ │
│ │▌   ▤ Today · ● Health         │ │
│ └───────────────────────────────┘ │
│           View all 14 →           │
│                                   │
│ ▬▬▬▬▬▬▬▬▬▬▬▭▭▭▭  7 of 12 done     │  ← 32px progress strip, not a ring
│                                   │
│ ┌────────┬────────┬───────┬─────┐ │
│ │ ☑ 12   │ ✓ 7    │ ▤ 4   │ ⚠ 3 │ │  ← stat tiles, 2×2 below 400px
│ │Pending │Complete│ Today │ Over│ │
│ └────────┴────────┴───────┴─────┘ │
│                                   │
│ Recently updated                  │
│ [ 3 rows ]                  ╭───╮ │
│                             │ + │ │  ← FAB
│                             ╰───╯ │
├───────────────────────────────────┤
│  ⌂     ☑③    ▤      ⌗             │
└───────────────────────────────────┘
```

Mobile changes, all deliberate:

| Change | Reason |
|---|---|
| Greeting drops to `text-h1` (24px) and splits across two lines | 32px on a 360px screen wraps awkwardly and eats a quarter of the fold |
| Ring → 32px progress strip, moved **below** the list | Recovers ~110px of vertical space for actual tasks |
| Today section capped at **5**, not 7 | Keeps the progress strip within one thumb-scroll |
| Search collapses into a TopBar icon | A 44px search field above the fold competes with quick add for the same job |
| Quick actions dropped entirely | The FAB and bottom nav already cover all four |
| Stat tiles become 2×2 below 400px | Four tiles in a row gives each ~80px — too narrow for a label |

### 5.1.6 First-run and empty variants

| Condition | Dashboard renders |
|---|---|
| No tasks at all | Greeting + QuickAdd (autofocused here, unlike the normal state) + a full `EmptyState`: "Let's get started" / "Add your first task above, or pick a category to organize things later." + the four seeded `CategoryChip`s. Stats, progress, and Recent are all hidden. |
| Tasks exist, none due today, none overdue | Today section shows the "Nothing due today" empty state (Module 07). Progress card shows "No tasks due today" with an empty ring track. Recent and stats render normally. |
| Everything due today is complete | Ring at 100% in `--success`, "All done for today", Today section keeps showing the completed rows at 60% opacity. |

**Why the completed rows stay visible at 100%:** Clearing them would replace the day's
evidence of work with an empty container at the exact moment the user earned the
opposite. The state should look like a finished list, not an empty one.

---

## 5.2 Task List

### 5.2.1 Purpose

The workhorse. Optimized for **scanning a column quickly**, then acting without leaving
the screen.

### 5.2.2 Desktop layout (≥1024px)

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ SIDEBAR      │  Tasks                                       [⌕ Search…  ⌘K] │
│              │  23 tasks · 3 overdue                                        │
│              ├──────────────────────────────────────────────────────────────┤
│              │ [All][Today][Upcoming][Completed]      ⇅ Due date  ⚙ Filters②│ ← sticky
│              │ ● Work ✕   High ✕   Clear all                                │
│              ├──────────────────────────────────────────────────────────────┤
│              │  ┌────────────────────────────────────────────────────────┐  │
│              │  │ ⊕  Add a task…                                         │  │
│              │  └────────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  OVERDUE                                                  3  │
│              │  ┌────────────────────────────────────────────────────────┐  │
│              │  │▌☐ Submit the expense report            [To do]      ⋯  │  │
│              │  │▌   ⚠ 2 days ago · ● Work · High                        │  │
│              │  ├────────────────────────────────────────────────────────┤  │
│              │  │▌☐ Renew the domain                     [To do]      ⋯  │  │
│              │  │▌   ⚠ Yesterday · ● Personal · Medium                   │  │
│              │  └────────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  TODAY                                                    4  │
│              │  ┌────────────────────────────────────────────────────────┐  │
│              │  │▌☐ Review the Q3 invoice batch    [In progress]      ⋯  │  │
│              │  │▌   ▤ Today · ● Work · High                             │  │
│              │  └────────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │  THIS WEEK                                                8  │
│              │  …                                                           │
│              │                                                              │
│              │  ▸ Completed (12)                                            │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### 5.2.3 Region specifications

#### Header

- Title "Tasks" in `text-h1`; when a category filter is active the title becomes the
  category name with its `Dot`, and a "← All tasks" link appears above it.
- Subtitle: `text-sm` `--text-muted`, "23 tasks · 3 overdue". The overdue clause is
  `--error-strong` and is omitted at zero.
- `SearchBar` right-aligned, 320px.

#### FilterBar

Sticky at `z-sticky` directly under the header, per Module 03 §6.4. Contains the view
`SegmentedControl`, the sort `Menu`, the Filters trigger with its count badge, and — on
a second line, only when filters are active — the removable chip row.

**The four views are presets over the same filter set:**

| View | Underlying filter | Default sort |
|---|---|---|
| All | none | Due date ↑ |
| Today | `dueDate = today OR overdue`, not done | Due date ↑ |
| Upcoming | `dueDate > today`, not done | Due date ↑ |
| Completed | `status = DONE` | Completed ↓ |

*Why presets on top of filters rather than separate screens:* The user can start from a
preset and refine it with filters without losing their place, and every resulting state
is one shareable URL. Separate screens would need their own filter state each.

#### Sorting

| Option | Group headers produced |
|---|---|
| **Due date ↑** *(default)* | Overdue · Today · Tomorrow · This week · Later · No due date |
| Due date ↓ | Same, reversed |
| Priority | High · Medium · Low |
| Recently created | Today · This week · Earlier |
| Title A–Z | None — flat list |

Sort choice **determines the grouping**, so the two are never configured separately.

*Why couple them:* Independent sort and group controls are a common power-user feature
that produces mostly nonsensical combinations (grouped by priority, sorted by title) and
doubles the state the user has to hold. One control, one coherent result.

**Within every group, ties break by:** priority ↓, then `createdAt` ↑. So a group never
renders in an order that looks arbitrary between sessions.

#### Group headers

`text-overline` (11/16, 600, 0.06em) in `--text-muted`, count right-aligned in
`text-caption`. Sticky within their group at `z-sticky`, so the header of the group being
scrolled through stays visible. `space-6` above, `space-2` below.

The **Overdue** group header is `--error-strong` — the one group whose label is colored,
because it is the one group that carries urgency rather than just chronology.

#### Rows

`TaskItem variant="row"` per Module 03 §6.4, 56px, `space-2` gap. `StatusBadge` shows in
the trailing zone on desktop only.

#### Completed disclosure

At the bottom of every view except Completed: a collapsed `▸ Completed (12)` row.
Expanding reveals completed tasks at 60% opacity, newest first, capped at 20 with a link
to the Completed view.

*Why collapsed by default:* Completed tasks are the largest and fastest-growing set in
the product and the least frequently needed. Left expanded, they eventually dominate
every list.

### 5.2.4 Search behavior

- Matches **title and description**, case-insensitive, on any substring.
- Debounced 250ms; URL updated with `replace`.
- **Search does not clear filters** — it narrows within them. The filter chips stay
  visible so the user can see they are searching inside a subset.
- Matched substrings are highlighted with `--warning-light` background and
  `--text-primary` text (a background highlight rather than bolding, so the row's weight
  hierarchy survives).
- Grouping is **suppressed during search** — results render as one flat, relevance-free
  list sorted by the active sort. Groups over three results are more chrome than content.
- Result count announced politely: "12 tasks found".
- Zero results → the no-search-results empty state (Module 07), which offers *Clear
  search* and *Clear all filters* separately, because the user usually knows which one
  they meant.

### 5.2.5 Keyboard flow

Per Module 01 §3.7. Specific to this screen:

- `↑`/`↓` move a selection ring through rows, **skipping group headers**.
- Selection auto-scrolls with a 64px margin so the selected row is never flush against a
  sticky header.
- `Space` toggles completion **without moving the selection**, so several tasks can be
  completed in sequence.
- `Enter` opens the detail panel; `↑`/`↓` then continue moving through the list with the
  panel following along.
- `/` focuses search from anywhere; `Esc` returns focus to the list at the previously
  selected row.

*Why the selection stays put on `Space`:* Auto-advancing after completion sounds helpful
but means the row under the cursor changes identity between keypresses — which is how
users complete the wrong task.

### 5.2.6 Tablet and mobile

**Tablet (768–1023px):** Identical structure. `SearchBar` shrinks to 240px; the
`StatusBadge` leaves the row's trailing zone (the overflow button stays); the view
`SegmentedControl` keeps all four segments.

**Mobile (<768px):**

```
┌───────────────────────────────────┐
│ ← Tasks                   ⌕   ⚙②  │  ← 56px sticky; ⚙ = filters
├───────────────────────────────────┤
│ [All][Today][Upcoming][Completed] │  ← horizontally scrollable chips
│ ● Work ✕   High ✕   Clear         │
├───────────────────────────────────┤
│ ┌───────────────────────────────┐ │
│ │ ⊕  Add a task…                │ │
│ └───────────────────────────────┘ │
│                                   │
│ OVERDUE                        3  │
│ ┌───────────────────────────────┐ │
│ │▌☐ Submit the expense report ⋯ │ │  ← 64px, no status badge
│ │▌   ⚠ 2 days ago · ● Work      │ │
│ └───────────────────────────────┘ │
│ TODAY                          4  │
│ …                           ╭───╮ │
│                             │ + │ │
│                             ╰───╯ │
├───────────────────────────────────┤
│  ⌂     ☑③    ▤      ⌗             │
└───────────────────────────────────┘
```

| Change | Reason |
|---|---|
| Rows grow to 64px | 44px touch targets need vertical room alongside two text lines |
| `StatusBadge` removed from rows | Third badge does not fit; status is available in the detail view and via the overflow menu |
| `SegmentedControl` → scrollable chip row | Four labels at 360px would each get ~85px and truncate |
| Sort moves into the filter sheet | Two separate triggers in a 56px header leaves no room for the title |
| Filters open as a bottom sheet | Reachable by thumb; a top popover is not |
| Swipe right = complete, left = delete | Fastest possible touch path; both remain in the overflow menu for accessibility |
| Search expands to a full-width overlay on the TopBar | A 200px inline field cannot show a query and a clear button |

---

## 5.3 Performance and scale rules

| Condition | Behavior |
|---|---|
| ≤100 tasks | Render all rows; no virtualization |
| >100 tasks | Virtualize with a fixed row height taken from the density mode |
| >500 tasks | Additionally lazy-load groups below the fold |
| Any count | Server renders the first page; filters and search run client-side against the loaded set until it exceeds one page, then move server-side |

**The row height must be fixed for virtualization to work** — which is the concrete
reason Module 02 §4.2 defined comfortable and compact heights as exact values rather
than as "roughly 56px".

---

## 5.4 Edge cases

| Case | Handling |
|---|---|
| Title longer than the row | Truncate at one line with an ellipsis; full title in `title` / `accessibilityLabel` and in the detail view |
| Title is a single unbroken 200-character string | `overflow-wrap: anywhere` on the detail view; truncation handles the row |
| 15 active filter chips | The chip row scrolls horizontally; "Clear all" is pinned at its end and never scrolls away |
| Task due today at 23:59, viewed at 00:01 | Groups are computed on the client at render from local midnight, so the task moves to Overdue without a refresh |
| Timezone changes mid-session | Groups recompute on window focus |
| Every task filtered out | No-results empty state naming which filters are active |
| A task is completed while it is filtered out of the current view | It stays visible at 60% opacity for 400ms, then animates out |
| Two tabs open, one completes a task | Not handled in v1 — no realtime sync. Documented as a known gap rather than half-solved |
| Category deleted while its filter is active | Filter clears itself, and a toast explains why: "Work was deleted · showing all tasks" |

---

## Decisions locked by this module

1. Dashboard leads with tasks on the left, summary on the right; mobile drops the ring
   for a progress strip placed below the list.
2. Progress is measured against **today's** tasks, never all-time.
3. Today section is capped (7 desktop / 5 mobile) with an overflow link.
4. Overdue appears once as a summary callout and once inside the Today list — never as
   its own list on the dashboard.
5. The four task-list views are presets over one filter set, expressed in the URL.
6. Sort determines grouping; they are not independent controls.
7. Completed tasks are collapsed by default everywhere except the Completed view.
8. Grouping is suppressed during search.
9. `Space` completes without advancing the selection.

## Carried into Module 05

- Whether the create modal offers a "Save and add another" secondary action.
  *(Leaning: yes on desktop only — it is the batch-entry path that QuickAdd cannot serve
  once details are involved, and on mobile the full-screen form makes it redundant with
  simply reopening the FAB.)*
- Whether editing saves on blur or requires an explicit Save.
  *(Leaning: explicit Save in the modal, but inline-editable title in the detail view —
  they are different interaction models and the detail view is where small corrections
  actually happen.)*
