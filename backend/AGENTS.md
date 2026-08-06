# backend/AGENTS.md

Conventions specific to the Spring Boot app. Root [../AGENTS.md](../AGENTS.md)
covers project-wide rules (product constraints, docs discipline, commit
style) — read that too if you haven't.

## Status

Scaffolded (Spring Boot 4.1.0, Java 21, Maven). Auth (JWT email+password),
the Nest/membership domain (create, list, add/remove members, invite
codes, direct-message/group unification), real-time chat (send,
reply, react, delivered live over WebSocket), and Meet (join/leave a
Nest's LiveKit call, live presence, webhook reconciliation) all exist
and are real. See [../docs/architecture.md](../docs/architecture.md).
Doghouse is still frontend-only fake state — not wired up yet.

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

- **REST** — durable CRUD: users, Nests, membership, message history.
  See [../docs/architecture.md](../docs/architecture.md).
- **WebSocket (STOMP, SockJS fallback)** — live delivery only. Chat
  messages/reactions are written via REST first (so history always
  exists even if nobody's connected), then broadcast to
  `/topic/nests/{nestId}/chat` for anyone subscribed; Meet presence
  (participant joined/left) broadcasts the same way to
  `/topic/nests/{nestId}/meet`. Auth on the WebSocket handshake is a JWT
  passed as a `token` query param (browsers can't set custom headers on
  a WebSocket handshake) via `JwtHandshakeInterceptor`; a
  `ChannelInterceptor` (`NestTopicChannelInterceptor`) checks Nest
  membership on every SUBSCRIBE to either topic, not just at connect
  time, so someone removed from a Nest mid-session can't keep listening
  in.
- **LiveKit server SDK** — issues short-lived, room-scoped join tokens
  (room = `nest-{nestId}`, identity = the user's id) and executes
  moderation actions (`mutePublishedTrack`, etc., once Doghouse is
  wired). This is the **only** path for forced mute/moderation actions —
  see the non-negotiable constraint in [../AGENTS.md](../AGENTS.md):
  never rely on client-only mute state.
- **LiveKit webhooks** — the one intentionally unauthenticated (JWT-wise)
  endpoint in the app, `POST /api/v1/webhooks/livekit`. It's exempted by
  exact path in `SecurityConfig`, never by wildcard, and verifies the
  request itself via `WebhookReceiver`'s HMAC-signed JWT + body-hash
  check instead of our own `JwtAuthFilter`. It exists because a Meet
  participant can vanish without ever calling `/meet/leave` (crash,
  closed tab) — LiveKit's `participant_left`/`room_finished` events are
  the only reliable way to reconcile Redis presence in that case.

## Meet presence

- Presence is **ephemeral only** — a Redis hash per Nest
  (`meet:{nestId}:participants`, userId → joined-at epoch millis), no
  Postgres table. This matches Meet being a drop-in call with no
  scheduling or history requirement (see
  [../docs/product/scope.md](../docs/product/scope.md)); don't add a
  call-history table without that being a deliberate, separate product
  decision.
- `MeetService` is the only thing that touches that Redis key or mints
  LiveKit tokens — `MeetController` is a thin pass-through, same shape
  as `ChatController`.

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
