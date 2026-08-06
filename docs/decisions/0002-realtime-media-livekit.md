# 0002: LiveKit for real-time media

Status: Accepted

## Context

The Doghouse feature (see [../features/meet.md](../features/meet.md))
requires **server-side, forced muting** of another participant's outbound
audio track — not self-mute (trivial, client-side), but a
moderator/system action that mutes someone else while they stay
connected. Rolling a custom WebRTC/SFU layer to support this would be
significant, ongoing infrastructure work outside this project's scope
(see [../product/scope.md](../product/scope.md) — no effort toward
heavy infra beyond good practice).

## Decision

Use **LiveKit** (self-hosted, consistent with the project's self-hosted,
open-source stance) as the real-time media layer. Its server SDK exposes
forced track muting as a first-class operation
(`RoomServiceClient.mutePublishedTrack`), which maps directly onto the
Doghouse requirement.

## Consequences

- Backend needs a LiveKit server SDK integration for token issuance and
  moderation actions.
- Frontend uses `livekit-client` / `@livekit/components-react` for
  track/participant primitives, with custom UI layered on top (Doghouse
  visuals, etc.) — see [../engineering/architecture.md](../engineering/architecture.md).
- Self-hosting LiveKit is an additional operational component (alongside
  Postgres/Redis), acceptable given the self-hosted, non-scaled target in
  [../product/scope.md](../product/scope.md).
