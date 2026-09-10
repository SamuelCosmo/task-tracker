# Module 07 — Empty, Loading & Error States

> Output section 5, part 4 of 4. These states are the majority of a new user's first
> session and a meaningful fraction of every session after, yet they are the first thing
> cut from most designs. This module treats them as primary screens.

---

## Resolved question from Module 06

**Empty states use a 48px icon in a 96px tinted circle, not bespoke line-art
illustrations.**

An illustration set means ~12 original drawings, each needing a light and a dark variant
(24 assets), each needing to survive a palette change, none of them reusable anywhere
else in the product. That is a real production and maintenance cost for decoration. At
this product's tone — quiet, precise, slightly technical — a 48px icon from the existing
set, in a tinted circle, reads as **intentional** rather than unfinished, costs nothing,
and is themed for free because icons inherit `currentColor`.

*The general principle:* an empty state's job is to explain and offer an exit, not to
entertain. Illustration is worth its cost only when the empty state is a marketing
surface, and this one is not.

---

## 7.1 The five kinds of "nothing here"

Most designs collapse these into one generic empty state. They are different situations
with different causes and different correct exits, and conflating them is why empty
states so often feel useless.

| # | Kind | Cause | User feels | Correct response |
|---|---|---|---|---|
| 1 | **First use** | Nothing has ever existed | Curious, unoriented | Teach and offer the primary action |
| 2 | **Cleared** | Everything was completed or deleted | Accomplished | Acknowledge it; do not push more work |
| 3 | **Filtered out** | Content exists but is hidden by search or filters | Confused, suspects a bug | Name the filter and offer to remove it |
| 4 | **Loading** | Content is on its way | Waiting | Show the shape of what is coming |
| 5 | **Error** | Content could not be fetched | Blocked | Explain, and offer retry |

**Kind 2 is the one most often mishandled.** Completing every task for the day and being
met with "No tasks. Create your first task!" tells the user their achievement was
invisible to the system. It should read as a finish line, not a blank slate.

**Kind 3 is the one most often missed entirely.** A filtered-out list that shows the
first-use empty state actively misinforms — the user is told they have no tasks when
they have twenty-three.

---

## 7.2 Anatomy

Three sizes, chosen by the region being filled.

```
FULL (page-level, ≥320px of vertical room)

              ╭─────────────╮
              │             │        96px circle, --surface-secondary
              │      ◇      │        48px icon, --text-muted
              │             │
              ╰─────────────╯
                                     space-5
            Nothing due today        text-h3, --text-primary
                                     space-2
      You're all caught up. Enjoy    text-body, --text-secondary
              the quiet.             max-width 40ch, centered
                                     space-5
          ┌───────────────┐
          │  + New task   │          primary Button, md
          └───────────────┘
                                     space-3
            View all tasks           link Button (optional)
```

| Size | Circle / icon | Headline | Body | Actions | Used in |
|---|---|---|---|---|---|
| **Full** | 96 / 48px | `text-h3` | `text-body` | 1 primary + 1 link | Page-level: empty task list, no categories, task not found |
| **Section** | 64 / 32px | `text-body-strong` | `text-sm` | 1 link or ghost | Inside a card or section: Today section, day panel |
| **Inline** | none | — | `text-sm`, `--text-muted`, left-aligned | 0–1 link | Single-line: "No description", empty agenda day |

All sizes are vertically centered in their container with `space-10` padding (`space-6`
for section, none for inline), and capped at 320px wide so the text does not sprawl.

---

## 7.3 Copy rules

Five rules, and they apply to every string in this module.

1. **Headline states the situation. Body explains or reassures. Action resolves it.**
   Never put the explanation in the headline.
2. **No exclamation marks, no "Oops", no "Uh oh", no emoji.** They perform an emotion
   the user is not having and make errors feel unserious.
3. **Second person, present tense, contractions allowed.** "You're all caught up", not
   "The user has no remaining tasks".
4. **Never blame the user.** "No tasks match these filters", not "You have no matching
   tasks".
