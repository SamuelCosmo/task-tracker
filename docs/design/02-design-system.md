# Module 02 — Design System (Foundations)

> Output section 4. Everything here is a **primitive**: it has no opinion about tasks.
> Module 03 assembles these into components.
>
> All contrast figures in this document were computed against the WCAG 2.1 relative
> luminance formula, not estimated. Ratios are stated so they can be re-verified.

---

## 4.1 Typography

### Family

One family across the entire product: **Geist Sans** (already loaded in the client),
with a system fallback stack. Monospace (Geist Mono) is used only for dates in the
calendar grid and for numeric counters.

```
--font-sans:  Geist Sans, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
--font-mono:  Geist Mono, ui-monospace, "SF Mono", Menlo, monospace
```

**Why one family:** Hierarchy in a task app is carried by weight and size. A second
display face adds bundle weight, a second rendering pass, and a "marketing site" feel
that undercuts the tool's credibility.

### Scale

Base size is **14px**, not 16px. The interface is dense and information-led; 14px is
the standard for professional productivity tooling.

| Token | Size / Line height | Weight | Tracking | Used for |
|---|---|---|---|---|
| `text-display` | 32 / 40 | 600 | -0.02em | Dashboard greeting, empty-state headline |
| `text-h1` | 24 / 32 | 600 | -0.015em | Screen titles ("Tasks", "Calendar") |
| `text-h2` | 20 / 28 | 600 | -0.01em | Task detail title, modal title |
| `text-h3` | 16 / 24 | 600 | 0 | Section headers, card titles |
| `text-body-lg` | 16 / 24 | 400 | 0 | Task description, long-form reading |
| `text-body` | 14 / 20 | 400 | 0 | **Default.** Task titles, inputs, labels |
| `text-body-strong` | 14 / 20 | 500 | 0 | Task title in a list row, active nav item |
| `text-sm` | 13 / 18 | 400 | 0 | Metadata row, helper text |
| `text-caption` | 12 / 16 | 500 | 0 | Badges, chips, counts, timestamps |
| `text-overline` | 11 / 16 | 600 | 0.06em | Section labels ("CATEGORIES"), all-caps |

Ratio between steps is roughly 1.2. Only three weights ship: **400 / 500 / 600**.

**Why 500 for task titles in lists:** At 14px, medium weight separates the title from
its metadata line without needing a size change, which keeps every row the same height
and makes the list scannable as a grid rather than as prose.

### Typographic rules

- **Never below 12px** for anything a user must read. 11px is permitted only for
  all-caps overlines, where cap-height makes it read larger than its nominal size.
- **Tabular figures** (`font-variant-numeric: tabular-nums`) on all dates, counts, and
  progress numbers. *Why:* proportional digits make a column of counts jitter as values
  change, which reads as a layout bug.
- **Truncation:** task titles truncate at one line in list rows with an ellipsis, and
  the full title is exposed via `title`/`accessibilityLabel`. Descriptions clamp to two
  lines in preview contexts.
- **Line length:** body text caps at ~72 characters (`max-width: 65ch`) in the task
  description and detail view.
- **Sentence case everywhere** — buttons, labels, headers, menu items. No Title Case.
  *Why:* Sentence case is faster to read and keeps a utility tone; Title Case on
  buttons reads as marketing copy.

---

## 4.2 Spacing

A strict **4px base unit**. Every margin, padding, and gap in the product is one of
these values. There are no arbitrary spacing values.

| Token | Value | Typical use |
|---|---|---|
| `space-0` | 0 | Reset |
| `space-1` | 4px | Icon-to-label inside a chip |
| `space-2` | 8px | Icon-to-label in a button; gap between badges |
| `space-3` | 12px | Inner padding of compact controls; gap between metadata items |
| `space-4` | 16px | **Default.** Card padding, gap between cards, screen gutter (mobile) |
| `space-5` | 20px | Card padding (desktop, roomy cards) |
| `space-6` | 24px | Gap between sections; screen gutter (tablet) |
| `space-8` | 32px | Gap between major blocks; screen gutter (desktop) |
| `space-10` | 40px | Empty-state vertical padding |
| `space-12` | 48px | Top padding of a screen header region |
| `space-16` | 64px | Empty-state illustration clearance |

### Layout rhythm

