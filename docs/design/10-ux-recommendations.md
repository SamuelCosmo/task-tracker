# Module 10 — UX Recommendations & Implementation Notes

> Output section 10, and the close of the design proposal.

---

## 10.1 The thesis, restated

Everything in Modules 01–09 serves one measurable claim:

| Action | Interactions | Reversible |
|---|---|---|
| Create a task | **2** (tap QuickAdd, type, Enter) | — |
| Create with full details | **5** | — |
| Complete a task | **1** | Yes, instantly |
| Reopen a task | **1** | Yes |
| Delete a task | **2** | Yes, 8 seconds |
| Find a specific task | **2** (`/`, type) | — |
| Reschedule an undated task | **2** (Unscheduled → date) | Yes, undo toast |
| Filter to one category | **1** (sidebar click) | Yes |

**These numbers are the design's acceptance criteria.** Any future change that increases
one of them has to justify itself against Module 01's principle 3. They are also the
cheapest thing to regression-test: they can be counted from a click-through without
instrumentation.

---

## 10.2 Prioritized recommendations

Ordered by impact on daily use. The first four are the ones that determine whether the
product feels fast.

### 1. Make completion the cheapest interaction, everywhere

A checkbox appears in every representation of a task — list, dashboard, calendar chip,
detail panel — and is always one tap, always optimistic, never behind a menu or a
navigation.

**Why it ranks first:** Completion is the reward loop. It is performed more than every
other action combined, and it is the only interaction whose *feel* determines whether
the product is satisfying rather than merely functional. A 200ms spinner here is noticed
every single time.

**Concretely:** oversized hit target (44px around a 20px box), optimistic update with
rollback, a 400ms delay before a completed row leaves a filtered view, and the one
motion flourish in the product (Module 02 §4.7).

### 2. Never require a field the user does not have yet

Title is the only required field. Priority defaults to Medium, due date to empty,
category to Uncategorized, status to To do.

**Why:** Required fields are the primary cause of abandoned capture. A task the user
did not record because they had not decided its priority is a total loss; a task
recorded as Medium and never re-triaged still works.

### 3. Make the reason a list looks empty always visible

Active filters render as removable chips above the list; the empty state names them; and
"Clear search" and "Clear all filters" are separate actions.

**Why:** "My task disappeared" is the most common support complaint in task apps, and
hidden filter state is almost always the cause. This costs one row of chrome and removes
an entire class of confusion.

### 4. Prefer undo over confirm

Delete removes the row immediately and defers the request until an 8-second toast
expires. There is no delete confirmation dialog.

**Why:** Confirmation dialogs are dismissed reflexively, so they protect nobody while
taxing everybody. Undo is faster in the 95% case and genuinely safer in the 5%. The two
exceptions — discarding a dirty form and deleting a category that owns tasks — are the
cases where undo cannot express the choice.

### 5. Put state in the URL

Views, filters, search, and sort are all URL parameters.

**Why:** It gives back/forward, refresh-safety, deep links, and lossless resize and
rotation for free, and it is what allows the first paint to be server-rendered — which
this codebase already does.

### 6. Design the empty and loading states as first-class screens

Five distinct kinds of empty (Module 07 §7.1), each with its own copy and its own exit.

**Why:** They are the majority of a new user's first session. A first-use state that says
"No tasks" and a filtered state that says "No tasks" are the same words solving opposite
problems, and one of them is a lie.

### 7. Never let color be the only signal

Every status, priority, and category pairs color with a label or an icon; every selected
state pairs fill with a check or an indicator bar.

**Why:** Roughly 8% of men have a color vision deficiency, and red/green priority is
exactly the confusion pair. It also makes the interface work in greyscale, in bright
sunlight, and for anyone who has turned up their display's contrast.

### 8. Give keyboard users the whole product

Every action reachable, `:focus-visible` never removed, shortcuts for the frequent paths,
focus trapped in overlays and restored on close.

**Why:** It is the strongest signal of a professional tool, and it is the same work
accessibility requires — so it is bought once and paid for twice.

### 9. Respect the platform's back gesture

Every overlay pushes history; filter changes replace it.

**Why:** On mobile, back is used more than any in-app control. An overlay that back
doesn't close, or a back that steps through fifteen keystrokes of search, both feel
broken in a way users rarely report and always remember.

### 10. Show absolute dates alongside relative ones

"Sep 8 (2 days ago)", never one alone.

**Why:** Relative alone is ambiguous across midnight and useless for planning; absolute
alone makes the reader do arithmetic. Together they cost eight characters.

---

## 10.3 Accessibility summary

Consolidated from Modules 02, 03, and 09. This is the shipping checklist.

