# 0004: Shared-Nest user visibility

Status: Superseded by [0006-global-user-visibility.md](0006-global-user-visibility.md)

## Context

The "Add people" flow (`MembersDialog`) initially searched every registered
user on the instance globally by name. This is a separate axis from
[0001-navigation-model.md](0001-navigation-model.md) (which rejected a
tenant/org *structure*) — this is about **discovery/privacy**, not
hierarchy.

Self-hosting (per [../product/scope.md](../product/scope.md)) doesn't
guarantee one instance serves only one friend group forever — nothing
stops an instance from eventually hosting two unrelated groups (e.g. a
friend group and a separate workplace side-channel on the same server).
A global directory means those groups could search and add each other by
name, with no consent step — directly against the consent-first principle
in [../product/principles.md](../product/principles.md).

## Decision

Visibility is derived from the Nest membership graph, not a separate
directory or tenant construct:

- Two users become mutually visible/searchable to each other once they
  **share at least one Nest**. Once visible, they can be added to *other*
  Nests without re-establishing contact.
- Users who share **no** Nest with you are not searchable at all —
  first contact requires an **invite link** (out-of-band, sent by an
  existing member) rather than name search. Invite-link generation is
  not yet implemented (see Consequences).
- No new structural concept is introduced — this reuses the Nest
  membership data that already exists, consistent with keeping the model
  flat (0001).

## Consequences

- `MembersDialog`'s search must be scoped to "people who share a Nest
  with the current user," not the full user table.
- Invite-link generation/redemption is real backend work (token issuance,
  expiry, a join endpoint) not yet built — the mock frontend should be
  honest about this gap (e.g. a "invite via link — coming soon" note)
  rather than silently faking it.
- A future per-user visibility opt-out (mirroring the Doghouse opt-out
  precedent) can layer on top of this model without changing it — not
  needed for v1.
