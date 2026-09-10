# Momentum — Task Tracker Design System

Design documentation for the Task Tracker application. Written to be implemented
as reusable components following Atomic Design, framework-neutral (values are raw
CSS/JS primitives so they map cleanly to both the current Next.js client and a
future React Native client).

## Modules

| # | Module | Covers | Status |
|---|--------|--------|--------|
| 01 | [Concept, Information Architecture & Navigation](01-concept-ia-navigation.md) | Output sections 1–3 | Done |
| 02 | Design System (foundations) | Output section 4 | Pending |
| 03 | Component System | Output section 6 | Pending |
| 04 | Screens — Dashboard, Task List | Output section 5 | Pending |
| 05 | Screens — Create/Edit, Task Details | Output section 5 | Pending |
| 06 | Screens — Categories, Calendar | Output section 5 | Pending |
| 07 | Empty, Loading & Error States | Output section 5 | Pending |
| 08 | Responsive Behavior | Output section 7 | Pending |
| 09 | Light & Dark Mode Guidelines | Output sections 8–9 | Pending |
| 10 | UX Recommendations & Implementation Notes | Output section 10 | Pending |

## Conventions used in these docs

- **Tokens** are referenced by their CSS custom property name (`--primary`,
  `--surface`) as already defined in `client/app/globals.css`.
- **Spacing** is expressed in the 4px scale (`space-4` = 16px), never in raw pixels
  inside screen descriptions.
- Every non-obvious decision carries a short **Why:** line.