| Context | Value |
|---|---|
| Screen gutter — mobile | `space-4` (16px) |
| Screen gutter — tablet | `space-6` (24px) |
| Screen gutter — desktop | `space-8` (32px) |
| Max content width | 1120px, centered |
| Gap between cards in a grid | `space-4` |
| Gap between form fields | `space-5` (20px) |
| Gap between form field groups | `space-6` |
| Inner padding, card | `space-5` desktop, `space-4` mobile |
| Inner padding, modal | `space-6` |

**Why 4px and not 8px:** An 8px-only scale forces either 8px or 16px for the gap
between a 20px icon and a 14px label — 8 is loose, and there is no 12. The 4px grid
keeps every value snapping cleanly while allowing the intermediate steps that dense UI
actually needs.

### Density modes

Two row heights are defined now; only *comfortable* ships in v1 (per the open question
carried from Module 01). Defining both up front means the compact mode is a token
swap, not a rebuild.

| Element | Comfortable | Compact |
|---|---|---|
| Task list row (desktop) | 56px | 44px |
| Task list row (mobile) | 64px | 56px |
| Nav item | 40px | 36px |
| Input / button height | 40px | 32px |

---

## 4.3 Border radius

| Token | Value | Applied to |
|---|---|---|
| `radius-xs` | 4px | Checkbox, colour swatch, inline code |
| `radius-sm` | 6px | Badge, small chip |
| `radius-md` | 8px | **Default control radius.** Button, input, select, dropdown item |
| `radius-lg` | 12px | Card, task row card, popover, calendar day cell |
| `radius-xl` | 16px | Modal, bottom sheet, side panel, empty-state container |
| `radius-full` | 9999px | Category chip, avatar, FAB, progress bar, toggle |

**Nesting rule:** an inner element's radius must be *smaller* than its container's by
roughly the padding between them. A `radius-md` (8px) input inside a `radius-lg` (12px)
card with 16px padding is correct; an 12px input inside a 12px card is not.
*Why:* Matching radii on nested corners produces visible tangency errors — the corners
look wrong even to people who cannot name why.

**Never mix radii on one element.** No single-side rounding except where a container is
deliberately flush against an edge (bottom sheet: `radius-xl` top corners, 0 bottom).

---

## 4.4 Elevation and shadows

Five levels. Elevation encodes *how far from the page* something is, which maps
directly to how modal it is.

| Level | Token | Light value | Used for |
|---|---|---|---|
| 0 | `shadow-none` | none (1px border only) | Flat surfaces, list rows at rest, inputs |
| 1 | `shadow-card` | `0 1px 3px rgba(15,23,42,.08), 0 1px 2px -1px rgba(15,23,42,.08)` | Cards, task cards at rest |
| 2 | `shadow-raised` | `0 4px 6px -1px rgba(15,23,42,.10), 0 2px 4px -2px rgba(15,23,42,.08)` | Card hover, FAB at rest |
| 3 | `shadow-overlay` | `0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.08)` | Dropdown, popover, tooltip, FAB pressed |
| 4 | `shadow-modal` | `0 20px 25px -5px rgba(15,23,42,.14), 0 8px 10px -6px rgba(15,23,42,.10)` | Modal, bottom sheet, side panel |

### The dark-mode elevation rule

**Shadows do not work on dark backgrounds.** A black shadow on a near-black canvas is
invisible. In dark mode, elevation is communicated by **surface lightening plus a
border**, with the shadow retained only to soften the edge.

| Level | Dark surface | Dark border | Dark shadow |
|---|---|---|---|
| 0 | `--surface` `#1e293b` | `--border` `#334155` | none |
| 1 | `--surface` `#1e293b` | `--border` `#334155` | `0 1px 3px rgba(0,0,0,.30)` |
| 2 | `#243449` (surface +4% L) | `#3d4a5f` | `0 4px 6px -1px rgba(0,0,0,.35)` |
| 3 | `#293b52` | `#475569` | `0 10px 15px -3px rgba(0,0,0,.45)` |
| 4 | `#2a3d55` | `#475569` | `0 20px 25px -5px rgba(0,0,0,.55)` |

**Why:** This is the single most common dark-mode failure — designs that keep the
light-mode shadow tokens and end up with every card visually welded to the background.
Two new dark surface tokens (`--surface-raised`, `--surface-overlay`) are required;
they are listed in the token delta at §4.12.

---

## 4.5 Color system

