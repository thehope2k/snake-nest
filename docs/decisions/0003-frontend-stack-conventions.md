# 0003: Frontend styling stack and UI conventions

Status: Accepted

## Context

Working UI-first means the frontend's visual/component conventions need to
exist *before* the first screen is built, not be discovered ad hoc. Rather
than invent this from scratch, this decision adapts proven conventions
from a real, actively-maintained React codebase (the author's own
Minimalist Agent desktop app) rather than guessing.

## Decision

**Stack**: Tailwind CSS + a small in-house `components/ui/` primitive
library, with `shadcn/ui` as the escape hatch for genuinely hard
primitives (Dialog with focus trap, Combobox, etc.) instead of
hand-rolling them.

**Design tokens**: derive, don't enumerate.
- Exactly three base tokens: `--background`, `--foreground`, `--accent`.
- Everything else (`--elevated`, `--elevated-2`, `--fg-muted`,
  `--fg-subtle`, `--border`, `--border-strong`, hover/active states) is
  *derived* from those three via OKLCH + `color-mix`, defined once in a
  global stylesheet and exposed to Tailwind as utilities
  (`bg-panel`, `text-fg-muted`, etc.).
- No new base color literals or arbitrary hex values without revisiting
  this ADR.

**Component library rule**:
1. Before writing inline styles for a button/input/badge/dialog, check
   `components/ui/` first.
2. Extract a new primitive on the **second** identical inline pattern —
   not the first (avoid premature abstraction), not the third (avoid
   letting copy-paste drift).
3. Barrel-export primitives so features import from one place
   (`import { Button, Field } from '@/components/ui'`).

**File size discipline**: a component file that passes ~250 lines or
starts doing more than one job gets split — an orchestrator component
plus a sibling folder for its sub-pieces (`types.ts`, shared local
helpers, child components), not scattered ad hoc splitting.

## Consequences

- A handful of core primitives need to exist before feature screens are
  built (Button, Input, Field, Badge, Toggle at minimum) — small, but
  worth doing first given the UI-first working style.
- Playful/brand personality (Nest's warmer, less corporate tone vs. a
  typical SaaS dashboard) is expressed by *choosing* the three base token
  values (background/foreground/accent) and any brand-specific derived
  tokens (e.g. a "doghouse red" or "roast orange" for sub-feature
  theming), not by scattering one-off colors through components.
- Revisit this ADR if a genuinely different UI need emerges (e.g. heavy
  animation work that outgrows Tailwind, or a design system handoff from
  a designer that doesn't fit the derive-from-three-tokens model).
