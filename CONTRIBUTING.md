# Contributing

Thanks for your interest in The Nest.

## Status

This project is **pre-implementation** — currently docs + a static mockup only (see [docs/roadmap.md](docs/roadmap.md)
Phase 0). Development setup below will be filled in as `frontend/` and `backend/` get scaffolded; for now, the most
useful contribution is feedback on
[docs/](docs/).

## Development setup (once scaffolded)

```bash
git clone https://github.com/<owner>/snake-nest.git
cd snake-nest
# frontend / backend setup instructions land here once scaffolded
```

## Scripts (once scaffolded)

| Command | What it does                                               |
|---------|------------------------------------------------------------|
| _TBD_   | Filled in alongside `frontend/` and `backend/` scaffolding |

## Project structure

```
snake-nest/
├── docs/
│   ├── product/       scope, principles, glossary
│   ├── features/      chat.md, meet.md (pillar specs)
│   ├── decisions/      ADRs
│   └── engineering/    architecture, conventions
├── mockup/            static HTML/CSS/JS clickable prototype (reference only)
├── frontend/          React app (not yet scaffolded)
├── backend/           Spring Boot app (not yet scaffolded)
└── infra/             docker-compose, LiveKit config (not yet added)
```

See [docs/engineering/architecture.md](docs/engineering/architecture.md)
for the system design.

## Code conventions

- Root [AGENTS.md](AGENTS.md) — project-wide rules (product constraints, docs discipline, commit style).
- [frontend/AGENTS.md](frontend/AGENTS.md) — UI primitives, design tokens, component size, state/data conventions.
- [backend/AGENTS.md](backend/AGENTS.md) — REST/WebSocket layering, Doghouse state machine, logging.

Key points that cut across all three:

- **Doghouse-style mechanics** — any "act on another user" feature must ship with visibility, opt-out, moderator
  override, and anti-pile-on limits together — see [AGENTS.md](AGENTS.md) non-negotiable constraints.
- **Comments** — don't restate the code; write a one-liner only when the *why* is non-obvious.
- **Component size** — split files that exceed ~250 lines into a parent
    + subdirectory.

## Pull requests

1. Fork → branch off `main`.
2. Keep PRs small and focused — one concern per PR.
3. If a change touches product scope or a prior architecture decision, update the relevant doc in `docs/product/` or
   add/supersede an ADR in
   `docs/decisions/` as part of the same PR, not as a follow-up.
4. Open a PR with a clear description of *what* and *why*.

## Reporting bugs / proposing features

Open an issue on GitHub once the repo is public. Given the pre-implementation state, feature proposals are especially
useful as a comment against the relevant doc in `docs/features/` rather than a fresh issue with no context.
