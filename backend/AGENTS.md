# backend/AGENTS.md

Conventions specific to the Spring Boot app. Root [../AGENTS.md](../AGENTS.md)
covers project-wide rules (product constraints, docs discipline, commit
style) — read that too if you haven't.

## Status

Not yet scaffolded. This file documents conventions to scaffold *with*,
not retrofit later — see [../docs/roadmap.md](../docs/roadmap.md) Phase 1+.

## Layering

- **REST** — durable CRUD only: users, Nests, message history, scores.
  See [../docs/engineering/architecture.md](../docs/engineering/architecture.md).
- **WebSocket (STOMP/SockJS)** — live chat delivery and broadcasting
  moderation events (e.g. "X was sent to the Doghouse") to clients in a
  Nest. Don't push durable-data changes over REST *and* WebSocket
  redundantly — pick one per data type and be consistent.
- **LiveKit server SDK** — issues short-lived join tokens and executes
  moderation actions (`mutePublishedTrack`, etc.). This is the **only**
  path for forced mute/moderation actions — see the non-negotiable
  constraint in [../AGENTS.md](../AGENTS.md): never rely on client-only
  mute state.

## The Doghouse state machine

Must be **server-owned**, not tracked only in a client's memory:

- Redis key `doghouse:{nestId}:{userId}` set with a TTL when triggered.
- Expiry (keyspace notification or short poll) triggers the unmute call
  through the LiveKit server SDK + broadcasts the "let back in" event.
- Guardrails (cooldown, max concurrent, opt-out, moderator override —
  see [../docs/features/meet.md](../docs/features/meet.md)) are enforced
  **in this service**, not left to the frontend to respect voluntarily.
  A client that ignores the cooldown must still be rejected server-side.

## Data

- **PostgreSQL** — durable: users, Nests, chat history, scores.
- **Redis** — ephemeral/live: presence, Doghouse timers, pub/sub for
  fanning out events across backend instances (relevant the moment
  there's more than one instance — not premature if the pub/sub layer
  is already in place for presence).

## Logging

Use a scoped, leveled logger — not raw `System.out`/default root logger
config. Match level to severity:

- `error` — broke (uncaught exception, failed external call with no
  fallback)
- `warn` — recovered/degraded (retried external call, fell back to
  default)
- `info` — milestone (Nest created, meeting started/ended, Doghouse
  triggered/released)
- `debug` — progress/diagnostics; must not ship at `info`-or-above
  verbosity in a real deployment

Never log secrets (API keys, LiveKit tokens, DB credentials, session
tokens).

## Comments

Don't write comments that restate the code — names should carry that.
Write a one-liner only when the *why* is non-obvious (a workaround, a
LiveKit/Spring quirk, a deliberate simplification).
