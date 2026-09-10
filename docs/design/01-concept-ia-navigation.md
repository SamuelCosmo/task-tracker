# Module 01 — Concept, Information Architecture & Navigation

---

## 1. Overall Design Concept

### 1.1 Positioning

**Momentum** is a personal task tracker for people who open the app several times a
day, for ten seconds at a time. It is not a project management tool: there are no
sprints, no assignees, no comment threads. Every design decision below optimizes for
one loop:

> open → see what matters now → capture or complete → close

**Why:** Productivity tools fail when the cost of *using* the tool approaches the cost
of the task itself. Optimizing the ten-second loop is what separates a tool people
keep from one they abandon in week two.

### 1.2 Design principles

Five principles, in priority order. When two conflict, the higher one wins.

**1. The next action is always visible.**
Every screen answers "what should I do now?" above the fold. The dashboard leads with
today's tasks, not with statistics. Charts and counters are supporting evidence, never
the headline.
*Why:* A dashboard that opens with a donut chart makes the user do the translation
work from "78% complete" to "so, which task?". We do that translation for them.

**2. Calm canvas, loud signal.**
The interface is near-monochrome — slate greys, white/near-black surfaces. Color is
*reserved for meaning*: indigo means "interactive", red means overdue or high
priority, amber means due soon or medium, green means done or low. Nothing is colored
for decoration.
*Why:* If everything is colored, nothing is. Restricting the palette makes a single
red dot on a due date genuinely alarming, which is exactly the job of that dot.

**3. One-tap completion, two-tap creation.**
Marking a task done is always a single tap on a checkbox that is present wherever the
task is rendered — list, dashboard, calendar, detail. Creating a task is a tap on a
persistent "+" plus typing a title; every other field is optional and has a sane
default.
*Why:* Completion is the reward loop of the product and must never require navigation.
Required fields on a create form are the single biggest cause of abandoned capture.

**4. Progressive disclosure.**
The default view shows title, status, priority, due date, category. Description,
timestamps, and history live one level deeper. Filters are collapsed until requested.
*Why:* Scanning a list is a visual-search task; every extra element per row multiplies
the cost linearly across the whole list.

**5. Nothing is a dead end.**
Every empty state, error, and zero-result view offers the action that resolves it.
Every destructive action is undoable for a few seconds rather than confirmed with a
modal.
*Why:* Undo is faster than confirm for the 95% of cases where the user meant it, and
safer than confirm for the 5% where they didn't (people click "Confirm" reflexively).

### 1.3 Visual direction

| Aspect | Direction |
|---|---|
| **Mood** | Quiet, precise, slightly technical. Confident but not corporate. |
| **Surface strategy** | Layered cards on a tinted canvas. Elevation communicates hierarchy, not decoration. |
| **Shape language** | Consistently rounded — 8px for controls, 12px for cards, 16px for sheets/modals, full-round for chips and avatars. |
| **Density** | Comfortable by default (56px list rows on desktop), with a future "compact" mode as a settings toggle. |
| **Motion** | Short (150–200ms), functional, easing-out. Motion explains *where things came from*; it never entertains. |
| **Typography** | One sans family across the whole product. Hierarchy comes from weight and size, never from a second typeface. |
| **Imagery** | No photography, no 3D illustration. Empty states use simple line-art built from the same stroke weight as the icon set. |

**Why one typeface:** A second display face is the fastest way to make a utility app
feel like a marketing page. Weight contrast (400/500/600) carries all the hierarchy a
task list needs and costs nothing in bundle size.

### 1.4 What we deliberately do not do

- **No color-coded rows.** Priority is a badge or bar, not a row background — colored
  rows destroy scannability and break contrast requirements in dark mode.
- **No nested subtasks (v1).** They convert a flat, fast list into a tree that needs
  expand/collapse state everywhere. Deferred, not designed against.
- **No drag-and-drop as the only path.** Any reorder or status change reachable by
  drag is also reachable from a menu — drag is inaccessible to keyboard and screen
  reader users, and unreliable on touch.
- **No modal confirmations for routine actions.** See principle 5.

---

## 2. Information Architecture

### 2.1 Content model

The design assumes the following entities. The current Prisma model
(`Task { id, title, done }`) needs to grow into this before implementation.

