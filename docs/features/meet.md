# Meet

Status: 💡 idea (not yet implemented)

## Overview

Ad hoc voice/video session within a Nest. One of the two product pillars
— see [../product/scope.md](../product/scope.md). Not calendar/scheduling
first — casual, drop-in.

## Core

- Join/leave a live voice (and optionally video) session tied to a Nest
- Participant tiles, self-mute, presence (who's currently in)

## Sub-features

| Sub-feature | Status | Notes |
|---|---|---|
| Doghouse | 📐 spec'd | Forced server-side mute of another participant, visible to all, for a fixed duration. See spec below. |
| Soundboard | 💡 idea | Short audio stings any participant can trigger for the whole room. |

## Doghouse spec

Any participant can send another participant "to the Doghouse":

- Target's outbound audio is forcibly muted **server-side** for a fixed
  duration (default 60s, configurable per-Nest).
- Target's tile visually changes (grayscale, doghouse icon, countdown
  ring) — visible to everyone including the target, never hidden.
- Room is notified: "we're talking about {name}" style broadcast.
- Auto-unmute when the timer expires.

**Guardrails (ship together with the feature, not after):**

- Per-target cooldown after being released, to prevent pile-ons.
- Max concurrent Doghouse count per Nest.
- Per-user opt-out (`doghouse: off`) — silently respected.
- Moderator/Nest owner can force-release anyone early.

See [../decisions/0002-realtime-media-livekit.md](../decisions/0002-realtime-media-livekit.md)
for why this requires LiveKit's server-side track control rather than a
client-only mute.
