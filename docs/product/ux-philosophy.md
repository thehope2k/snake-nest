# UX & Design Philosophy

What the product should feel like to use, alongside [principles.md](principles.md)
(the why) and [../architecture.md](../architecture.md) (how it's built).

## The short version

Minimalist chrome, humorous heart. The interface itself — layout,
spacing, icons — stays clean and restrained. The personality and jokes
live in specific moments (a Doghouse toast, a bit of copy), not smeared
across every corner of the UI.

That split is on purpose: a genuinely calm interface is what makes the
funny moments land. If everything is loud, nothing stands out as funny.

## What it should look like

Clean and modern — closer to a focused productivity tool than a busy
"gamer app," even with a playful feature like Doghouse in it. Color is
used to mean something (the accent color, a "doghouse red") rather than
just for decoration. The humor comes through in icons and copy, not
gradients or clutter.

## How it should talk

The app is allowed to have a voice in specific moments tied to a feature
— a Doghouse toast saying "shh, we're talking about you" — because
that's the feature itself, not incidental flavor text. Everywhere else —
buttons, settings, errors — the copy stays plain and out of the way.
Staying quiet 90% of the time is what makes the loud 10% land. And
clarity always wins over cleverness — an error message should be
understandable before it's funny.

## Just one theme for now

Dark only, at least for now. Adding a second (light) theme is cheap to
set up but expensive to maintain — every future screen and every new
accent color would need checking against both. That's not worth the
ongoing tax for a small, self-hosted project without anyone actually
asking for it. Dark also just suits the tone better than something
bright and airy would. This isn't a permanent decision, just not
something worth building before there's real demand for it. Even with
one theme, OS-level high-contrast preferences should still be respected
— that's a baseline, not a second theme.

## Motion

Light and purposeful by default — hover states, toasts, transitions —
not a vehicle for humor on its own. The one exception is a specific bit
like the Doghouse tile's grayscale/countdown animation, where a little
personality in the motion is the point. Even then, it should be quick,
not something that gets old after the third time you see it.

## Spacing

Comfortable and roomy rather than packed tight — closer to a clean app
than a dense chat client. (This is a starting assumption, not a fixed
rule — worth revisiting if it ends up feeling too spacious in practice.)

## Accessibility

Text and UI colors need to clear normal contrast standards. Everything
interactive should be usable from a keyboard. And anything like Doghouse
that affects another person needs to be understandable through a screen
reader too, not just visually — the same "make it visible" principle
applies to everyone, not just sighted users.
