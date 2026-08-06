# Scope

## What this is

A lightweight communication platform for people who already know each
other — a friend group, or the "fun side-channel" running alongside a
workplace's official comms (an alternative to using Teams/Slack for the
non-work chatter). General-purpose: not built as a private tool for one
specific group, but not an enterprise product either.

## Structural model

The only structural unit is the **Nest** (see [glossary.md](glossary.md)).
There is no tenant/organization/company layer above it. A Nest is
simultaneously "a friend group" or "a small team's side room" — the
platform doesn't need to know or care which. A user can belong to
multiple Nests.

Each Nest is a single flat space containing two views:
- **Chat** — persistent text conversation
- **Meet** — ad hoc voice/video session

There is no channel tree, no per-Nest sub-categories, no roles/permissions
system beyond a single owner/moderator per Nest. See
[decisions/0001-navigation-model.md](../decisions/0001-navigation-model.md).

## Platform

Web-first, responsive. Native mobile is explicitly out of scope for now —
not designed against for the future, just not a v1 concern.

## Hosting & licensing

Open-source, published on GitHub, self-hosted (initially by the author,
architecture should not prevent others from self-hosting their own
instance). Not built as a SaaS the author operates for third parties, at
least not initially.

## Scale target

Single self-hosted deployment. "Good practice" engineering (indexed
queries, connection pooling, no hardcoded single-instance assumptions that
would be actively wrong later) — but explicitly **not** engineering for
horizontal scale, multi-region, or high concurrency at this stage. See
[../engineering/architecture.md](../engineering/architecture.md) for where
this affects specific technical choices.

## Product shape: two pillars only

The platform is scoped to exactly two top-level pillars:

- **Chat**
- **Meet**

Everything else (Doghouse, scoreboards, soundboard, AI-assisted message
tooling, confession booth, etc.) is a **sub-feature of one of these two
pillars** — never a third top-level pillar. See
[../features/chat.md](../features/chat.md) and
[../features/meet.md](../features/meet.md).

## Non-goals

- No tenant/organization hierarchy above the Nest.
- No native mobile app in the current scope.
- No engineering effort toward multi-region/high-scale infrastructure.
- No monetization or engagement-loop mechanics (streaks, guilt-based
  notifications) — see [principles.md](principles.md).
- No third top-level pillar beyond Chat and Meet without revisiting this
  document first.
