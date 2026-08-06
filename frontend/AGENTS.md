# frontend/AGENTS.md

Conventions specific to the React app. Root [../AGENTS.md](../AGENTS.md)
covers project-wide rules (product constraints, docs discipline, commit
style) — read that too if you haven't.

## Status

Not yet scaffolded. This file documents conventions to scaffold *with*,
not retrofit later — see [../docs/roadmap.md](../docs/roadmap.md) Phase 0/1.

## Stack

Tailwind CSS + a small `components/ui/` primitive library; `shadcn/ui` for
hard primitives (Dialog with focus trap, Combobox) instead of
hand-rolling. Full rationale:
[../docs/decisions/0003-frontend-stack-conventions.md](../docs/decisions/0003-frontend-stack-conventions.md).

## Design tokens

Defined once in a global stylesheet, exposed to Tailwind as utilities.
Full rationale for tone/personality: [../docs/product/ux-philosophy.md](../docs/product/ux-philosophy.md).

- Exactly **three base values**: `--background`, `--foreground`,
  `--accent`. Everything else (`--elevated`, `--elevated-2`,
  `--fg-muted`, `--fg-subtle`, `--border`, `--border-strong`, hover/
  active states) is *derived* via OKLCH + `color-mix`.
- **Single theme (dark) for now** — no `prefers-color-scheme`/light
  branching. See ux-philosophy.md for why; revisit there first if this
  changes, don't just add a light branch ad hoc.
- Sub-feature accent tokens (e.g. a "doghouse red", "roast orange") are
  derived the same way, not new arbitrary hex values.
- **No new base color literals** without revisiting ADR 0003.

## Component library rule

1. Before writing inline styles for a button/input/badge/dialog, check
   `components/ui/`. If a primitive exists, use it.
2. Extract a new primitive on the **second** identical inline pattern —
   not the first (premature abstraction), not the third (copy-paste
   drift already happened).
3. Match existing token usage (`bg-panel`, `text-fg`, `text-fg-muted`,
   `border-border`, etc.) — never introduce a raw hex/rgb value inline.
4. Barrel-export new primitives from `components/ui/index.ts` so features
   import from one place: `import { Button, Field } from '@/components/ui'`.
5. Don't recreate a hard primitive (Dialog w/ focus trap, Combobox) from
   scratch — pull it from `shadcn/ui` and note the addition here.

**Starter primitive set** (build these before feature screens, since the
working style is UI-first): `Button`, `Input`, `Field`, `Badge`, `Toggle`.

## Component file size

Split a file once it passes ~250 lines or does more than one job:

```
ParentComponent.tsx     # orchestrator, ~50 lines
parent-flow/            # subdirectory for the pieces
  ├── types.ts
  ├── shared.tsx        # local helpers used by 2+ siblings
  ├── ChildA.tsx
  └── ChildB.tsx
```

## State & data

- Chat messages and Nest/session data arrive over WebSocket (STOMP/
  SockJS) — see [../docs/engineering/architecture.md](../docs/engineering/architecture.md).
  Keep the WebSocket subscription logic in a small number of hooks
  (e.g. `useNestChat`, `useMeetPresence`), not scattered inline across
  components.
- Meet/voice state (participant tiles, mute state, Doghouse countdown)
  comes from LiveKit's client SDK
  (`livekit-client` / `@livekit/components-react`) as the source of
  truth — don't duplicate it into separate local state that can drift.
- The Doghouse countdown must be **rendered from server-pushed state**
  (see architecture doc's state machine section), never a client-only
  `setTimeout` — that was fine for the throwaway `mockup/`, not for the
  real app.

## Comments

Don't write comments that restate the code — names should carry that.
Write a one-liner only when the *why* is non-obvious (a workaround, a
browser quirk, a deliberate simplification).
