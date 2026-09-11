# Module 09 — Light & Dark Mode Guidelines

> Output sections 8 and 9. Module 02 defined *what the tokens are*. This module defines
> *how to apply them*, and what changes between the two themes beyond the values.
>
> **Note:** Module 02 §4.5.6 was added while writing this module. Auditing the elevated
> dark surfaces revealed three further failures; the corrected values are folded into
> §4.5.2 and the delta table, and are used throughout below.

---

## Resolved question from Module 08

**The theme setting offers Light / Dark / System, with System as the default.**

The OS preference is already an explicit statement of the user's intent — usually one
they made once and expect everything to honor. Defaulting to it means the app is correct
on first launch without asking. Light and Dark exist because the OS preference is a
blunt instrument: people read in bed on a bright-themed system, and people use a
dark-themed system with a document app they want light.

`globals.css` is already structured for exactly this — a `prefers-color-scheme` block
that a `.light` / `.dark` class overrides — so the three-way control is the shape the
implementation already takes. The setting persists to local storage and is applied
before first paint to avoid a flash of the wrong theme.

---

## 8. Light Mode Guidelines

### 8.1 The concept

Light mode is a **near-white product on a faintly tinted canvas**. Surfaces are pure
white; the page behind them is `#f8fafc`, a barely-there slate tint. The separation
between them is 1.05:1 — effectively invisible on its own, which is deliberate: cards are
defined by their **border and shadow**, not by a fill contrast.

*Why a tinted canvas at all:* Pure white behind pure white cards makes the cards vanish
and forces heavier borders to compensate. A 4% tint means a 1px border and a barely-there
shadow are enough, which keeps the interface quiet.

### 8.2 Surface hierarchy

| Level | Token | Value | Border | Shadow |
|---|---|---|---|---|
| Canvas | `--background` | `#f8fafc` | — | — |
| Card, panel | `--surface` | `#ffffff` | 1px `--border` | `shadow-card` |
| Card hover | `--surface` | `#ffffff` | 1px `--border-strong` | `shadow-raised` |
| Inset, well, track | `--surface-secondary` | `#f1f5f9` | none | none |
| Popover, dropdown | `--surface` | `#ffffff` | 1px `--border` | `shadow-overlay` |
| Modal, sheet | `--surface` | `#ffffff` | none | `shadow-modal` |

**Elevation in light mode is carried by shadow.** Surfaces do not change color as they
rise — a modal is the same white as a card. Depth comes entirely from the shadow scale.

**`--surface-secondary` is an *inset*, not an elevation.** It marks recessed things:
input fills when disabled, progress tracks, skeleton bars, search bar at rest, segmented
control tracks. Never use it for a raised element.

### 8.3 Text application

| Token | Value | On surface | Use for |
|---|---|---|---|
| `--text-primary` | `#0f172a` | 17.85:1 | Task titles, headings, values, body |
| `--text-secondary` | `#475569` | 7.58:1 | Labels, descriptions, section subtitles |
| `--text-muted` | `#64748b` | 4.76:1 | Metadata, timestamps, counts, placeholders |
| `--text-disabled` | `#94a3b8` | 2.56:1 | Disabled controls only — exempt from 1.4.3 |

**`--text-muted` must not be placed on `--surface-secondary`** (4.34:1 — marginal fail).
Inside an inset region, drop one tier and use `--text-secondary`.

### 8.4 Color application

- **Indigo is the only chrome color.** Buttons, links, checkboxes, active nav, focus
  rings, progress fills. Nothing else in the interface is indigo.
- **Status colors appear only as tinted badges and small marks**, never as large fills.
  A `--error-light` background is fine at badge size; an `--error` fill spanning a card
  is not.
- **Status text always uses the `-strong` tier.** The 500-weight values (`--success`,
  `--warning`) are fills only — as text on white they score 2.28 and 2.15.
- **The overdue callout is the largest tinted region in the product** (44px tall), and
  that is the ceiling. Anything bigger reads as an error page.

### 8.5 Shadow discipline

Light mode's failure mode is **shadow inflation** — every card getting `shadow-overlay`
because it looks "more designed".