### 4.5.1 Contrast audit of the committed palette

The palette in `client/app/globals.css` was audited against WCAG 2.1. **Seven pairings
fail.** These are not theoretical — each one appears in a component this design calls
for.

| # | Pairing | Ratio | Required | Verdict |
|---|---|---|---|---|
| 1 | `--text-muted` `#94a3b8` on `--surface` (light) | **2.56** | 4.5 | Fails. Used for timestamps and metadata. |
| 2 | `--success` `#22c55e` as text/mark on white | **2.28** | 4.5 / 3.0 | Fails both. Used for "Done" badge text. |
| 3 | `--warning` `#f59e0b` as text/mark on white | **2.15** | 4.5 / 3.0 | Fails both. Used for medium priority. |
| 4 | `--success` on `--success-light` (badge) | **2.07** | 4.5 | Fails. This is the "Done" badge. |
| 5 | `--warning` on `--warning-light` (badge) | **1.93** | 4.5 | Fails. This is the "Medium" badge. |
| 6 | White label on `--primary` `#818cf8` (**dark mode**) | **2.98** | 4.5 | Fails. Every primary button in dark mode. |
| 7 | `--primary` on `--primary-light` `#312e81` (dark) | **3.83** | 4.5 | Fails as body text. Active nav item. |

**Root cause:** the palette was built by picking Tailwind's 500-weight colors for both
themes. A 500-weight color is tuned to be a *fill* behind white text, not to be text
itself on white. The fix is to add a `-strong` text tier per status rather than to
change the fills, so the vivid fills are preserved where they work.

### 4.5.2 Corrected semantic tokens

**Light mode**

| Token | Value | Change | Verified |
|---|---|---|---|
| `--background` | `#f8fafc` | — | |
| `--surface` | `#ffffff` | — | |
| `--surface-secondary` | `#f1f5f9` | — | |
| `--surface-raised` | `#ffffff` | **new** | elevation 2–3 |
| `--text-primary` | `#0f172a` | — | 17.85:1 on surface |
| `--text-secondary` | `#475569` | **was `#64748b`** | 7.58:1 on surface |
| `--text-muted` | `#64748b` | **was `#94a3b8`** | 4.76:1 on surface |
| `--text-disabled` | `#94a3b8` | **new** | exempt (see §4.10) |
| `--primary` | `#4f46e5` | — | 6.29:1 on surface |
| `--primary-hover` | `#4338ca` | — | |
| `--primary-light` | `#eef2ff` | — | primary on it: 5.62:1 |
| `--on-primary` | `#ffffff` | **new** | 6.29:1 on primary |
| `--border` | `#e2e8f0` | — | decorative separators only |
| `--border-strong` | `#64748b` | **new** | 4.76:1 — interactive control outlines |
| `--border-focus` | `#4f46e5` | **was `#818cf8`** | 6.29:1 focus ring |
| `--success` / `--success-light` / `--success-strong` | `#22c55e` / `#dcfce7` / `#15803d` | strong is new | 4.57:1 on tint, 5.02:1 on white |
| `--warning` / `--warning-light` / `--warning-strong` | `#f59e0b` / `#fef3c7` / `#b45309` | strong is new | 4.51:1 on tint, 5.02:1 on white |
| `--error` / `--error-light` / `--error-strong` | `#ef4444` / `#fee2e2` / `#b91c1c` | strong is new | 5.30:1 on tint, 6.47:1 on white |
| `--info` / `--info-light` / `--info-strong` | `#3b82f6` / `#dbeafe` / `#1d4ed8` | strong is new | 5.49:1 on tint, 6.70:1 on white |

**Dark mode**

