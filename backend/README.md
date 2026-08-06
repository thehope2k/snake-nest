# backend/

Spring Boot 4.1.0 (Java 21, Maven). Auth and the Nest/membership API are
real and working. WebSocket chat delivery, LiveKit integration, and the
server-owned Doghouse state machine are next. See
[../docs/architecture.md](../docs/architecture.md).

## Running

Normal dev loop — backend runs in Docker alongside Postgres/Redis, only
the frontend runs manually:

```bash
cd ../infra && docker compose up -d --build
```

Rebuild after a code change: `docker compose up -d --build backend`
(from `infra/`).

To run outside Docker instead (e.g. for debugging in an IDE), start just
`postgres`/`redis` from `infra/`, then:

```bash
JAVA_HOME=$(brew --prefix openjdk@21) ./mvnw spring-boot:run
```

(Java 21 is keg-only via Homebrew and shadowed by other installed JDKs on
`PATH` — hence the explicit `JAVA_HOME`.)

## Conventions

[AGENTS.md](AGENTS.md).