**Task**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | Int | yes | auto | |
| `title` | String | yes | — | The only field required at creation. Max ~120 chars in UI. |
| `description` | String? | no | `null` | Plain text / light markdown. Not shown in lists. |
| `status` | Enum | yes | `TODO` | `TODO` / `IN_PROGRESS` / `DONE` |
| `priority` | Enum | yes | `MEDIUM` | `LOW` / `MEDIUM` / `HIGH` |
| `dueDate` | DateTime? | no | `null` | Date-only semantics in UI; store as date at local midnight. |
| `categoryId` | Int? | no | `null` | Null renders as "Uncategorized". |
| `createdAt` | DateTime | yes | now | Shown in task details. |
| `updatedAt` | DateTime | yes | now | Powers "Recently updated" sorting. |
| `completedAt` | DateTime? | no | `null` | Set when status becomes `DONE`; cleared on reopen. Powers completion stats. |

**Category**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `id` | Int | yes | auto | |
| `name` | String | yes | — | Unique. Max ~24 chars. |
| `color` | String | yes | assigned | One of a fixed palette of 8 (defined in Module 02). |
| `icon` | String | yes | `"tag"` | Icon name from the app's icon set. |

Seeded defaults: **Work**, **Personal**, **Study**, **Health**.
*Why seed:* An empty category list on first run forces a setup task before the user's
first real task. Seeded defaults make the category selector immediately useful, and
they are editable and deletable so they don't feel imposed.

### 2.2 Status vs. "done" — an explicit decision

`status` is a three-value enum, and `done` is derived from `status === DONE` rather
than being a separate boolean.

**Why:** Two independent flags (`done` plus `status`) can disagree — a task can end up
`done: true, status: IN_PROGRESS`. A single source of truth makes the checkbox and the
status badge structurally incapable of contradicting each other.

**Overdue is derived, never stored:** `dueDate < today && status !== DONE`. It is a
visual state, not a status value.
*Why:* A stored overdue flag requires a scheduled job to stay truthful and goes stale
the moment the user changes a due date. Deriving it is always correct.

### 2.3 Task lifecycle

```
            ┌──────────┐   start    ┌──────────────┐  complete  ┌────────┐
  create ──▶│   TODO   │───────────▶│ IN_PROGRESS  │───────────▶│  DONE  │
            └──────────┘            └──────────────┘            └────────┘
                 ▲  │                      │   ▲                   │
                 │  └──── complete ────────┼───┼───────────────────┘
                 └───────── reopen ────────┴───┘

  Derived overlay (any non-DONE state):  OVERDUE  when dueDate < today
```

Every transition is reachable from three places: the checkbox (TODO/IN_PROGRESS to
DONE and back), the status dropdown (any to any), and the task detail screen's primary
action.

### 2.4 Screen hierarchy

```
Task Tracker
│
├── Dashboard (/)                        ← default landing screen
│     ├─ Today's focus
│     ├─ Progress summary
│     ├─ Quick add
│     └─ Recent activity
│
├── Tasks (/tasks)                       ← the workhorse screen
│     ├─ Search · Filters · Sort  (state lives in the URL)
│     ├─ Views: All · Today · Upcoming · Completed
│     └─ Task Details (/tasks/:id)
│           ├─ Edit    (/tasks/:id/edit)
│           └─ Delete  (inline, with undo)
│
├── Calendar (/calendar)
│     ├─ Month view (default on desktop/tablet)
│     ├─ Agenda view (default on mobile)
│     └─ Day detail → task list for that date
│
├── Categories (/categories)
│     ├─ Category list with task counts
│     └─ Category detail (/categories/:id) → filtered task list
│
├── Create Task (/tasks/new)             ← modal on desktop, full screen on mobile
│
└── Settings (/settings)
      ├─ Appearance (Light / Dark / System)
      ├─ Defaults (default view, default priority, week start day)
      └─ Data (export, clear completed)
```

### 2.5 Content priority per screen

Ordered by what the user must see first. This ordering drives the mobile layout
directly — mobile is a single column, so vertical order *is* priority.

| Screen | 1st | 2nd | 3rd | 4th |
|---|---|---|---|---|
| Dashboard | Today's tasks | Progress / counts | Quick add | Recent + overdue |
| Task List | Task rows | Search | Filters | Sort |
| Task Details | Title + status | Primary action (complete) | Metadata | Description |
| Calendar | Current period grid | Selected day's tasks | Period navigation | View switch |
| Categories | Category cards + counts | Add category | — | — |

**Why search ranks below the rows:** With fewer than roughly 50 tasks — the realistic
case — scanning beats searching. Search is promoted to first position only inside the
zero-result and large-list states.