| # | Requirement | Where specified |
|---|---|---|
| 1 | Text ≥4.5:1; large text and UI boundaries ≥3:1 | 02 §4.5, 09 §9.10 |
| 2 | Color never the sole carrier of meaning | 02 §4.5.3 |
| 3 | Every interactive element keyboard-reachable, logical order | 02 §4.11 |
| 4 | `:focus-visible` ring, 2px at 2px offset, never removed | 02 §4.10 |
| 5 | Focus trapped in overlays, restored to the trigger on close | 03 §6.4 |
| 6 | Icon-only controls have accessible names | 02 §4.6 |
| 7 | Live regions for completion, delete/undo, save, errors | 02 §4.11 |
| 8 | Form labels always visible; errors linked by `aria-describedby` | 03 §6.3 |
| 9 | Touch targets ≥44px; pointer ≥32px | 02 §4.10 |
| 10 | `prefers-reduced-motion` respected | 02 §4.7 |
| 11 | 200% zoom without horizontal scroll | 02 §4.11 |
| 12 | Grid/list semantics: `role="grid"`, `aria-current`, `aria-selected` | 03, 06 |
| 13 | No hover-only affordances | 08 §7.5 |
| 14 | Greyscale screenshot test passes | 09 §9.10 |

**The three most likely to be missed in implementation:** focus restoration after closing
an overlay (5), live-region announcements for optimistic updates (7), and hover states
not gated behind `@media (hover: hover)` (13).

---

## 10.4 Microcopy principles

| Rule | Example |
|---|---|
| Sentence case everywhere | "New task", not "New Task" |
| Buttons are verbs | "Create task", not "Submit" or "OK" |
| No exclamation marks, no "Oops" | "Couldn't load your tasks" |
| Never blame the user | "No tasks match these filters", not "You have no tasks" |
| Say what happened, then what to do | "Couldn't save your changes · Retry" |
| One sentence, under 12 words | — |
| Relative + absolute for dates | "Sep 8 (2 days ago)" |
| State the count when it is the evidence | "7 of 7 tasks completed" |

---

## 10.5 Deliberately out of scope, and when to reconsider

| Deferred | Reconsider when |
|---|---|
| Subtasks | Users routinely put checklists in descriptions |
| Recurring tasks | The most-requested feature; likely the first v2 addition |
| Time of day on tasks | Users start writing times into titles — this also unblocks the calendar's week view |
| Multi-select / bulk actions | Users have >200 tasks and clean up in batches |
| Compact density mode | Users with >100 tasks ask for it; the tokens already exist |
| Category reordering | A user has >8 categories |
| Attachments, comments, sharing | Never for this product — they turn a personal tool into a project tool |
| Realtime cross-tab sync | Users report stale data; needs a subscription layer |
| Offline write queue | See §10.6 — currently a stated gap |

**Why write this list at all:** An explicit deferral list is what stops "what about…?" from
being re-litigated every planning cycle, and it distinguishes *not yet* from *no*.

---

## 10.6 Known gaps and risks

Stated plainly rather than buried.

| Gap | Impact | Recommendation |
|---|---|---|
| **The `Task` model is `{ id, title, done }`** | Nothing in this design can be built until it grows | Migrate first — Module 01 §2.1 is the target schema |
| **Seven contrast failures in the committed palette**, plus three more on the elevated dark surfaces | Ships an inaccessible product | Apply the Module 02 §4.12 delta before building any component |
| **The dark block is duplicated in `globals.css`** | The two copies will drift | Extract to a single declaration during the token delta |
| **No offline write queue** | Mutations silently fail or appear to succeed | Until built, fail loudly with Tier 1 toasts. **Never drop a write silently** |
| **No cross-tab sync** | Two tabs disagree | Document as a v1 limitation; refetch on window focus as a cheap mitigation |
| **The brief targets React Native; the repo is Next.js** | Two implementations, or a rewrite | Tokens and component contracts are framework-neutral by construction (02 §4.12, 08 §7.10) — keep them that way |
| **Category color/status color overlap** (amber, emerald) | Possible confusion | Shape disambiguates (03 §6.3). If testing shows confusion, drop those two from the category set rather than recoloring status |
| **Quick-add natural-language date parsing** | Locale-dependent, easy to get subtly wrong | Ship with a fixed keyword set (`today`, `tomorrow`, weekday names) before attempting free-form parsing; always show the parsed result as a removable chip |

---

## 10.7 Implementation roadmap

Ordered so nothing is built twice.

### Phase 0 — Foundations *(blocking; nothing else starts first)*

1. **Prisma migration** — extend `Task` per Module 01 §2.1; add `Category`; seed Work,
   Personal, Study, Health. Derive `done` from `status`; never store `overdue`.