| Token | Value | Change | Verified |
|---|---|---|---|
| `--background` | `#0f172a` | — | |
| `--surface` | `#1e293b` | — | 1.22:1 vs background — see §4.5.4 |
| `--surface-secondary` | `#334155` | — | |
| `--surface-raised` | `#243449` | **new** | elevation 2 |
| `--surface-overlay` | `#293b52` | **new** | elevation 3–4 |
| `--text-primary` | `#f8fafc` | — | 13.98:1 on surface |
| `--text-secondary` | `#cbd5e1` | — | 9.85:1 on surface |
| `--text-muted` | `#94a3b8` | — | 5.71:1 on surface |
| `--text-disabled` | `#64748b` | **new** | exempt |
| `--primary` | `#818cf8` | — | 4.90:1 on surface |
| `--primary-hover` | `#a5b4fc` | — | |
| `--primary-light` | `#312e81` | — | |
| `--on-primary` | `#0f172a` | **new — critical** | 5.98:1 on primary (white was 2.98) |
| `--primary-strong` | `#a5b4fc` | **new** | 5.73:1 on `--primary-light` |
| `--border` | `#334155` | — | decorative only |
| `--border-strong` | `#64748b` | **new** | 3.07:1 on surface |
| `--border-focus` | `#a5b4fc` | **was `#818cf8`** | 7.34:1 on surface, 8.96:1 on background |
| `--success-strong` | `#4ade80` | new alias | 5.23:1 on `--success-light` |
| `--warning-strong` | `#fbbf24` | new alias | 5.43:1 on `--warning-light` |
| `--error-strong` | `#fca5a5` | **not `#f87171`** | 5.28:1 (`#f87171` was 3.62) |
| `--info-strong` | `#93c5fd` | **not `#60a5fa`** | 5.74:1 (`#60a5fa` was 4.07) |

### 4.5.3 Color semantics — what each color is allowed to mean

| Color | Means | Never used for |
|---|---|---|
| Indigo (`--primary`) | Interactive, selected, in-progress | Status, priority, category |
| Green (`--success`) | Completed, low priority | Buttons, links |
| Amber (`--warning`) | Due soon (≤2 days), medium priority | Errors |
| Red (`--error`) | Overdue, high priority, destructive | Anything routine |
| Blue (`--info`) | Neutral information, "today" marker | Success, primary actions |
| Slate | Everything else | Meaning of any kind |

**One rule that governs all of them:** color is never the only carrier of meaning.
Every status badge, priority badge, and due-date warning pairs its color with a **text
label or an icon**. *Why:* WCAG 1.4.1, and more practically, ~8% of men have some form
of color vision deficiency — red/green priority is exactly the confusion pair.

This rule also resolves the vividness trade-off: because `--success` `#22c55e` is
always a *fill behind* `--success-strong` text and never text itself, the palette keeps
its vibrancy without failing contrast.

### 4.5.4 Surface separation

`--surface` vs `--background` is **1.05:1 in light** and **1.22:1 in dark** — far below
any perceptual separation threshold. This is intentional and acceptable *only because
cards carry a border and/or a shadow*.

**Rule:** every card, panel, popover, and modal has **either** a visible border **or** a
level ≥1 shadow, and in dark mode it has **both**. A borderless, shadowless card is
invisible against the canvas.

### 4.5.5 Category palette

Eight fixed colors assigned to categories. Users pick from these; they do not enter
arbitrary hex values.

| Name | Light text | Light tint | Dark text | Dark tint | Verified (text on tint) |
|---|---|---|---|---|---|
| Indigo | `#4f46e5` | `#eef2ff` | `#a5b4fc` | `#312e81` | 5.62 / 5.73 |
| Sky | `#0369a1` | `#e0f2fe` | `#7dd3fc` | `#075985` | 5.17 / 4.54 |
| Emerald | `#047857` | `#d1fae5` | `#6ee7b7` | `#065f46` | 4.84 / 5.04 |
| Amber | `#b45309` | `#fef3c7` | `#fcd34d` | `#78350f` | 4.51 / 6.29 |
| Rose | `#be123c` | `#ffe4e6` | `#fecdd3` | `#9f1239` | 5.24 / 5.68 |
| Violet | `#7c3aed` | `#f3e8ff` | `#c4b5fd` | `#5b21b6` | 4.83 / 4.87 |
| Teal | `#0f766e` | `#ccfbf1` | `#5eead4` | `#115e59` | 4.86 / 5.13 |
| Slate | `#475569` | `#f1f5f9` | `#cbd5e1` | `#334155` | 6.92 / 6.97 |

Seeded assignment: **Work → Indigo, Personal → Rose, Study → Violet, Health → Emerald.**

**Why a fixed palette rather than a color picker:** A free picker guarantees that some
user eventually chooses a color that fails contrast in one of the two themes, and there
is no way to fix it after the fact. Eight curated pairs are enough for a personal tool
and are verified in both themes.

