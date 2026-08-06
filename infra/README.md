# infra/

Local dev infrastructure. Start with:

```bash
docker compose up -d
```

Provides:

- **PostgreSQL** (`localhost:5432`, db `nest`, user/pass `nest`/`nest`) —
  durable data (users, Nests, chat history, scores). See
  [../docs/architecture.md](../docs/architecture.md).
- **Redis** (`localhost:6379`) — presence, Doghouse timers, pub/sub.
- **LiveKit** (`localhost:7880` signaling, `7881` TCP + `7882/udp` for
  media) — the self-hosted SFU behind Meet, running in `--dev` mode with
  its fixed `devkey`/`secret` pair. **Local dev only** — a real
  deployment needs its own generated key/secret and a proper LiveKit
  config (TURN, TLS), not `--dev` mode.
- **Backend** (`localhost:8080`) — the Spring Boot app itself, built from
  [../backend/Dockerfile](../backend/Dockerfile), wired to the `postgres`,
  `redis`, and `livekit` services above by container name (not
  `localhost`).

This means the usual dev loop is:

```bash
docker compose up -d          # postgres + redis + backend, all containerized
cd ../frontend && npm run dev # frontend only, run manually
```

Rebuild the backend image after a code change:

```bash
docker compose up -d --build backend
```

These credentials (Postgres, JWT secret, LiveKit key/secret) are **local
development defaults only** — real deployments must override
`DB_PASSWORD`, `JWT_SECRET`, `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`, and
`CORS_ALLOWED_ORIGINS` via environment variables. See
[../AGENTS.md](../AGENTS.md) on not committing secrets.