### 2.6 URL / state model

All list state is URL-encoded so views are shareable, bookmarkable, restorable on
refresh, and survive the browser back button.

```
/tasks?view=today&status=todo,in_progress&priority=high&category=2&q=invoice&sort=due-asc
```

| Param | Values | Default |
|---|---|---|
| `view` | `all`, `today`, `upcoming`, `completed` | `all` |
| `status` | comma-separated enum values | none (all) |
| `priority` | comma-separated enum values | none (all) |
| `category` | category id, or `none` | none (all) |
| `q` | free text | empty |
| `sort` | `due-asc`, `due-desc`, `priority-desc`, `created-desc`, `title-asc` | `due-asc` |

**Why URL state:** It gives back/forward, refresh-safety, and deep links for free, and
it keeps the client stateless enough to server-render the first paint — which the
current Next.js architecture already does.

---

## 3. Navigation Structure

### 3.1 Primary navigation set

Four primary destinations plus one persistent creation affordance. Settings is
secondary.

| Item | Icon | Route | Badge |
|---|---|---|---|
| Home | house | `/` | — |
| Tasks | list-checks | `/tasks` | count of overdue tasks (red dot) |
| Calendar | calendar | `/calendar` | — |
| Categories | tag | `/categories` | — |
| **New task** | plus | `/tasks/new` | always visible, always reachable |
| Settings | settings | `/settings` | secondary placement |

**Why exactly four:** Four fits a mobile bottom bar alongside a center create button
without crowding, and it maps one-to-one to a desktop sidebar — so the mental model is
identical across form factors. Five or more forces a "More" bucket, which reliably
becomes where features go to die.

### 3.2 Desktop — persistent sidebar (≥1024px)

```
┌──────────────┬────────────────────────────────────────────────┐
│  Momentum    │  Good morning, Samuel              [⌕ Search]  │
│              │                                                │
│  + New task  │  ┌────────────────────────────────────────┐    │
│              │  │                                        │    │
│  ⌂ Home      │  │            content region              │    │
│  ☑ Tasks  ③  │  │                                        │    │
│  ▤ Calendar  │  │                                        │    │
│  ⌗ Categories│  └────────────────────────────────────────┘    │
│              │                                                │
│  ─ CATEGORIES│                                                │
│  ● Work   12 │                                                │
│  ● Personal 4│                                                │
│  ● Study   7 │                                                │
│              │                                                │
│  ☀ Theme     │                                                │
│  ⚙ Settings  │                                                │
└──────────────┴────────────────────────────────────────────────┘
   240px fixed                  fluid, max content width 1120px
```

- Sidebar is **240px**, fixed, always visible, non-collapsible at this breakpoint.
- The **New task** button sits at the top of the sidebar, above navigation.
  *Why top:* It is the most frequent action; placing it above the nav gives it the
  most stable, most predictable hit target on the screen.
- Categories appear as a secondary list inside the sidebar with live counts,
  functioning as saved filters into `/tasks?category=N`.
  *Why:* Category is the most common filter; giving it permanent real estate removes
  two interactions (open filters, pick category) from a daily action.
- Active item: `--primary-light` background, `--primary` text and icon, plus a 3px
  left indicator bar.
  *Why the bar in addition to color:* Color alone is not an accessible indicator of
  the current page; the bar (plus `aria-current="page"`) carries the meaning without it.

### 3.3 Tablet — icon rail (768–1023px)

```
┌────┬───────────────────────────────────────┐
│ +  │  Header with search                   │
│ ⌂  │                                       │
│ ☑ ③│           content region              │
│ ▤  │                                       │
│ ⌗  │                                       │
│    │                                       │
│ ⚙  │                                       │
└────┴───────────────────────────────────────┘
  72px
```

- Sidebar collapses to a **72px icon rail**; labels appear as tooltips on hover and
  are always present as `aria-label`.
- The category sub-list is dropped from the rail and moves into the filter bar.
  *Why:* Icon-only category dots are unidentifiable; a filter dropdown that shows
  names is more usable than a rail of ambiguous colored circles.

### 3.4 Mobile — bottom navigation + FAB (<768px)

```
┌───────────────────────────────────┐
│  Today                    ⌕   ⋮   │  ← compact header, contextual title
│                                   │
│                                   │
│        content region             │
│                                   │
│                             ╭───╮ │
│                             │ + │ │  ← FAB, 56px, above the bottom bar
│                             ╰───╯ │
├───────────────────────────────────┤
│   ⌂       ☑③     ▤        ⌗       │  ← bottom bar, 4 items, 56px tall
│  Home   Tasks  Calendar Categories│
└───────────────────────────────────┘
```