**Note the overlap:** category Amber and Emerald share hues with warning and success.
This is disambiguated by *shape and position* — categories are always full-round chips
with an icon in the metadata row; status and priority are always squared badges. If
that proves confusing in testing, the fallback is to drop Amber and Emerald from the
category set rather than to recolor the status system.

---

## 4.6 Icons

**Set:** a single outline set with consistent geometry (Lucide, or equivalent). No
mixing of filled and outline styles in the same context.

| Size | Stroke | Used for |
|---|---|---|
| 16px | 1.5 | Inline with `text-sm` / `text-caption`, inside chips and badges |
| 20px | 1.75 | **Default.** Buttons, list-row affordances, form field adornments |
| 24px | 2 | Mobile bottom nav, screen headers, FAB |
| 32px | 2 | Empty-state illustration accents |
| 48px | 1.5 | Empty-state primary graphic |

### Rules

- Icons **inherit `currentColor`**. No hardcoded icon colors — this is what makes them
  correct in both themes for free.
- **Optical alignment:** icon and text are centered on the text's cap-height, not on its
  line box, or the icon will sit visibly low.
- **Icon-only buttons require an accessible label** (`aria-label` / `accessibilityLabel`)
  and a tooltip on desktop. No exceptions.
- **Icons never carry meaning alone** where that meaning is not conventional. A trash
  icon is fine; a colored dot indicating priority is not.
- **Hit target ≥ 44×44px on touch**, ≥ 32×32px on pointer (40px preferred), even when
  the icon itself is 20px. Padding creates the target; the icon does not grow.

### Core icon assignments

| Concept | Icon |
|---|---|
| Home / dashboard | `home` |
| Tasks | `list-checks` |
| Calendar | `calendar-days` |
| Categories | `tag` |
| Create | `plus` |
| Search | `search` |
| Filter | `sliders-horizontal` |
| Sort | `arrow-up-down` |
| Edit | `pencil` |
| Delete | `trash-2` |
| Complete | `check` |
| Overdue | `alert-circle` |
| Due date | `calendar` |
| In progress | `circle-dot` |
| More actions | `more-horizontal` |
| Settings | `settings` |
| Theme | `sun` / `moon` |

---

## 4.7 Motion

| Token | Duration | Easing | Used for |
|---|---|---|---|
| `motion-instant` | 100ms | `linear` | Color and opacity on hover |
| `motion-fast` | 150ms | `cubic-bezier(.2,0,0,1)` | Checkbox check, badge change, focus ring |
| `motion-base` | 200ms | `cubic-bezier(.2,0,0,1)` | Popover/dropdown open, card lift |
| `motion-slow` | 280ms | `cubic-bezier(.2,0,0,1)` | Modal enter, side panel slide |
| `motion-sheet` | 320ms | `cubic-bezier(.32,.72,0,1)` | Bottom sheet, mobile route transition |

### Rules

- **Exits are faster than entrances** — roughly 0.75× the enter duration. *Why:* Waiting
  for something to leave feels like lag; waiting for something to arrive feels like
  craft.
- **Motion always has an origin.** Popovers scale from 0.96 with the transform origin at
  the trigger. Sheets translate from the edge they belong to. Nothing cross-fades in
  place, because a cross-fade tells the user nothing about where the thing came from.
- **Never animate layout-affecting properties.** `transform` and `opacity` only.
- **List reordering is not animated in v1.** A task moving position after a sort change
  animates only its opacity.
- **`prefers-reduced-motion: reduce` is respected**: all transforms are dropped, all
  durations collapse to 0–100ms opacity fades. The completion checkmark keeps a
  100ms fade so the state change is still perceptible.

### The completion animation — the one flourish

Checking a task off is the product's reward moment and gets slightly more attention
than everything else: the checkbox fills over 150ms, the checkmark draws over 150ms,
the title's strikethrough sweeps left-to-right over 200ms, and the row fades to 60%
opacity. Total under 400ms.

**Why spend motion budget here:** This is the only interaction the user performs dozens
of times a day and the only one that should feel satisfying. Everywhere else, motion is
purely explanatory.

---

## 4.8 Layout grid and breakpoints

| Breakpoint | Range | Layout |
|---|---|---|
| `xs` | < 480px | 1 column, bottom nav + FAB, 16px gutter |
| `sm` | 480–767px | 1 column, wider cards, 16px gutter |
| `md` | 768–1023px | Icon rail + content, 2-column cards, 24px gutter |
| `lg` | 1024–1279px | Sidebar (240px) + content, 32px gutter |
| `xl` | ≥ 1280px | Sidebar + content + optional 400px detail panel |

