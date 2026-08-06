# 0001: Flat navigation model, no tenant layer

Status: Accepted

## Context

A Server → Channel → Roles → Permissions style hierarchy requires users
to learn a multi-level structure before sending a first message. This
platform's audience (friends, or a workplace's informal side-channel)
doesn't need that structure, and it actively works against the "easy to
jump into" goal.

## Decision

- The only structural unit is the **Nest** — no tenant/organization layer
  above it.
- Each Nest is a single flat space with exactly two views: **Chat** and
  **Meet**. No channel tree, no per-Nest categories.
- Permissions are minimal: a single owner/moderator role per Nest, no
  granular role system.

## Consequences

- Onboarding requires learning one concept (Nest), not four.
- Larger communities that would want sub-topics/channels are explicitly
  not the target audience (see [../product/scope.md](../product/scope.md)
  non-goals) — if that need arises later, it requires revisiting this
  decision, not quietly bolting channels on.
- Data model stays simple: a Nest owns messages and meeting sessions
  directly, no intermediate channel entity.
