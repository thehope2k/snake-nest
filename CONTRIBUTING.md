# Contributing

Thanks for your interest in The Nest.

## Getting set up

Backend runs in Docker alongside Postgres and Redis; the frontend runs
on its own.

```bash
git clone https://github.com/<owner>/snake-nest.git
cd snake-nest
cd infra && docker compose up -d --build   # Postgres + Redis + backend
cd ../frontend && npm install && npm run dev
```

## Project structure

```
snake-nest/
├── docs/
│   ├── architecture.md   what the system does and how it works
│   ├── product/          scope, principles, glossary, UX philosophy
│   └── engineering/       conventions
├── frontend/             React app
├── backend/              Spring Boot app
└── infra/                docker-compose (Postgres, Redis, backend container)
```

See [docs/architecture.md](docs/architecture.md) for how it's all put
together.

## Code conventions

- Root [AGENTS.md](AGENTS.md) — project-wide rules (product constraints, docs discipline, commit style).
- [frontend/AGENTS.md](frontend/AGENTS.md) — UI primitives, design tokens, component size, state/data conventions.
- [backend/AGENTS.md](backend/AGENTS.md) — REST/WebSocket layering, Doghouse state machine, logging.

A few things that apply everywhere:

- Any "act on another user" mechanic (Doghouse being the obvious one) needs visibility, an opt-out, a moderator
  override, and anti-pile-on limits shipped together — see [AGENTS.md](AGENTS.md).
- Comments shouldn't restate the code — write one only when the *why* isn't obvious.
- Split component files once they pass ~250 lines into a parent + subdirectory.
- If a change alters what the system does, update [docs/architecture.md](docs/architecture.md) as part of the same
  PR, in plain language — not a follow-up, not a status checkbox.

## Pull requests

1. Fork → branch off `main`.
2. Keep PRs small and focused — one concern per PR.
3. If a change touches product scope, update the relevant doc in `docs/product/` as part of the same PR.
4. Open a PR with a clear description of *what* and *why*.

## Reporting bugs / proposing features

Open an issue on GitHub.