5. **Body copy is one sentence, under 12 words where possible.** Nobody reads paragraph
   two of an empty state.

**On errors specifically:** say what happened, whether it is the user's problem, and what
to do. "Couldn't load your tasks · Check your connection and try again" does all three in
nine words. "An error occurred" does none of them.

---

## 7.4 Empty state catalogue

Every empty state in the product, with final copy.

### First use (kind 1)

| Location | Icon | Headline | Body | Actions |
|---|---|---|---|---|
| Dashboard, no tasks ever | `sparkles` | Let's get started | Add your first task above — a title is all you need. | *(QuickAdd is autofocused; no button)* |
| Task list, no tasks ever | `list-checks` | No tasks yet | Everything you add will show up here. | **＋ New task** |
| Categories, all deleted | `tag` | No categories yet | Categories group your tasks by area of life. | **＋ New category** · restore chips: Work · Personal · Study · Health |
| Calendar, no dated tasks | `calendar` | Nothing scheduled | Give a task a due date and it'll appear here. | **＋ New task** · *View unscheduled (7)* |

**The dashboard variant deliberately has no button** — the QuickAdd field directly above
it is autofocused and the cursor is already blinking in it. A button would point at a
field the user is already inside.

### Cleared (kind 2)

| Location | Icon | Headline | Body | Actions |
|---|---|---|---|---|
| Today section, nothing due | `sun` | Nothing due today | You're all caught up. Enjoy the quiet. | *View upcoming* |
| Today section, all completed | `check-circle` **in `--success`** | All done for today | 7 of 7 tasks completed. | *View upcoming* |
| Task list, all completed | `check-circle` in `--success` | Everything's done | All 23 tasks are complete. | *View completed* |
| Completed view, none yet | `circle-dashed` | No completed tasks yet | Tasks you finish will be collected here. | *View all tasks* |
| Overdue view, none | `check-circle` in `--success` | Nothing overdue | You're on top of everything. | *View all tasks* |
| Calendar day panel, empty day | `calendar` (section size) | No tasks on Sep 12 | — | **＋ Add task for Sep 12** |
| Unscheduled panel, empty | `calendar-check` (section) | Everything's scheduled | — | — |

**"All done for today" is the only empty state with a green icon.** It is the one moment
worth celebrating, and per Module 03 §6.0 green is reserved precisely for it. It states
the count, because "7 of 7" is the evidence and "All done" alone is just a label.

**"No completed tasks yet" offers a link back to all tasks, not "Create a task".** The
user is looking at a report, not a work queue; pushing creation here answers a question
they did not ask.

### Filtered out (kind 3)

| Location | Icon | Headline | Body | Actions |
|---|---|---|---|---|
| Search, no results | `search-x` | No tasks match "invoice" | Try a different word, or clear your filters. | **Clear search** · *Clear all filters* |
| Filters, no results | `filter-x` | No tasks match these filters | Work · High · Due this week | **Clear all filters** |
| Both active, no results | `search-x` | No tasks match "invoice" with these filters | Work · High | **Clear search** · *Clear all filters* |
| Category with no tasks | `tag` | Nothing in Work yet | Tasks you assign to this category will appear here. | **＋ New task in Work** |
| Calendar month, empty | `calendar` | Nothing scheduled in March 2027 | — | **Back to today** |

**The body lists the active filters by name.** This is the single most useful thing an
empty results state can do: it converts "where did my tasks go?" into "ah, High priority
is still on".

**Clear search and Clear all filters are separate actions**, because the user almost
always knows which one they meant, and a combined "Reset" throws away work they wanted to
keep.

The category variant pre-fills the new task with that category (Module 05 §5.5.1).

---

## 7.5 Loading states

Per Module 03 §6.5: **skeletons are the default, spinners are the exception, the app
shell never blanks.**

### The 200ms rule

No loading state renders before 200ms. Anything faster flashes and reads as a glitch —
a skeleton that appears and vanishes within 120ms is worse than a brief blank.

Conversely, **anything past 200ms must show something**, or the user starts pressing
things again.

### Skeleton specifications