- A resting card is **level 1**. It only reaches level 2 on hover.
- Nothing that is not an overlay uses level 3 or 4.
- Shadows are always slate-tinted (`rgba(15,23,42,…)`), never pure black. A black shadow
  on a slate-tinted canvas reads as grey dirt.

---

## 9. Dark Mode Guidelines

### 9.1 The concept

Dark mode is **not an inversion**. Three things change structurally, not just in value:

1. **Elevation moves from shadow to surface lightness.** Higher surfaces are lighter.
2. **Foreground requirements tighten as surfaces rise** (§4.5.6) — the lighter the
   surface, the less contrast every foreground has.
3. **Saturated colors become foreground-hostile.** `--primary` `#818cf8` carries white
   text at 2.98:1; in light mode the same slot carries it at 6.29:1.

Each of these breaks a naive inversion, and each is the source of a specific failure
this module is written to prevent.

### 9.2 Surface hierarchy — the core of dark mode

| Level | Token | Value | Border | Shadow |
|---|---|---|---|---|
| Canvas | `--background` | `#0f172a` | — | — |
| Card, panel | `--surface` | `#1e293b` | 1px `--border` `#334155` | `0 1px 3px rgba(0,0,0,.30)` |
| Card hover, FAB | `--surface-raised` | `#243449` | 1px `#3d4a5f` | `0 4px 6px -1px rgba(0,0,0,.35)` |
| Popover, dropdown | `--surface-overlay` | `#293b52` | 1px `#475569` | `0 10px 15px -3px rgba(0,0,0,.45)` |
| Modal, sheet | `#2a3d55` | | 1px `#475569` | `0 20px 25px -5px rgba(0,0,0,.55)` |
| Inset, well, track | `--surface-secondary` | `#334155` | none | none |

**The rule: as an element rises, it gets lighter *and* keeps its border.** Shadow is
retained only to soften the edge, never as the primary separator.

*Why this is non-negotiable:* A black shadow on a `#0f172a` canvas is invisible. A design
that keeps the light-mode shadow tokens in dark mode produces cards visually welded to
the background — the single most common dark-mode failure, and the reason `--surface`
vs `--background` at 1.22:1 is only acceptable *with* a border.

**Note the collision:** `--surface-secondary` `#334155` is lighter than `--surface`
`#1e293b`, so an inset region reads as *raised* if it carries a border. **Inset regions
in dark mode must have no border and no shadow** — the fill change alone marks them, and
adding a border makes them ambiguous with a raised card.

### 9.3 Text application

| Token | Value | on `--surface` | on `--surface-overlay` |
|---|---|---|---|
| `--text-primary` | `#f8fafc` | 13.98:1 | 10.90:1 |
| `--text-secondary` | `#cbd5e1` | 9.85:1 | 7.68:1 |
| `--text-muted` | `#a3b1c4` | 6.72:1 | 5.24:1 |
| `--text-disabled` | `#64748b` | 2.18:1 | exempt |

**`--text-primary` is `#f8fafc`, not `#ffffff`.** Pure white on a dark surface produces
halation — the text appears to vibrate and bleed, especially at 14px. A 3% off-white
removes it at no measurable cost to legibility.

**Body text is never rendered at 600 weight in dark mode where 500 would do.** Light text
on dark backgrounds optically gains weight; type that looks correct in light mode looks
heavy in dark. The scale does not change, but the product's use of 600 is already limited
to headings, which is what makes this safe.

### 9.4 Color application — the three dark-specific rules

**Rule 1 — `--on-primary` is `#0f172a`, not white.**

This is the most consequential single value in the dark theme. `--primary` `#818cf8` is a
400-weight indigo, chosen so it reads as indigo against a dark canvas — which necessarily
makes it too light to carry white text (2.98:1). Dark navy text on it scores 5.98:1.

Every primary button, every FAB, every checked checkbox in dark mode uses dark text on
the indigo fill. A theme that keeps white here fails on the most-used control in the
product.

**Rule 2 — `--primary` is a fill; `--primary-strong` `#a5b4fc` is the text.**

