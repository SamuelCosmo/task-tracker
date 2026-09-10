# Momentum — Task Tracker Design System

Design documentation for the Task Tracker application. Written to be implemented
as reusable components following Atomic Design, framework-neutral (values are raw
CSS/JS primitives so they map cleanly to both the current Next.js client and a
future React Native client).

## Modules

| # | Module | Covers | Status |
|---|--------|--------|--------|
| 01 | [Concept, Information Architecture & Navigation](01-concept-ia-navigation.md) | Output sections 1–3 | Done |
| 02 | [Design System (foundations)](02-design-system.md) | Output section 4 | Done |
| 03 | [Component System](03-component-system.md) | Output section 6 | Done |
| 04 | [Screens — Dashboard, Task List](04-screens-dashboard-tasklist.md) | Output section 5 | Done |
| 05 | [Screens — Create/Edit, Task Details](05-screens-create-details.md) | Output section 5 | Done |
| 06 | [Screens — Categories, Calendar](06-screens-categories-calendar.md) | Output section 5 | Done |
| 07 | [Empty, Loading & Error States](07-empty-loading-error-states.md) | Output section 5 | Done |
| 08 | Responsive Behavior | Output section 7 | Pending |
| 09 | Light & Dark Mode Guidelines | Output sections 8–9 | Pending |
| 10 | UX Recommendations & Implementation Notes | Output section 10 | Pending |

## Conventions used in these docs

- **Tokens** are referenced by their CSS custom property name (`--primary`,
  `--surface`) as already defined in `client/app/globals.css`.
- **Spacing** is expressed in the 4px scale (`space-4` = 16px), never in raw pixels
  inside screen descriptions.
- Every non-obvious decision carries a short **Why:** line.

## Action required

Module 02 §4.5.1 documents **seven WCAG contrast failures** in the palette currently
committed to `client/app/globals.css`, with verified replacement values in §4.12.
That token delta should land before any component is built against the current tokens.