Skeletons mirror the real layout's geometry exactly. A skeleton at the wrong height
causes a layout jump on load, which is more disruptive than the wait it replaced.

**Task list**

```
  ┌────────────────────────────────────────────┐
  │▌   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬              │  ← 56px row (exact)
  │▌   ▬▬▬▬▬▬▬▬▬▬▬▬                            │     title bar 60% width, 14px tall
  ├────────────────────────────────────────────┤     meta bar 40% width, 12px tall
  │▌   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬                       │
  │▌   ▬▬▬▬▬▬▬▬▬▬                              │
  └────────────────────────────────────────────┘
     5 rows · group headers included · widths vary per row
```

Title bar widths alternate 60% / 75% / 45% / 68% / 55% rather than being uniform.
*Why vary them:* Five identical bars read as a graphic; varied widths read as text that
has not arrived yet, which is what a skeleton is supposed to communicate.

**Dashboard**

| Region | Skeleton |
|---|---|
| Greeting | 200×32 bar + 140×16 bar |
| QuickAdd | Rendered live, not skeletoned — it needs no data |
| Overdue callout | Omitted until known; it must not flash in and out |
| Today section | Header bar + 3 task row skeletons |
| Progress card | 64px circle skeleton + 100×14 bar |
| Stat tiles | 4 tiles with a 32px circle and two bars each |

**QuickAdd renders live during load** because it depends on no server data, and it means
the user can start capturing before the dashboard has finished arriving — which is the
fastest possible perceived load.

**Task detail panel:** 240×20 title bar, two 22px badge pills, a full-width 40px button
skeleton, then five 36px metadata rows with a 96px label bar and a variable value bar.

**Calendar:** the full grid renders immediately with real dates and no chips — the grid
structure needs no data. Chips fade in per cell as tasks arrive.
*Why:* The month's structure is the majority of the screen and is derivable client-side,
so skeletoning it would hide information already known.

**Categories:** 4 card skeletons in the real grid, each with a 40px circle, a 120×16
name bar, a 90×12 count bar, and a full-width 6px progress bar.

### Skeleton visual spec

`--surface-secondary` fill, `radius-sm`, with a 1.6s shimmer sweeping a
`--surface`-to-transparent gradient from −100% to 100%. Under
`prefers-reduced-motion: reduce` the shimmer is dropped for a static fill at 60% opacity.
Skeleton containers carry `aria-busy="true"` and `aria-live="polite"`, and the arrival is
announced ("23 tasks loaded").

### Other loading mechanisms

| Mechanism | Where | Spec |
|---|---|---|
| Button spinner | Form submits, Retry | 16px spinner replaces the label at locked width |
| Optimistic | Checkbox, QuickAdd, inline detail edits, drag-to-reschedule | **No loading UI at all** |
| Inline row spinner | A single row saving after a failed optimistic retry | 16px spinner replaces the checkbox |
| Progressive | Calendar chips, category counts | Container renders; contents fill in |
| Full-screen spinner | **Never** | — |

---

## 7.6 Error states

Three tiers, chosen by how much is broken.

### Tier 1 — Toast (an action failed, the screen is fine)

Used for: failed completion toggle, failed save, failed delete, failed inline edit.

| Situation | Copy | Action |
|---|---|---|
| Completion toggle failed | Couldn't update the task | **Retry** |
| Create failed | Couldn't create the task | **Retry** *(reopens the form with content intact)* |
| Save failed | Couldn't save your changes | **Retry** |
| Delete failed | Couldn't delete the task | **Retry** |
| Inline edit failed | Couldn't update priority | **Retry** |

Every one of these **rolls the optimistic change back first**, so the UI never shows a
state the server does not hold. Error toasts use `aria-live="assertive"` and persist 8
seconds rather than 5.

### Tier 2 — Inline (one region failed, the rest works)

The region is replaced by a bordered container at the region's real height, with a
`alert-circle` icon, a message, and a Retry button. The rest of the screen stays
interactive.