2. **Token delta** — apply Module 02 §4.12 to `globals.css`, including the §4.5.6 dark
   corrections, and de-duplicate the dark block.
3. **Token additions** — spacing, radius, motion, z-index, and the 8-color category
   palette into `@theme inline`.
4. **Theme switching** — Light/Dark/System, persisted, applied pre-paint, with
   `color-scheme` on the root.

### Phase 1 — Atoms

Button, IconButton, Input, Textarea, Checkbox, Badge, Chip, Icon, Spinner, Skeleton,
Divider, Label, HelperText, Dot, ProgressBar.

**Build the full state matrix for each** (Module 02 §4.10) before moving on. Retrofitting
focus and disabled states across fifteen components later is strictly more work than
building them once.

### Phase 2 — Molecules

FormField, SearchBar, Select/Menu, DatePicker, SegmentedControl, StatusBadge,
PriorityBadge, CategoryChip, NavItem, TaskMeta, Toast, EmptyState, StatTile, ProgressRing.

`DatePicker` is the largest single component here — budget for it accordingly, and build
the preset row before the month grid, since the presets carry most of the real usage.

### Phase 3 — Shell and list

AppShell (sidebar / rail / bottom nav), TopBar, Modal, BottomSheet, SidePanel, TaskItem,
TaskList, FilterBar, QuickAdd.

**Build `TaskList` on a section-based list primitive from the start** (Module 08 §7.10) —
grouping is not a later addition.

### Phase 4 — Screens

Task list → Create/Edit → Task details → Dashboard → Categories → Calendar.

**Task list first, dashboard fourth**, even though the dashboard is the landing screen.
The dashboard is largely a composition of components the list already needs, so building
it first means building them without their hardest use case in view.

### Phase 5 — States and polish

Every empty state, every skeleton, error tiers, undo toast, optimistic rollback, reduced
motion, and the full accessibility pass.

**Do not defer this phase.** It is the phase that gets cut, and it is the difference
between a demo and a product — which matters especially for a portfolio project, where
the empty states are what a reviewer will deliberately go looking for.

---

## 10.8 How to validate the design

Cheap checks, in order of value per minute spent:

1. **Count the interactions** for the eight flows in §10.1 on the built product. Any
   number that grew is a regression.
2. **Greyscale screenshot** of all seven screens, both themes (09 §9.10).
3. **Unplug the mouse.** Complete a task, create one with a due date, filter by category,
   and delete one with undo. Anything unreachable is a bug.
4. **Resize from 1920 to 320px continuously.** Watch for content escaping the viewport,
   overlays that close, and layouts that break between breakpoints rather than at them.
5. **Load with the network throttled to Slow 3G.** Verify the shell renders first, the
   skeletons match the real geometry, and nothing flashes for under 200ms.
6. **Add 500 tasks.** Verify grouping, virtualization, and that the sidebar counts stay
   correct.
7. **Rotate a tablet.** Navigation should not move.
8. **Use it for a week.** No substitute — the daily loop is the only thing that reveals
   whether the ten-second visit actually works.

---

## Design proposal — index

| Module | Covers | Key output |
|---|---|---|
| [01](01-concept-ia-navigation.md) | Concept, IA, navigation | 5 principles, target schema, 4-destination nav |
| [02](02-design-system.md) | Design system | Verified tokens, **10 contrast failures found and fixed** |
| [03](03-component-system.md) | Components | 15 atoms → 14 molecules → 14 organisms |
| [04](04-screens-dashboard-tasklist.md) | Dashboard, Task list | Three-breakpoint wireframes, grouping and sort model |
| [05](05-screens-create-details.md) | Create/Edit, Details | Field spec, validation model, delete/undo flow |
| [06](06-screens-categories-calendar.md) | Categories, Calendar | Overdue strip, Unscheduled panel |
| [07](07-empty-loading-error-states.md) | Empty, loading, error | Five kinds of empty, full copy, three error tiers |
| [08](08-responsive-behavior.md) | Responsive | Three overlay transformations, modality vs width |
| [09](09-light-dark-mode.md) | Light & dark | Elevation strategy per theme, `--on-primary` |
| [10](10-ux-recommendations.md) | UX & implementation | Interaction budget, roadmap, known gaps |

---

## Final note

The two most valuable things in this proposal are not screens.

The first is the **contrast audit** — ten real WCAG failures in a palette that looked
finished, each one on a component the product needs, every fix verified rather than
asserted. That work is invisible in a mockup and expensive to retrofit after components
are built.

The second is the **interaction budget** in §10.1. A task tracker does not win on visual
design; every competitor is already clean and rounded. It wins on whether capturing a
thought takes two interactions or six. Everything else in these ten modules exists to
protect those eight numbers.
