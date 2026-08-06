# 0007: Direct/group messaging is just a Nest, unrestricted

Status: Accepted

## Context

Direct messages and group chats aren't covered by any existing doc.
[0001](0001-navigation-model.md) already committed to one structural
unit (the Nest) and a flat model — introducing a separate `Conversation`
entity for DMs would be a second structural concept, which 0001
explicitly avoided.

Product direction: don't artificially restrict anything — a chat should
scale naturally from 1:1 to a group, the way Teams' "New chat" works,
rather than forcing a rigid DM-vs-Nest binary.

## Decision

A DM or group chat **is** a Nest — same entity, same membership model,
same Chat/Meet pillars. What differs is only the *creation flow* and
*identity display*:

- **Starting a conversation**: pick one or more people directly (no
  name/icon required upfront) — `POST /nests/start`. Distinct from the
  deliberate "create a named Nest" flow (`POST /nests`), which still
  requires a name/icon.
- **Identity display**: a Nest with no custom name shows the other
  member(s)' name(s) instead — the single other person's name+avatar for
  a 2-person Nest, a joined list for a group. Naming it later (`PATCH`)
  is always available — a DM can become a named group Nest at any time,
  it's the same object throughout.
- **1:1 idempotency**: starting a conversation with exactly one other
  person who you already have an unnamed 2-person Nest with returns the
  existing one, not a duplicate. Starting a group (2+ others) always
  creates a new Nest, matching how Teams treats group chats as distinct
  even with overlapping membership.
- **No feature restrictions based on size**: Meet/Doghouse remain
  available regardless of member count. Doghouse in a 2-person Nest is
  an edge case (there's no "audience" for the bit), not a bug worth
  guarding against.

## Consequences

- `Nest.name` / `Nest.icon` become nullable — an unnamed Nest is a valid,
  first-class state, not an error case.
- A new global user search (`GET /users/search`) is needed —
  `GET /nests/{id}/users` requires an existing Nest to scope
  membership-exclusion against, which doesn't exist yet when starting a
  brand new conversation.
- A rename endpoint (`PATCH /nests/{id}`) is added so a DM can be
  "upgraded" to a named group later without being recreated.
