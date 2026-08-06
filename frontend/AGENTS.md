# frontend/AGENTS.md

Conventions specific to the React app. Root [../AGENTS.md](../AGENTS.md)
covers project-wide rules (product constraints, docs discipline, commit
style) — read that too if you haven't.

## Status

Scaffolded and real. Auth, Nest creation/joining, membership
management, Chat, Meet, and Doghouse all talk to the actual backend —
see [../docs/architecture.md](../docs/architecture.md) for what each
of those actually does server-side.

## Stack

Tailwind CSS + a small `components/ui/` primitive library; Radix
primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`)
for hard-to-get-right things like focus-trapped dialogs, instead of
hand-rolling them.

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
- **No new base color literals** without a strong reason — derive from
  the three base values instead.
- Shadow, motion, and type-scale tokens follow the same rule: no
  arbitrary values picked per component. Shadow (`--shadow-sm/md/lg`)
  is a fixed 3-step scale, opacity derived from `--foreground` so it
  stays correct if the theme ever changes. Motion
  (`--duration-fast/base/slow`, one shared easing curve) is defined
  once and reused, not re-typed as inline `duration-150` etc. per
  component. Type scale (`--text-xs` through `--text-2xl`) gives every
  heading/label a scale step to pick from instead of defaulting to
  `text-sm` everywhere regardless of role.
- Respect `prefers-reduced-motion` at the token layer (transitions
  collapse to ~0), not per-component checks.

## Iconography & identity

Mixing a real icon library with decorative emoji ad hoc is the fastest
way to make the UI look inconsistent — pick one deliberately per case:

- **`lucide-react`** is for functional chrome: buttons, actions, status
  (mic, reply, close, more-options, etc.). Pick icon sizes from a fixed
  scale (`14` / `16` / `20`), never a one-off number per file.
- **Emoji are reserved for personality/identity moments** named in
  [ux-philosophy.md](../docs/product/ux-philosophy.md) — a Nest's
  chosen icon, a user's chosen avatar emoji, the Doghouse voice. They
  are not a substitute for a real icon on a functional control.
- **Avatars are never a bare emoji `<span>`.** Use the `Avatar`
  primitive: it derives a background color deterministically from the
  user's id (so the same person always gets the same color) and falls
  back to initials when there's no emoji. Its prop shape stays open to
  an optional future `imageUrl` — don't design around "emoji forever."

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
   scratch — pull one in from Radix and note the addition here.
6. Icon-only controls use `IconButton`, never a raw `<button>` with
   ad-hoc padding — it guarantees a consistent hit target and a visible
   focus ring.
7. A tab/segmented-control UI (mode switch, view switch) uses `Tabs`,
   not a hand-rolled `flex` of styled buttons — there should be exactly
   one implementation of "a row of mutually exclusive options."
8. Toast/status messaging uses a `tone` prop (`neutral` / `success` /
   `warning` / `doghouse`, matching `BadgeTone`'s shape) rather than a
   bespoke class string per call site.

**Starter primitive set** (build these before feature screens, since the
working style is UI-first): `Button`, `Input`, `Field`, `Badge`, `Toggle`,
`Avatar`, `IconButton`, `Tabs`.

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

- Chat messages and Nest/session data will eventually arrive over
  WebSocket (STOMP/SockJS) — see [../docs/architecture.md](../docs/architecture.md).
  Keep that subscription logic in a small number of hooks (e.g.
  `useNestChat`, `useMeetPresence`), not scattered inline across
  components.
- Meet/voice state (participant tiles, mute state, Doghouse countdown)
  will come from LiveKit's client SDK
  (`livekit-client` / `@livekit/components-react`) as the source of
  truth — don't duplicate it into separate local state that can drift.
- The Doghouse countdown is **rendered from server-pushed state**
  (`benchedUntil`/`cooldownUntil` from the backend, updated live over
  the Meet WebSocket topic) — never a client-only `setTimeout` deciding
  when someone actually gets unmuted.

## Comments

Don't write comments that restate the code — names should carry that.
Write a one-liner only when the *why* is non-obvious (a workaround, a
browser quirk, a deliberate simplification).