As text, `--primary` scores 4.90 on `--surface` but drops to 3.82 on `--surface-overlay`
— so a link inside a dropdown fails. `--primary-strong` scores 7.34 → 5.55 across all
four surfaces. Links, active nav labels, and any indigo text use the strong tier;
backgrounds, fills, rings, and bars use `--primary`.

**Rule 3 — status tints invert their relationship to their text.**

In light mode a status badge is a *pale tint* with *dark* text. In dark mode it is a
*deep tint* with *light* text — `--success-light` is `#14532d`, a deep green, carrying
`#4ade80`. The token names stay the same and their roles stay the same; only the
polarity flips, which is why the same component code produces a correct badge in both
themes without a conditional.

| Status | Light: tint / text | Dark: tint / text |
|---|---|---|
| Success | `#dcfce7` / `#15803d` | `#14532d` / `#4ade80` |
| Warning | `#fef3c7` / `#b45309` | `#78350f` / `#fbbf24` |
| Error | `#fee2e2` / `#b91c1c` | `#7f1d1d` / `#fca5a5` |
| Info | `#dbeafe` / `#1d4ed8` | `#1e3a8a` / `#93c5fd` |

All eight pairs verified ≥4.5:1 (Module 02 §4.5.2).

### 9.5 Keeping cards separated — the checklist

The brief's explicit dark-mode requirement. Four things must all hold:

1. Every card, panel, popover, and modal has **both** a border and a shadow. Neither
   alone is sufficient at 1.22:1 surface separation.
2. Elevated surfaces are **lighter**, following §9.2's ladder. A modal is not the same
   color as a card.
3. **Insets have no border** (§9.2), or they become ambiguous with raised cards.
4. Adjacent cards are separated by `space-2` minimum. At 1.22:1, two touching cards read
   as one card with a hairline through it.

### 9.6 Things that must not be inverted

| Element | Behavior |
|---|---|
| **Category colors** | Use their verified dark variants — a lighter, less saturated version of the same hue. Not the same hex, and not an inversion (which would change the hue entirely) |
| **Priority semantics** | Red stays high, green stays low. Inverting "warm = urgent" would be actively dangerous |
| **The completion animation** | Identical in both themes, using `--success` |
| **Focus ring** | Same 2px/2px geometry; only the color changes (`#4f46e5` → `#a5b4fc`) |
| **Shadows** | Not inverted to light glows. Dark mode keeps dark shadows and adds lightness to the surface instead |
| **Scrim** | `rgba(15,23,42,.5)` → `rgba(0,0,0,.65)`. Deeper, because there is less luminance difference between the scrim and the content behind it |
| **Skeletons** | `--surface-secondary` in both themes; the shimmer sweeps toward `--surface`, which means it sweeps *lighter* in light mode and *lighter* in dark mode too — the direction is "toward the card color", not "toward white" |

### 9.7 Dark-mode-specific pitfalls

| Pitfall | Symptom | Prevention |
|---|---|---|
| Pure white text | Halation, text appears to vibrate | `#f8fafc` |
| Pure black canvas | Harsh, and OLED smearing on scroll | `#0f172a` |
| Same shadows as light | Cards weld to the background | Surface lightening + border |
| Reusing the light accent | Indigo `#4f46e5` on `#0f172a` is muddy | `#818cf8` |
| White on the accent | 2.98:1 on the most-used control | `--on-primary: #0f172a` |
| Foregrounds unaudited on raised surfaces | Menu text fails, list text passes | §4.5.6 |
| Bordered inset regions | Wells look raised | Insets get no border |
| Fully saturated status fills | Vibrate against dark | Deep tints, light text |

### 9.8 Theme switching

- **Setting:** Light / Dark / System `SegmentedControl` in Settings, plus a
  `sun`/`moon` `IconButton` in the sidebar footer that cycles the same three values and
  announces the new state.
- **Persistence:** local storage, applied via a blocking inline script before first paint.
  *Why blocking:* a dark-mode user seeing a white flash on every load is worse than a few
  milliseconds of render delay, and it is very visible at night.
- **System changes are honored live** — a `prefers-color-scheme` listener updates the
  theme when the OS switches, but only while the setting is System.
