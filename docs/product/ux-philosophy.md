# UX & Design Philosophy

Companion to [principles.md](principles.md) (the "why") and
[../decisions/0003-frontend-stack-conventions.md](../decisions/0003-frontend-stack-conventions.md)
(the "how it's built") — this is the "what it should feel like."

## The one-line brief

**Minimalist chrome, humorous heart.** The interface itself — layout,
spacing, chrome, iconography — stays clean, restrained, and modern.
Personality and humor live in *moments* (copy, micro-interactions,
specific playful features like Doghouse) — not in busy, decorated UI.

This is a deliberate split: a genuinely minimalist interface is what lets
the funny moments land, because they're not competing with visual noise.
If everything is loud, nothing is funny.

## Visual personality

- Clean, modern, restrained — closer to a focused productivity tool
  (generous whitespace, clear hierarchy, limited color use) than a
  maximalist "gamer app" aesthetic, despite the playful feature set.
- Color is used deliberately, not decoratively: the accent color and any
  sub-feature tokens (e.g. "doghouse red") carry meaning — they mark
  something as interactive or notable, not just brand flourish.
- Iconography and copy carry the humor, not gradients/skeuomorphism/
  cluttered decoration.

## Tone of voice

- The product is allowed to "talk" in specific, bounded moments —
  system messages tied to playful features (e.g. a Doghouse toast:
  "🐍 shh... we're talking about {name}") — because that's the feature
  itself, not incidental copy.
- Neutral, unremarkable UI copy elsewhere (buttons, settings, empty
  states, errors) — the app doesn't try to be funny everywhere. Restraint
  in the boring 90% is what makes the playful 10% land.
- Never funny at the expense of clarity — an error message is clear
  first, personality-flavored second (if at all).

## Theme: single (dark), for now

Our token architecture (three base values → everything derived) makes a
second theme *technically* cheap to add, but the real cost is ongoing:
every future screen and sub-feature accent color would need checking in
both themes before shipping. For a solo, self-hosted,
good-practice-not-overengineering project, that recurring tax isn't
worth paying without real demand for it.

- Dark suits the product's personality better anyway — closer to a
  focused tool than a light, airy consumer app.
- Not a wall: the token model doesn't foreclose adding light mode later
  if real demand shows up — it's just not a v1 commitment.
- Respect OS-level forced-colors/high-contrast accessibility preferences
  even in a single-theme app — that's an accessibility baseline, not a
  second theme.

## Motion

- Purposeful and light-touch by default (hover states, toasts,
  transitions) — not part of the humor delivery mechanism by default.
- The **exception** is feature-specific playful motion tied to a specific
  bit — e.g. a Doghouse tile's grayscale/countdown transition, or a
  toast's entrance — where a bit of personality in the motion itself is
  the point. Even then: quick, not gimmicky or repeatedly distracting.

## Density & layout

- Comfortable, breathing-room spacing (minimalist implies restraint, not
  cramming) — closer to a clean productivity app's spacing than a dense
  chat client. *(Flagging this as a default assumption — correct me if
  you pictured tighter, chat-app-dense spacing instead.)*

## Accessibility baseline

- WCAG AA contrast minimum for the dark theme's token values — a real
  constraint on token values, not an afterthought pass at the end.
- Full keyboard navigability for every interactive primitive in
  `components/ui/`.
- Doghouse and other playful mechanics remain screen-reader
  intelligible (the visible-to-target principle in
  [principles.md](principles.md) applies to assistive tech too, not just
  sighted users).
