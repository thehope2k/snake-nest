# infra/

Local dev infrastructure. Start with:

```bash
docker compose up -d
```

Provides:

- **PostgreSQL** (`localhost:5432`, db `nest`, user/pass `nest`/`nest`) —
  durable data (users, Nests, chat history, scores). See
  [../docs/engineering/architecture.md](../docs/engineering/architecture.md).
- **Redis** (`localhost:6379`) — presence, Doghouse timers, pub/sub.
- **Backend** (`localhost:8080`) — the Spring Boot app itself, built from
  [../backend/Dockerfile](../backend/Dockerfile), wired to the `postgres`
  and `redis` services above by container name (not `localhost`).

This means the usual dev loop is:

```bash
docker compose up -d          # postgres + redis + backend, all containerized
cd ../frontend && npm run dev # frontend only, run manually
```

Rebuild the backend image after a code change:

```bash
docker compose up -d --build backend
```

LiveKit is not yet included — added when Phase 2 (Meet MVP) begins, see
[../docs/roadmap.md](../docs/roadmap.md).

These credentials (Postgres, JWT secret) are **local development
defaults only** — real deployments must override `DB_PASSWORD`,
`JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` via environment variables. See
[../AGENTS.md](../AGENTS.md) on not committing secrets.