- **The transition is not animated.** A 200ms cross-fade of every color on the page is
  expensive, janky on long lists, and draws attention to a change the user just
  requested and already expects.
  *Implementation note:* this is enforced, not just preferred. Every component
  colour transition is suspended for one frame while the theme class flips, so
  the whole page snaps together instead of each transitioned element fading over
  its own duration.
- **`color-scheme: dark` is set on the root** so native scrollbars, form controls, and
  the browser's own UI match.
- Meta `theme-color` updates to `--background` for each theme, so mobile browser chrome
  matches.

### 9.9 Per-component reference

| Component | Light | Dark |
|---|---|---|
| Button primary | `--primary` fill, white text | `--primary` fill, **`#0f172a`** text |
| Button secondary | White fill, `--border-strong` `#64748b` | `--surface` fill, `--border-strong` `#7c8ca1` |
| Button ghost hover | `--surface-secondary` `#f1f5f9` | `--surface-secondary` `#334155` |
| Input | White fill, `#64748b` border | `--surface` fill, `#7c8ca1` border |
| Input disabled | `#f1f5f9` fill | `#334155` fill |
| Checkbox checked | `--primary` fill, white check | `--primary` fill, `#0f172a` check |
| Task card | White, 1px `#e2e8f0`, `shadow-card` | `#1e293b`, 1px `#334155`, shadow + lightness |
| Task card hover | `shadow-raised`, border `#64748b` | `#243449`, border `#3d4a5f` |
| Dropdown | White, `shadow-overlay` | `#293b52`, 1px `#475569`, shadow |
| Modal | White, `shadow-modal`, scrim .5 | `#2a3d55`, border, scrim .65 |
| Nav item active | `--primary-light` `#eef2ff`, `--primary` text | `--primary-light` `#312e81`, **`--primary-strong`** text |
| Sidebar | `--surface`, 1px right border | `--background`, 1px right border |
| Bottom nav | `--surface`, opaque | `--surface`, opaque |
| Toast | `--text-primary` fill, `--surface` text | Same inversion — light fill, dark text |
| Skeleton | `#f1f5f9`, shimmer to white | `#334155`, shimmer to `#1e293b` |
| Focus ring | `#4f46e5` | `#a5b4fc` |
| Progress track / fill | `#f1f5f9` / `--primary` | `#334155` / `--primary` |

**The sidebar is `--surface` in light and `--background` in dark.** In light mode a white
sidebar against a tinted canvas reads as raised; in dark mode a lighter sidebar would
read as *closer* than the content, which is backwards for a navigation chrome that should
recede. Using the canvas color keeps it behind the cards in both themes — the same
*intent*, expressed with different tokens.

### 9.10 Verification

Both themes must be checked at every step, not once at the end:

- [ ] Every text/background pair ≥4.5:1 (≥3:1 for ≥18px bold / ≥24px)
- [ ] Every control boundary and meaningful graphic ≥3:1
- [ ] Focus ring ≥3:1 against **both** the component and the surface behind it
- [ ] Every card distinguishable from its canvas without relying on shadow alone
- [ ] Every foreground re-audited on `--surface-raised` and `--surface-overlay`
- [ ] No pure `#ffffff` text, no pure `#000000` anything
- [ ] No white text on `--primary` in dark
- [ ] Status badges legible in both, and distinguishable from each other in greyscale
- [ ] No flash of the wrong theme on load
- [ ] Screenshots of all seven screens in both themes, side by side

**The greyscale test is the fastest single check:** desaturate a screenshot. If status,
priority, or selection state becomes unreadable, the design is relying on color alone
and violates Module 02 §4.5.3.

---

## Decisions locked by this module

1. Light / Dark / System, System default, applied before first paint.
2. Light mode: elevation by shadow, surfaces stay white.
3. Dark mode: elevation by surface lightness plus a retained border.
4. Dark insets carry no border, to stay distinguishable from raised cards.
5. `--on-primary` is `#0f172a` in dark — the theme's most consequential value.
6. `--primary` is a fill; `--primary-strong` is indigo text, in dark.
7. Status tints flip polarity between themes; component code stays identical.
8. The sidebar uses `--surface` in light and `--background` in dark — same intent,
   different token.
9. Theme changes are not animated.
10. Greyscale screenshot is the standing check for color-only meaning.
