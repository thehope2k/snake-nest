# Engineering conventions

## Commits

Conventional-commit-style prefixes: `feat:`, `fix:`, `docs:`, `chore:`,
`refactor:`.

## How docs work here

[`docs/architecture.md`](../architecture.md) should always answer two
questions — what does this do, and how does it do that — for the system
as it actually is *right now*. Not a history of how we got here, not a
log of decisions and why they were made, not a running list of what's
done vs. not done.

That doesn't mean everything has to live in one file forever. If a part
of the system gets substantial enough that cramming it into
`architecture.md` would make the whole thing unreadable, split it into
its own doc under `docs/` — that's completely fine. The test isn't "how
many files," it's what kind of content the file holds:

- **Describes what exists right now, in plain terms?** Fine, as its own
  doc if it's substantial enough to deserve one.
- **Records why a choice was made, or tracks status/progress over
  time?** That's the pattern to avoid, whether it's one file or five —
  it's the part that goes stale. `docs/features/chat.md` used to say
  "not implemented" long after auth, Nests, and membership were fully
  working, because nobody remembered to update a status field once the
  code moved past it.

Alongside `architecture.md`, `docs/product/` holds the durable product
thinking — scope, principles, glossary, UX philosophy. Update these when
the product's intent actually changes, not for every small feature.

**Write docs like you're explaining the project to a person, not
generating a spec.** Plain sentences, not a wall of nested bullets.
Someone should be able to read a doc start to finish without feeling
like they're parsing a technical report.

**Docs are not optional follow-up.** If a change alters what the system
does or how it's put together, the relevant doc gets updated in the same
piece of work — not "later," not as a separate pass. A change that isn't
reflected in the docs isn't finished.

## Per-app conventions

Frontend and backend each have their own `AGENTS.md` living next to the
code they describe, so they're picked up automatically when working in
that folder:

- [`frontend/AGENTS.md`](../../frontend/AGENTS.md) — design tokens, the
  `components/ui/` discipline, component size, state/data conventions
- [`backend/AGENTS.md`](../../backend/AGENTS.md) — REST/WebSocket
  layering, the Doghouse state machine, database and Redis usage,
  logging
