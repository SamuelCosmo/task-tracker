# Module 08 — Responsive Behavior

> Output section 7. Consolidates the per-screen responsive notes from Modules 04–07 into
> one contract, and states the rules that generate them.

---

## Resolved question from Module 07

**The tablet icon rail is kept in both orientations.**

Orientation-dependent navigation means the primary nav physically moves when the user
rotates the device — the same four destinations jump from the left edge to the bottom
edge and change shape. That is disorienting, it invalidates muscle memory twice per
rotation, and it doubles the navigation states to test. The gain would be one-handed
reachability on a device most people hold with two hands.

**The rule this generalizes to: navigation is chosen by width, never by orientation.** A
768px-wide viewport gets the rail whether that width came from a portrait tablet, a
landscape phone, or a resized desktop window.

---

## 7.1 Approach

### Content priority, not device targets

The layout is derived from **what matters most on each screen** (the content-priority
tables in Module 01 §2.5), not from a list of devices. Mobile is a single column, so
vertical order *is* priority — which means the mobile layout is the priority ordering
made visible, and the wider layouts are that same ordering given more room.

*Why this direction:* Designing desktop-first and then removing things produces a mobile
layout defined by what happened to survive. Designing from priority produces the same
answer at every width, and makes "what gets dropped" a decision rather than an accident.

### One codebase, three layouts, no forks

Every screen is one component tree whose layout changes at breakpoints. There is no
separate mobile implementation.

*Why:* Two implementations means every feature is built twice and one of them is always
a version behind. The differences below are all expressible as layout and conditional
rendering.

### Fluid between breakpoints, deliberate at them

Within a tier, everything scales fluidly (percentage widths, flexible grids, `max-width`
caps). At a breakpoint, the layout genuinely changes — the sidebar becomes a rail, the
grid becomes a list. **No half-steps.**

*Why:* A layout that degrades continuously ends up bad at every width in a different
way. Three deliberate layouts, each correct at its range, beats one layout that is
approximately right everywhere.

---

## 7.2 Breakpoints

| Token | Range | Tier | Navigation | Gutter | Columns |
|---|---|---|---|---|---|
| `xs` | < 480px | **Mobile** | Bottom bar + FAB | 16px | 4 |
| `sm` | 480–767px | **Mobile** | Bottom bar + FAB | 16px | 4 |
| `md` | 768–1023px | **Tablet** | Icon rail (72px) | 24px | 8 |
| `lg` | 1024–1279px | **Desktop** | Sidebar (240px) | 32px | 12 |
| `xl` | ≥ 1280px | **Desktop** | Sidebar + detail panel | 32px | 12 |

**Why 768 and 1024:** They are where the *content* stops working, not where devices sit.
Below 768 a two-column task layout gives each column under 360px, which cannot hold a
task row. Below 1024, a 240px sidebar plus a 400px detail panel leaves under 400px for
the list itself. The device sizes that cluster near these numbers are a coincidence that
happens to be convenient.

**Content max-width is 1120px** at every tier above it. An unbounded task list on a 27"
monitor puts the checkbox and the due date half a metre apart.

**All breakpoint queries are container-aware in intent.** Where the platform supports
container queries, the detail panel and calendar day panel respond to *their own* width,
not the viewport's — a 400px panel on a 1440px screen should lay out like a narrow
column, because it is one.

---

## 7.3 The adaptation map

Every adapting element, in one table.

| Element | Mobile (<768) | Tablet (768–1023) | Desktop (≥1024) |
|---|---|---|---|
| **Primary nav** | Bottom bar, 4 items, 56px | Icon rail, 72px | Sidebar, 240px, labels + categories |
| **Create action** | FAB, 56px, bottom-right | Rail top button | Sidebar top button |
| **Search** | TopBar icon → full-width overlay | 240px inline | 320px inline |
| **Settings** | TopBar overflow | Rail bottom | Sidebar footer |
| **Screen title** | TopBar, contextual, 56px | In content | In content |
| **Dashboard columns** | 1 | 1 + stats band | 2 (main + 320px rail) |
| **Progress indicator** | 32px strip, below the list | 64px ring, in the band | 64px ring, in the rail |
| **Stat tiles** | 2×2 grid | 4-up row | 2×2 in the rail |
| **Quick actions** | Dropped (FAB + nav cover it) | Dropped | Sidebar rail |
| **Task row height** | 64px | 56px | 56px |
| **Status badge in row** | Hidden | Hidden | Visible |
| **View switcher** | Scrollable chips | SegmentedControl | SegmentedControl |
| **Sort control** | Inside the filter sheet | Separate menu | Separate menu |
| **Filters** | Bottom sheet | Popover | Popover |
| **Create task** | Full-screen route | Modal 560px | Modal 560px |
| **Form field layout** | Stacked, full width | 2-column for compact fields | 2-column for compact fields |
| **Form submit** | Header text button | Modal footer | Modal footer |
| **"Save and add another"** | Absent | Present | Present |
| **Task details** | Full-screen route | Full-screen route | Side panel, 400px |
| **Detail metadata rows** | 48px | 40px | 36px |
| **Dropdowns / selects** | Bottom sheet | Popover | Popover |
| **Date picker** | Bottom sheet, 44px cells | Popover, 36px cells | Popover, 36px cells |
| **Calendar** | Agenda + week strip | Month grid, dot cells | Month grid, title chips |
| **Calendar day detail** | Route | Route | Side panel |
| **Categories grid** | 1 column, 88px rows | 2 columns | 2 (lg) / 3 (xl) columns |
| **Empty state size** | Full | Full | Full |
| **Toast position** | Bottom-center, above nav | Bottom-left | Bottom-left |
| **Overflow actions** | Always visible | Hover-revealed | Hover-revealed |