- **Content max-width:** 1120px, centered inside the content region.
  *Why capped:* An unbounded task list on a 27" monitor produces rows 2000px wide, where
  the checkbox and the due date are separated by half a metre of empty space.
- **Grid:** 12 columns at `lg`+, 8 at `md`, 4 below. Column gap = `space-4`.

---

## 4.9 Z-index scale

Named, sparse, and never bypassed with arbitrary values.

| Token | Value | Layer |
|---|---|---|
| `z-base` | 0 | Page content |
| `z-sticky` | 10 | Sticky list header, sticky filter bar |
| `z-nav` | 20 | Sidebar, bottom navigation |
| `z-dropdown` | 30 | Dropdown, popover, select menu |
| `z-fab` | 35 | Floating action button |
| `z-panel` | 40 | Side detail panel |
| `z-backdrop` | 50 | Modal / sheet scrim |
| `z-modal` | 60 | Modal, bottom sheet |
| `z-toast` | 70 | Toasts, undo snackbar |
| `z-tooltip` | 80 | Tooltips |

**Why the toast sits above the modal:** an undo toast fired from inside a modal must
remain visible, otherwise the undo is unreachable.

---

## 4.10 Component states

Every interactive component implements this matrix. A component that cannot express a
state must document why.

| State | Visual treatment | Notes |
|---|---|---|
| **Default** | Resting tokens | |
| **Hover** | Background steps one surface level darker (light) / lighter (dark); no size change | Pointer devices only — must be behind `@media (hover: hover)` so it doesn't stick on touch |
| **Focus (keyboard)** | 2px `--border-focus` ring, 2px offset, `radius` matching the element | **Never removed.** Verified 6.29:1 light / 7.34:1 dark |
| **Focus (mouse)** | No ring | Use `:focus-visible`, not `:focus` |
| **Active / pressed** | Background one step further; `transform: scale(0.98)` on buttons only | 100ms |
| **Selected** | `--primary-light` background, `--primary` text, 3px left indicator on nav items | Indicator is required — color alone is insufficient |
| **Disabled** | `--text-disabled` text, `--surface-secondary` fill, no border change, `cursor: not-allowed` | Exempt from contrast minimums per WCAG 1.4.3, but must also carry `aria-disabled` so the state is not conveyed by contrast alone |
| **Loading** | Content replaced by a skeleton, or a spinner replaces the button label at the same width | Width must not change, or the layout jumps |
| **Error** | `--error-strong` border and helper text, `alert-circle` icon | Message is always text, never a red border alone |
| **Read-only** | `--surface-secondary` fill, `--text-primary` text, no border | Distinct from disabled: the value still matters |
| **Empty** | See Module 07 | |

### Focus ring specification

```
outline: 2px solid var(--border-focus);
outline-offset: 2px;
```

- Offset of 2px so the ring never sits on top of the component's own border.
- On elements flush against a container edge, offset drops to 1px and the ring moves
  inside.
- The ring color is the **same in both themes' semantic slot** but a different value
  (`#4f46e5` light, `#a5b4fc` dark), because a single value cannot clear 3:1 against
  both a white and a near-black surface.

### Touch targets

| Context | Minimum |
|---|---|
| Touch (mobile, tablet) | 44 × 44px |
| Pointer (desktop) | 32 × 32px, 40 × 40px preferred |
| Task list checkbox | Visually 20px, hit target 44px on touch / 36px on pointer |

**Why the checkbox target is oversized:** Completing a task is the highest-frequency
interaction in the product. A missed tap that instead *opens* the task costs a
navigation and a back press — roughly 20× the cost of the intended action.

---

## 4.11 Accessibility baseline

Non-negotiable, verified per component in Module 03:

1. **Contrast:** 4.5:1 for text below 18px, 3:1 for text ≥18px bold or ≥24px, 3:1 for
   interactive boundaries and meaningful graphics.
2. **Color is never the sole carrier of meaning** (§4.5.3).
3. **Every interactive element is reachable and operable by keyboard**, in a logical
   DOM order, with a visible `:focus-visible` ring.
