# backend/AGENTS.md

Conventions specific to the Spring Boot app. Root [../AGENTS.md](../AGENTS.md)
covers project-wide rules (product constraints, docs discipline, commit
style) — read that too if you haven't.

## Status

Scaffolded (Spring Boot 4.1.0, Java 21, Maven). Auth (JWT email+password)
and the Nest/membership domain (create, list, add/remove members, invite
codes, direct-message/group unification) exist and are real. See
[../docs/architecture.md](../docs/architecture.md).

## REST conventions

- **Version every path**: `/api/v1/...`, never a bare `/api/...`. The
  prefix lives in exactly one place —
  `io.snakenest.nest.common.ApiPaths.V1` — controllers reference the
  constant, they don't hardcode the string. Bumping to `/api/v2` later
  means changing one file, not grepping every controller.
- **Don't use `server.servlet.context-path`** for this — it would also
  prefix `/actuator/**`, which ops tooling expects at a stable,
  unversioned path.
- **Lombok** is used to cut boilerplate (`@Getter`, `@RequiredArgsConstructor`,
  `@Slf4j`) — but only for pure boilerplate. A constructor that does real
  work (e.g. `JwtService` decoding a secret) stays hand-written, not
  forced through `@RequiredArgsConstructor`.
- **Auth**: JWT via a custom `OncePerRequestFilter`
  (`JwtAuthFilter`), not Spring Security's `UserDetailsService`/form-login
  flow — this app has no username/password *session* concept, just a
  bearer token validated per-request. Don't let Boot's default in-memory
  user auto-configuration linger unnoticed; if you see "Using generated
  security password" in the logs, something's misconfigured.

## Layering

- **REST** — durable CRUD only: users, Nests, message history, scores.
  See [../docs/architecture.md](../docs/architecture.md).
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
  see [../docs/architecture.md](../docs/architecture.md)) are enforced
  **in this service**, not left to the frontend to respect voluntarily.
  A client that ignores the cooldown must still be rejected server-side.

## Data

- **PostgreSQL** — durable: users, Nests, chat history, scores.
- **Redis** — ephemeral/live: presence, Doghouse timers, pub/sub for
  fanning out events across backend instances (relevant the moment
  there's more than one instance — not premature if the pub/sub layer
  is already in place for presence).
- **Schema changes go through Liquibase changesets**
  (`src/main/resources/db/changelog/`), never `ddl-auto`. `ddl-auto` is
  set to `validate` — Hibernate checks entities match the schema but
  never mutates it. Reason: `ddl-auto: update` silently failed to add a
  `NOT NULL UNIQUE` column to an already-populated table during early
  development — no error, just a column that never existed, discovered
  only when a later query broke. Liquibase makes schema changes explicit,
  ordered, and reproducible instead.
  - One file per changeset under `db/changelog/`, numbered
    (`00N-description.yaml`), included from `db.changelog-master.yaml` in
    order. **Never edit an already-applied changeset** — add a new one
    instead.
  - After adding/changing an entity, add the matching changeset in the
    same commit — don't let entities and schema drift apart.

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
