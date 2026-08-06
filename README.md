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

📐 **Pre-implementation.** This repo currently contains product/engineering docs and a static clickable prototype
(`mockup/`) for feel/UX only. No frontend or backend app has been scaffolded yet.

## Start here

- [docs/product/scope.md](docs/product/scope.md) — what this is, who it's for, what's out of scope
- [docs/product/principles.md](docs/product/principles.md) — durable product principles
- [docs/product/glossary.md](docs/product/glossary.md) — terminology (Nest, Chat, Meet, Doghouse...)
- [docs/features/chat.md](docs/features/chat.md) / [docs/features/meet.md](docs/features/meet.md) — pillar specs +
  sub-features
- [docs/decisions/](docs/decisions/) — architecture decision records
- [docs/engineering/architecture.md](docs/engineering/architecture.md) — system design, stack
- [docs/engineering/conventions.md](docs/engineering/conventions.md) — commit/doc conventions
- [docs/roadmap.md](docs/roadmap.md) — build sequencing

## Repo layout

```
snake-nest/
├── docs/
│   ├── product/       scope, principles, glossary
│   ├── features/      chat.md, meet.md (pillar specs)
│   ├── decisions/      ADRs
│   ├── engineering/    architecture, conventions
│   └── roadmap.md
├── mockup/            static HTML/CSS/JS clickable prototype (no build step)
├── frontend/          React app (not yet scaffolded)
├── backend/           Spring Boot app (not yet scaffolded)
├── infra/             docker-compose, LiveKit config (not yet added)
├── AGENTS.md          conventions for AI coding agents working in this repo
└── README.md          you are here
```

## Tech stack (planned)

React · Spring Boot (REST + WebSocket/STOMP) · LiveKit (self-hosted) · PostgreSQL · Redis. Rationale in
[docs/engineering/architecture.md](docs/engineering/architecture.md) and
[docs/decisions/](docs/decisions/).

## License

MIT — see [LICENSE](LICENSE).
