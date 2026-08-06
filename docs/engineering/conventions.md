# Engineering conventions

## Commit style

Conventional-commit-style prefixes: `feat:`, `fix:`, `docs:`, `chore:`,
`refactor:`.

Commits authored with AI agent assistance carry a co-author trailer:

```
Co-Authored-By: Minimalist Agent <noreply@minimalist-agent.local>
```

## Documentation

- `docs/product/` — durable product definition (scope, principles,
  glossary). Update when scope or principles genuinely change, not for
  every feature detail.
- `docs/features/` — one file per pillar (`chat.md`, `meet.md`), each
  listing sub-features with a status (💡 idea / 📐 spec'd / 🚧 in progress
  / ✅ shipped). Sub-feature detail lives inline once spec'd, not before.
- `docs/decisions/` — Architecture Decision Records (ADRs) for
  significant, hard-to-reverse choices. Numbered sequentially, status
  field (`Proposed` / `Accepted` / `Superseded`). Don't retroactively
  edit an accepted ADR's decision — write a new one that supersedes it.
- `docs/engineering/` — architecture and conventions, kept current with
  actual implementation once it exists.

## Per-app conventions

Detailed FE/BE conventions live next to the code they govern, not here —
keeps them granular and auto-discovered by agents working in that folder:

- [../../frontend/AGENTS.md](../../frontend/AGENTS.md) — design tokens,
  `components/ui/` discipline, component size, state/data conventions
- [../../backend/AGENTS.md](../../backend/AGENTS.md) — REST/WebSocket
  layering, the Doghouse state machine, Postgres/Redis usage, logging

The stack choice rationale (why Tailwind + shadcn/ui) is in
[../decisions/0003-frontend-stack-conventions.md](../decisions/0003-frontend-stack-conventions.md) —
that ADR doesn't change often; the AGENTS.md files above are the ones
that evolve as the app grows.

## Code (once scaffolded)

Lint rules/formatters to be defined when `frontend/` and `backend/` are
actually scaffolded — not speculating before there's code to apply them
to. The per-app AGENTS.md conventions above are the exception: they're
cheap to state now and expensive to retrofit once components exist.