| Region | Copy |
|---|---|
| Task list | Couldn't load your tasks · Check your connection and try again. |
| Task detail panel | Couldn't load this task |
| Calendar month | Couldn't load this month |
| Category counts | Counts unavailable *(inline, no retry — non-essential)* |

**The detail panel does not close on error.** Closing would lose the user's place in the
list, punishing them twice for one failure.

**Non-essential regions degrade silently.** A failed category count shows "—", not an
error block; it is not worth an alarm.

### Tier 3 — Full screen (the app cannot proceed)

| Situation | Icon | Headline | Body | Actions |
|---|---|---|---|---|
| Task not found | `file-question` | This task no longer exists | It may have been deleted. | **Back to tasks** |
| Category not found | `tag` | This category no longer exists | — | **Back to categories** |
| Route not found | `compass` | Page not found | — | **Back to dashboard** |
| Server error | `server-crash` | Something went wrong on our end | Try again in a moment. | **Retry** · *Back to dashboard* |
| Offline | `wifi-off` | You're offline | Your changes will be saved when you reconnect. | **Retry** |

Full-screen errors render **inside the app shell** — sidebar, header, and navigation stay
present and functional. *Why:* Keeping navigation available turns a dead end into a
detour, and the shell is already rendered anyway.

### Offline behavior

| Capability | Offline |
|---|---|
| Read already-loaded tasks | Works |
| Complete a task | Optimistic; queued; syncs on reconnect |
| Create a task | Optimistic; queued; syncs on reconnect |
| Delete a task | **Blocked** — toast: "You're offline · Deleting needs a connection" |
| Navigate to an unloaded screen | Tier 3 offline state |

A persistent `--warning-light` strip appears under the header: "You're offline · 2
changes will sync when you reconnect", replaced on reconnect by a 3-second
`--success-light` strip: "Back online · Changes synced".

**Delete is blocked offline** because its undo window is time-based (Module 05 §5.7.5).
Queueing a delete whose 8-second undo already expired, hours before it is sent, would
make it irreversible in a way the user was never shown.

*Note:* offline queueing depends on client-side persistence that the current
architecture does not yet have. If it is not built, the honest fallback is to make
mutations fail loudly with Tier 1 toasts rather than to appear to succeed. **Silently
dropping a write is the one behavior that must not ship.**

---

## 7.7 Selection table

Which mechanism, for which situation:

| Situation | Mechanism |
|---|---|
| Data is loading, layout is known | Skeleton (after 200ms) |
| Data is loading, layout depends on the data | Section skeleton at min-height |
| Structure is derivable client-side (calendar grid) | Render structure, fill contents progressively |
| User action, result is predictable | Optimistic, no loading UI |
| User action, result is unpredictable | Button spinner |
| Nothing exists yet | First-use empty state, with a create action |
| Everything is complete | Cleared empty state, acknowledging it |
| Content hidden by filters | Filtered empty state, naming the filters |
| One action failed | Toast + rollback |
| One region failed | Inline error + retry, shell intact |
| The screen cannot render | Full-screen error inside the app shell |
| Non-essential data failed | Degrade silently |

---

## Decisions locked by this module

1. Empty states use a 48px icon in a tinted circle; no bespoke illustrations.
2. Five distinct kinds of empty, never collapsed into one generic state.
3. Cleared states acknowledge the achievement instead of demanding more work.
4. Filtered empty states name the active filters, and offer clearing search and filters
   as separate actions.
5. Green is spent on exactly one empty state: "All done for today".
6. No loading state renders before 200ms; nothing past 200ms renders nothing.
7. Skeletons match real geometry exactly, with varied bar widths.
8. QuickAdd and the calendar grid render live during load.
9. Errors are three tiers; full-screen errors keep the app shell.
10. Optimistic failures always roll back before the toast appears.
11. Delete is blocked offline rather than queued.

## Carried into Module 08

- Whether the tablet breakpoint keeps the icon rail or switches to bottom navigation in
  portrait orientation.
  *(Leaning: keep the rail in both orientations — orientation-dependent navigation means
  the primary nav moves when the user rotates the device, which is disorienting for a
  gain that only applies to one-handed use of a device most people hold with two.)*