Each of these is justified in the module where its screen is specified; this table is the
index, not the argument.

---

## 7.4 The three overlay transformations

Three rules cover almost every responsive difference in the product. Applying them
consistently is what makes the tiers feel like the same app.

| Desktop form | Mobile form | Why |
|---|---|---|
| **Modal** (centered, 560px) | **Full-screen route** | A modal over a keyboard-shrunk viewport leaves ~⅓ of the screen usable |
| **Popover** (anchored to a trigger) | **Bottom sheet** | A popover anchored near the bottom of a phone opens off-screen or covers its own trigger |
| **Side panel** (400px, list stays live) | **Full-screen route** | 400px of a 360px viewport is not a panel |

**All three mobile forms push a history entry**, so the system back gesture closes them
(Module 01 §3.8). This is what makes the transformation invisible: on desktop `Esc`
closes an overlay, on mobile back closes a route, and in both cases the user's instinct
works.

---

## 7.5 Input modality — orthogonal to width

**Width tells you how much room there is. It does not tell you what is pointing at the
screen.** A 1400px touchscreen laptop and a 1400px desktop need the same layout and
different affordances.

| Query | Affects |
|---|---|
| `(hover: hover) and (pointer: fine)` | Hover states, hover-revealed overflow buttons, tooltips |
| `(pointer: coarse)` | 44px minimum targets, always-visible overflow, swipe gestures |
| `(hover: none)` | Anything hover-only must have a non-hover path |

**Rules**

1. **Hover styles are always wrapped in `@media (hover: hover)`.** Without it, a tap on
   touch leaves the hover state stuck until the next tap elsewhere — an element that
   looks permanently selected.
2. **No affordance is hover-only.** The row overflow button is hover-revealed on pointer
   and permanently visible on touch (Module 03 §6.4). A hover-only affordance on a touch
   device is an unreachable feature.
3. **Touch targets are set by `pointer: coarse`, not by width.** A touchscreen laptop at
   1400px still gets 44px targets.
4. **Swipe gestures are additive only.** Swipe-to-complete and swipe-to-delete always
   have a menu equivalent (Module 01 §1.4) — they are unreachable to keyboard and screen
   reader users, and undiscoverable without a hint.
5. **Tooltips are pointer-only.** On touch there is no hover to trigger them, and
   long-press already means something else.

*Why this matters more than it appears:* Every "why is this button stuck highlighted on
my phone" bug traces back to rule 1, and every "I can't find how to delete on mobile"
bug traces back to rule 2.

---

## 7.6 Typography and spacing across tiers

**The type scale does not change.** 14px body is 14px on every device.

*Why not scale down on mobile:* 14px is already at the comfortable floor for body text,
and phones are held closer to the eye than monitors — the apparent size is already
larger, not smaller. Shrinking type on mobile is a habit inherited from designs whose
desktop type was too large to begin with.

**Three exceptions, all headline-level:**

| Element | Desktop | Mobile | Why |
|---|---|---|---|
| Dashboard greeting | `text-display` 32px | `text-h1` 24px | 32px wraps awkwardly at 360px and eats a quarter of the fold |
| Screen title | `text-h1` 24px | `text-h2` 20px in a 56px TopBar | Must fit a bar shared with two icon buttons |
| Empty state headline | `text-h3` 16px | unchanged | Already small |

**Spacing scales at the gutter only** — 16 / 24 / 32px. Component-internal padding does
**not** change with width, because a card's inner padding is set by its content's
breathing room, not by the viewport.

**Row heights grow on touch** (56 → 64px), because two lines of text plus a 44px target
need the vertical room. This is a touch adaptation, not a width adaptation, and follows
`pointer: coarse`.

---

## 7.7 What gets dropped, and why

Each tier has a vertical budget. Below `md`, these are removed rather than compressed:

| Dropped on mobile | Reason | Where it survives |
|---|---|---|
| Dashboard quick actions | FAB + bottom nav already cover all four | Desktop rail |
| Status badge in task rows | Third badge does not fit at 360px | Detail view, overflow menu |
| "Save and add another" | FAB reopen costs one tap | Desktop modal |
| Calendar task titles in cells | ~80px of usable cell width | Day panel, agenda list |
| Sidebar category shortcuts | Would need their own screen region | Categories tab, filter sheet |
| Inline sort control | 56px header cannot hold title + 3 controls | Filter sheet |
| Keyboard shortcut hints (`⌘K`) | No keyboard | Desktop only |

