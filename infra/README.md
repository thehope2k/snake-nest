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

## Production (self-hosted VM)

`docker-compose.prod.yml` is a separate compose file for an actual
deployment — it pulls prebuilt `backend`/`frontend` images from GHCR
instead of building from source, adds Caddy as the single public-facing
edge (HTTP by default, automatic HTTPS the moment a domain is set), and
refuses to start without real secrets (no `nest`/`nest`-style fallback
defaults).

One-time setup on the VM:

```bash
# Docker + Compose plugin installed, then:
git clone https://github.com/thehope2k/snake-nest.git
cd snake-nest/infra
cp .env.example .env
# fill in .env: DB_PASSWORD, JWT_SECRET, LIVEKIT_API_KEY/SECRET, SITE_ORIGIN
# (see .env.example for how to generate each one)
docker compose -f docker-compose.prod.yml up -d
```

After that, [.github/workflows/cd.yml](../.github/workflows/cd.yml)
handles deploys automatically: every push to `main` builds new
backend/frontend images, pushes them to GHCR tagged with the commit SHA,
SSHes into the VM, and runs `docker compose pull && up -d` against this
file. See that workflow for the exact GitHub secrets it needs.

LiveKit still runs in `--dev` mode here with a fixed key/secret pair —
that's the one piece of this file that isn't actually production-ready
yet (see the `livekit` service's comment). Generating a real key/secret
pair and a proper `livekit.yaml` (TURN, TLS) is a deliberate follow-up,
not done by this compose file.
