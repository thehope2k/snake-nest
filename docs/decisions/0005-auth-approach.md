# 0005: Own JWT auth (email + password)

Status: Accepted

## Context

[architecture.md](../engineering/architecture.md) left auth approach
explicitly open: own JWT issuance vs. an OAuth provider (Google/GitHub).
This needed a real decision before building anything that depends on
user identity (every secured REST endpoint, the WebSocket handshake,
LiveKit token issuance).

## Decision

Backend issues its own JWTs against email + password credentials. No
external OAuth provider is required for the app to function.

## Consequences

- Backend owns password hashing (BCrypt via Spring Security), JWT
  issuance/validation, and token refresh — this is real code to write
  and maintain, not outsourced to a provider.
- A self-hosted instance has **zero external auth dependency** — it
  works fully offline/air-gapped if needed, consistent with the
  self-hosted independence goal in
  [../product/scope.md](../product/scope.md).
- No per-deployment OAuth app registration friction for anyone
  self-hosting their own instance.
- OAuth (Google/GitHub) can be added later as an *additional* sign-in
  option without reversing this decision — it would be additive, not a
  replacement, since some self-hosters may still want it. Not needed
  for v1.
- The frontend's current name-only mock auth
  (`frontend/src/lib/mock-auth.tsx`) will be replaced by a real
  email/password flow once this is implemented — tracked in
  [../roadmap.md](../roadmap.md) Phase 1.
