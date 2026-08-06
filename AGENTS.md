# AGENTS.md

Conventions for AI coding agents (and humans) working in this repo. Read
this before making non-trivial changes.

## Project in one sentence

An open-source, self-hostable communication platform (Chat + Meet) for
friends/workplace side-channels, with a playful sub-feature layer
(Doghouse, etc.) governed by real consent guardrails.

## Current state

Auth, the Nest/membership domain, and a working frontend exist (see
[docs/architecture.md](docs/architecture.md) for exactly what's real vs.
planned). `frontend/` and `backend/` are real apps now, not placeholders
— but still check before assuming a specific endpoint/component exists.

## Source of truth docs

Read these, in order, before proposing product or architecture changes:

| Doc | Answers |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System design, stack, domain model — what's built vs. planned |
| [docs/product/scope.md](docs/product/scope.md) | What this is, who it's for, what's explicitly out |
| [docs/product/principles.md](docs/product/principles.md) | Durable product philosophy |
| [docs/product/ux-philosophy.md](docs/product/ux-philosophy.md) | Visual/interaction philosophy: minimalist chrome, humor in moments not decoration, single dark theme |
| [docs/product/glossary.md](docs/product/glossary.md) | Terminology (Nest, Chat, Meet, Doghouse...) |

**Rule:** if a request conflicts with scope (e.g. a third top-level
pillar, a tenant/org layer, native mobile) or a stated principle (e.g.
engagement loops, removing Doghouse guardrails), **flag the conflict
explicitly** rather than silently implementing it. A scope/principle
change gets reflected back into `docs/product/`.

**Docs must stay current.** If a change alters what the system does or
how it's built, update [docs/architecture.md](docs/architecture.md) in
the same piece of work, in plain, human sentences — not a status
tracker, not a decision log, not a mirror of the code. A change isn't
done until the docs describe it accurately. See
[docs/engineering/conventions.md](docs/engineering/conventions.md).

## Planned stack

React (`frontend/`) · Spring Boot REST + WebSocket/STOMP (`backend/`) ·
LiveKit self-hosted · PostgreSQL · Redis. Full rationale in
[docs/architecture.md](docs/architecture.md).

**Non-negotiable:** moderation actions (e.g. Doghouse mute) go through
the LiveKit **server-side** SDK only — never client-only mute state.
Reason: a client-only mute is trivially bypassed and isn't visible/
auditable, which breaks the transparency principle in
[principles.md](docs/product/principles.md).

## Folder-specific conventions

This file covers project-wide rules only. Each app has its own more
granular `AGENTS.md`, read automatically when working in that folder:

- [frontend/AGENTS.md](frontend/AGENTS.md) — design tokens, `components/ui/`
  discipline, component size, state/data conventions
- [backend/AGENTS.md](backend/AGENTS.md) — REST/WebSocket layering, the
  Doghouse state machine, Postgres/Redis usage, logging

Don't duplicate their content here — update the relevant folder's file
instead so it stays the single source of truth for that app.

## Non-negotiable product constraints for implementation

From [principles.md](docs/product/principles.md) and
[architecture.md](docs/architecture.md)'s Doghouse domain model — don't
relax for convenience:

- Any "mute/bench another user" mechanic must be **visible to the
  target**, never silent.
- Must have a **moderator/Nest-owner override** to release someone early.
  This is the target's only way out before the timer expires — deliberate,
  since Doghouse has no per-user opt-out (dropped from scope; see
  [principles.md](docs/product/principles.md)).
- Must ship **anti-pile-on limits** (cooldown, max concurrent) together
  with the feature, not added later.
- Anonymous features must remain **traceable to moderators/admins** even
  when anonymous to peers.

## Code conventions (apply regardless of stack, see folder AGENTS.md for specifics)

- **Comments**: don't write comments that restate the code — names
  should carry that. Do write a one-liner when the *why* is
  non-obvious (a workaround, a constraint, a deliberate non-feature).
- **Logging**: use a scoped, leveled logger, not raw `console.*`/
  `System.out`. Match level to severity — `error` = broke, `warn` =
  recovered/degraded, `info` = milestone, `debug` = progress/diagnostics
  (dev-only, never ships to prod).
- **Never log or commit secrets** (tokens, keys, passwords, `.env`
  values) — enforced by `.gitignore` now; keep it that way once real
  config exists.

## Working conventions

- Keep `docs/` current as living documentation — see
  [docs/engineering/conventions.md](docs/engineering/conventions.md) for
  where each doc type lives and how to update it.
- `mockup/` is a disposable UX reference only — port ideas into
  `frontend/` when scaffolded, don't build real logic into it.
- No commits without explicit user confirmation.
- Commit style: see [docs/engineering/conventions.md](docs/engineering/conventions.md).