**Nothing is dropped without a surviving path.** Every row above names where the
capability still lives. A responsive design that removes a *capability* rather than an
*affordance* is a broken feature, not a compact layout.

**Nothing is added on mobile that desktop lacks**, with one exception: swipe gestures,
which are additive shortcuts to existing menu actions.

---

## 7.8 Orientation and unusual viewports

| Case | Handling |
|---|---|
| Phone landscape (e.g. 812×375) | Treated as `sm` by width. The bottom nav stays, TopBar drops to 48px, and the dashboard greeting collapses to one line to protect vertical room |
| Tablet portrait (768×1024) | `md` — icon rail, per the resolved question |
| Tablet landscape (1024×768) | `lg` — full sidebar. The user gains labels and category shortcuts on rotation, which is an addition, not a relocation |
| Split-screen / multitasking at 400px | Behaves as `xs`; layout is width-driven, so this works with no special handling |
| Desktop window resized across a breakpoint | Layout switches immediately; **open overlays transform in place** (a side panel at 1024px becomes a full-screen route at 900px, preserving its content and the list behind it) |
| Foldables, unfolding mid-session | Same as a resize; no state is lost because all view state is in the URL (Module 01 §2.6) |
| Browser zoom to 200% | Effective viewport halves, so a zoomed desktop lands on the tablet or mobile layout — which is the correct outcome, and is why the design must never rely on a fixed pixel content width |

**All view state lives in the URL**, which is what makes resize, rotation, and unfolding
lossless. This is the practical payoff of that Module 01 decision.

---

## 7.9 Verification matrix

Minimum set to check before shipping. Each entry is a width where something changes.

| Width | Why this width |
|---|---|
| 320px | Smallest realistic phone; the floor for text truncation and 44px targets |
| 360px | Most common Android width |
| 390px | Most common iPhone width |
| 480px | `xs` → `sm` boundary; stat tiles go 2×2 → row |
| 767 / 768px | Mobile → tablet; nav changes form |
| 834px | Common tablet portrait |
| 1023 / 1024px | Tablet → desktop; rail → sidebar, calendar dots → titles |
| 1280px | `lg` → `xl`; detail panel gains room, categories go 2 → 3 columns |
| 1920px | Verifies the 1120px content cap holds |

**Also verify at each width:** keyboard-only operation, 200% zoom, `prefers-reduced-motion`,
both themes, and a touch device at ≥1024px.

---

## 7.10 React Native translation

RN has no media queries and no CSS breakpoints. The contract above still holds; the
mechanism changes.

| Web | React Native |
|---|---|
| CSS media query | `useWindowDimensions()` + a `useBreakpoint()` hook returning `xs`…`xl` |
| `@media (hover: hover)` | `Platform.OS === 'web'`, or a capability check — on native, assume coarse pointer |
| `@media (pointer: coarse)` | Always true on native |
| Modal → route | `@react-navigation` modal presentation vs. screen |
| Popover → bottom sheet | A sheet component at every size; popovers are web-only |
| Side panel | Not applicable on phone; on tablet, a two-pane navigator |
| `position: sticky` | `stickyHeaderIndices` on `FlatList`/`SectionList` |
| CSS `outline` focus ring | `borderWidth` / `borderColor` on the focused element |
| Safe areas | `react-native-safe-area-context` — the bottom bar's 56px is **plus** the inset |

**Two consequences worth planning for now:**

- **The native app is `xs`/`md` only.** Phone is `xs`; tablet is `md`. The `lg`/`xl`
  sidebar-and-panel layouts exist only on web. Anything specified as desktop-only must
  therefore have a tablet path — which §7.7 already guarantees.
- **Grouped, sticky-header lists should be built on `SectionList` from the start.** The
  task list's grouping (Module 04 §5.2.3) maps to sections directly, and retrofitting it
  onto a flat list later means rewriting the virtualization.

---

## Decisions locked by this module

1. Navigation is chosen by width, never by orientation.
2. Three tiers with deliberate switches; fluid within a tier, no half-steps.
3. Modal → full-screen route, popover → bottom sheet, side panel → route.
4. All mobile overlay forms push history so system back closes them.
5. Hover affordances are gated on `hover: hover`; touch targets on `pointer: coarse`;
   neither is derived from width.
6. No affordance is hover-only; no capability is dropped without a surviving path.
7. The type scale does not change across tiers; only three headline sizes do.
8. Gutters scale; component-internal padding does not.
9. Open overlays transform in place across a breakpoint change rather than closing.
10. The native app targets `xs` and `md` only; every desktop-only affordance needs a
    tablet path.

## Carried into Module 09

- Whether the theme toggle offers Light / Dark / System, or only Light / Dark.
  *(Leaning: all three with System as the default — the OS preference is already the
  user's stated intent, and `globals.css` is already written to honor it when no explicit
  choice is set.)*
