# 0006: Global user visibility (supersedes 0004)

Status: Accepted

## Context

[0004](0004-user-visibility.md) restricted "who can add whom" to people
who already share a Nest, specifically to avoid unrelated groups on the
same self-hosted instance discovering each other with no consent step.

That model works, but its bootstrap problem became apparent immediately
once implemented: with zero shared Nests to start, *no one* could ever
become visible to anyone without an invite-link mechanism — which pushed
real complexity (token issuance, expiry, join endpoints) into what was
meant to be a simple first feature slice. The product owner has decided
the simplicity trade-off isn't worth it at this stage.

## Decision

Any registered user on the instance is searchable/addable by name from
any Nest — a global directory, the model 0004 explicitly rejected.

This knowingly reopens the privacy gap 0004 was written to close: on an
instance that ends up hosting two unrelated groups, members of one could
find and add members of the other with no consent step. Accepted as a
known trade-off for now, not an oversight.

## Consequences

- `NestService`'s "add member" no longer requires the actor and target to
  share an existing Nest — any existing user can be searched and added
  directly.
- The invite-code join mechanism (built to unblock 0004's bootstrap
  problem) is **kept**, not removed — it's still a valid, simpler way to
  join a Nest, just no longer the *only* way to make first contact.
- If the cross-group privacy concern becomes real (multiple unrelated
  groups actually sharing one instance), revisit with a new ADR — e.g. a
  per-user visibility opt-out (mirroring the Doghouse opt-out precedent)
  rather than reverting to the shared-Nest model, which reintroduces the
  bootstrap problem.