4. **Focus is trapped inside modals and sheets**, and returns to the trigger on close.
5. **Live regions:** task completion, delete + undo, and save confirmations announce via
   `aria-live="polite"`. Errors use `aria-live="assertive"`.
6. **All icon-only controls have accessible names.**
7. **Motion respects `prefers-reduced-motion`.**
8. **Zoom to 200% without horizontal scrolling** — a consequence of the fluid layout,
   which is why the design uses no fixed pixel widths for content regions.
9. **Form fields have persistent visible labels**, not placeholder-as-label.
   *Why:* Placeholder labels vanish the moment the user types, which is exactly when
   they are needed for review and correction.

---

## 4.12 Token delta — required changes to `client/app/globals.css`

Implementation-ready summary of everything §4.5 changes. No code is written yet; this
is the spec for Module 10.

**Light mode**

| Token | From | To |
|---|---|---|
| `--text-secondary` | `#64748b` | `#475569` |
| `--text-muted` | `#94a3b8` | `#64748b` |
| `--border-focus` | `#818cf8` | `#4f46e5` |
| `--text-disabled` | — | `#94a3b8` (new) |
| `--surface-raised` | — | `#ffffff` (new) |
| `--on-primary` | — | `#ffffff` (new) |
| `--border-strong` | — | `#64748b` (new) |
| `--success-strong` | — | `#15803d` (new) |
| `--warning-strong` | — | `#b45309` (new) |
| `--error-strong` | — | `#b91c1c` (new) |
| `--info-strong` | — | `#1d4ed8` (new) |

**Dark mode**

| Token | From | To |
|---|---|---|
| `--border-focus` | `#818cf8` | `#a5b4fc` |
| `--on-primary` | — | `#0f172a` (new — **not white**) |
| `--primary-strong` | — | `#a5b4fc` (new) |
| `--text-disabled` | — | `#64748b` (new) |
| `--surface-raised` | — | `#243449` (new) |
| `--surface-overlay` | — | `#293b52` (new) |
| `--border-strong` | — | `#64748b` (new) |
| `--success-strong` | — | `#4ade80` (new) |
| `--warning-strong` | — | `#fbbf24` (new) |
| `--error-strong` | — | `#fca5a5` (new) |
| `--info-strong` | — | `#93c5fd` (new) |

**Also required**

- Add the 8-color category palette as `--category-{name}` / `--category-{name}-tint`.
- Add `--shadow-raised`, `--shadow-overlay`, `--shadow-modal` alongside the existing
  `--shadow-card` / `--shadow-card-lg`.
- Add spacing, radius, and motion tokens to the `@theme inline` block so they are
  reachable as utilities rather than being written as arbitrary values.
- **The dark block is duplicated** in `globals.css` (once under
  `prefers-color-scheme`, once under `.dark`). Extract the values into a single
  reusable declaration so the two copies cannot drift apart.

### React Native portability note

Every token here is a raw value with no CSS-specific syntax except the shadow strings
and the focus `outline`. For a React Native target:

- Shadows map to `elevation` (Android) and `shadowColor/Offset/Opacity/Radius` (iOS);
  the level table in §4.4 is the mapping source.
- Focus rings map to a `borderWidth`/`borderColor` treatment on the focused element,
  since RN has no `outline`.
- Everything else — colors, spacing, radii, sizes, durations — transfers unchanged as a
  plain JS token object. This is why no value in this document is expressed in `rem`.

---

## Decisions locked by this module

1. 14px base, one family, three weights, 4px spacing grid.
2. Six radii; nested radii must decrease inward.
3. Five elevation levels; **dark mode uses surface lightening + border, not shadow.**
4. `-strong` text tier added per status color; vivid 500-weights stay as fills only.
5. `--on-primary` is `#ffffff` in light and `#0f172a` in dark.
6. Fixed 8-color category palette, verified in both themes.
7. Color never carries meaning alone.
8. `:focus-visible` ring is 2px at 2px offset and is never removed.

## Carried into Module 03

- Whether the "Done" status badge uses green tint + green text, or a neutral slate badge
  with a check icon. *(Leaning: neutral slate — completed tasks should recede, and
  spending the green on a de-emphasized row wastes the loudest signal in the palette.)*
- Whether the priority indicator is a badge with a label, or a 3px left bar on the row
  plus a label in the metadata line. *(Leaning: bar + metadata label — it survives the
  narrow mobile row where a third badge does not fit.)*