- **Bottom bar** with 4 items, icon plus label, 56px tall plus safe-area inset.
  *Why bottom, not a hamburger:* Thumb reach. A drawer hides navigation behind an
  extra tap and consistently reduces use of every destination inside it.
- **FAB** for create, bottom-right, 16px from the edges, floating 16px above the bar.
  *Why not a fifth bar item:* Create is an action, not a destination. Mixing them in
  one bar teaches the wrong model and makes the bar's active state ambiguous.
- The FAB **hides on scroll down and returns on scroll up**, and is suppressed on the
  create and edit screens.
- Settings moves into the header's overflow menu on Home, and is also reachable from
  the profile row.

### 3.5 Screen vs. modal decision

| Content | Desktop | Tablet | Mobile |
|---|---|---|---|
| Create task | Centered modal (560px) | Centered modal | Full-screen route |
| Edit task | Centered modal | Centered modal | Full-screen route |
| Task details | Right side panel (400px), list stays visible | Full-screen route | Full-screen route |
| Filters | Popover under the filter button | Popover | Bottom sheet |
| Delete confirm | None — inline undo toast | Same | Same |
| Category create/edit | Small modal (440px) | Small modal | Bottom sheet |

**Why a side panel for details on desktop:** Keeping the list visible preserves the
user's place and lets them move through tasks one after another without navigating
back between each — the difference between reviewing 10 tasks in 10 clicks versus 20.

**Why full-screen create on mobile:** A modal over a keyboard-shrunk viewport leaves
roughly a third of the screen usable. Full-screen gives the date picker and category
selector room to be tappable.

### 3.6 Quick-add: the shortest capture path

A single-line quick-add input sits at the top of the Dashboard and the Task List.
Type a title, press <kbd>Enter</kbd>, and the task is created with defaults
(`TODO`, `MEDIUM`, no due date, no category) and appears in the list immediately.

Optional inline syntax, parsed as the user types and shown as live chips:

| Syntax | Effect |
|---|---|
| `#work` | assigns the Work category |
| `!high` | sets priority high |
| `today`, `tomorrow`, `friday`, `12/03` | sets the due date |

**Why inline syntax:** It makes the fast path faster for repeat users without adding
a single pixel of UI for everyone else. Because the parsed values render as removable
chips before submit, the feature stays discoverable and correctable rather than being
hidden magic.

### 3.7 Keyboard model (desktop)

| Key | Action |
|---|---|
| `N` | New task |
| `/` | Focus search |
| `G` then `H` / `T` / `C` / `Y` | Go to Home / Tasks / Calendar / Categories |
| `↑` `↓` | Move selection through the task list |
| `Space` | Toggle completion on the selected task |
| `Enter` | Open the selected task |
| `E` / `Backspace` | Edit / delete the selected task |
| `Esc` | Close modal, panel, or popover; clear search if focused |
| `Cmd/Ctrl + Enter` | Submit the open form |

**Why:** Keyboard-first navigation is the strongest signal of a "professional" tool
and, more practically, it means the whole app is operable without a mouse — which is
the same requirement accessibility imposes.

### 3.8 Back-navigation contract

- Modals and panels push a history entry, so browser or system back closes them rather
  than leaving the screen.
- Filter and search changes **replace** history rather than pushing it, so back doesn't
  step through every keystroke.
- Mobile hardware or gesture back on a full-screen create form with unsaved content
  prompts "Discard draft?" — the only confirmation dialog in the product.
  *Why the exception:* Losing typed content is not undoable, so it is the one case
  where a prompt beats an undo toast.

---

## Decisions locked by this module

1. Four primary destinations plus a persistent create affordance.
2. `status` enum is the single source of truth; `done` and `overdue` are derived.
3. All list state lives in the URL.
4. Sidebar (desktop) → icon rail (tablet) → bottom bar + FAB (mobile).
5. Task details is a side panel on desktop, a route on mobile.
6. Delete uses an undo toast, not a confirmation dialog.

## Open questions carried into Module 02

- Whether "Uncategorized" should be a real, selectable filter chip or only an implicit
  bucket. *(Leaning: real chip — users do want to find untriaged tasks.)*
- Whether the compact density mode ships in v1 or is deferred with the token structure
  in place to support it. *(Leaning: defer, but define both row heights now.)*
