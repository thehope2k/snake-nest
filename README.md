# 🐍 The Nest (snake-nest)

An open-source, self-hostable communication platform for people who already know each other — friends, or a workplace's
informal side-channel. Two pillars: **Chat** and **Meet**, kept intentionally simple, with a layer of playful
sub-features designed with real guardrails from day one.

## Philosophy

Most chat/meeting tools (Slack, Teams, Zoom) are built for structured,
work-adjacent communities — servers, channels, roles, formal meeting
etiquette. That's the wrong shape for "a group of friends hanging out."

The Nest keeps the structure flat (see [docs/product/scope.md](docs/product/scope.md))
and treats the playful rituals friend groups already do informally — like
muting someone to talk about them — as first-class, consent-guarded
product surfaces instead of an afterthought. Full reasoning in
[docs/product/principles.md](docs/product/principles.md).

## Status

Auth, the Nest/membership domain (create, join, invite codes,
direct-message/group unification), real-time chat (send, reply, react,
delivered live over WebSocket), and Meet (join/leave a Nest's
self-hosted LiveKit call, live presence) all exist and run in Docker.
Doghouse is still client-simulated — see
[docs/architecture.md](docs/architecture.md) for exactly what's built vs.
planned.

## Start here

- [docs/architecture.md](docs/architecture.md) — system design, stack, domain model (start here)
- [docs/product/scope.md](docs/product/scope.md) — what this is, who it's for, what's out of scope
- [docs/product/principles.md](docs/product/principles.md) — durable product principles
- [docs/product/ux-philosophy.md](docs/product/ux-philosophy.md) — visual/interaction philosophy, tone of voice
- [docs/product/glossary.md](docs/product/glossary.md) — terminology (Nest, Chat, Meet, Doghouse...)
- [docs/engineering/conventions.md](docs/engineering/conventions.md) — commit/doc conventions

## Repo layout

```
snake-nest/
├── docs/
│   ├── architecture.md   system design, stack, domain model
│   ├── product/          scope, principles, glossary, UX philosophy
│   └── engineering/       conventions
├── frontend/             React app
├── backend/              Spring Boot app
├── infra/                docker-compose (Postgres, Redis, backend container)
├── AGENTS.md             conventions for AI coding agents working in this repo
└── README.md             you are here
```

## Running it

```bash
cd infra && docker compose up -d --build   # Postgres + Redis + backend
cd ../frontend && npm run dev              # frontend, run manually
```

## Tech stack

React · Spring Boot (REST + WebSocket/STOMP) · LiveKit (self-hosted) · PostgreSQL (via Liquibase) · Redis. Full
rationale in [docs/architecture.md](docs/architecture.md).

## License

MIT — see [LICENSE](LICENSE).
