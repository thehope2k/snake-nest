# Roadmap

Derived from feature status in [features/chat.md](features/chat.md) and
[features/meet.md](features/meet.md) — this file tracks build sequencing,
not feature detail (which lives in those docs).

## Phase 0 — Groundwork
- [x] Scope, principles, glossary defined
- [x] Doghouse and navigation-model decisions recorded as ADRs
- [ ] `frontend/` (React) and `backend/` (Spring Boot) scaffolding
- [ ] `infra/` local dev setup (docker-compose: Postgres, Redis, LiveKit)

## Phase 1 — Chat MVP
- [ ] Auth (approach TBD — see architecture.md open questions)
- [ ] Create/join a Nest
- [ ] Real-time messaging + persistence + reactions

## Phase 2 — Meet MVP
- [ ] LiveKit integration: join/leave a session tied to a Nest
- [ ] Participant tiles, self-mute, presence

## Phase 3 — Doghouse
- [ ] Redis-backed state machine, forced server-side mute
- [ ] Guardrails: cooldown, max concurrent, opt-out, moderator override

## Phase 4 — Remaining sub-features
- [ ] Soundboard, Scoreboard, Confession Booth
- [ ] Roast Assistant (scope to be defined separately, see glossary.md)

## Phase 5 — Polish & safety
- [ ] Reporting/blocking, rate limiting
- [ ] Deployment
