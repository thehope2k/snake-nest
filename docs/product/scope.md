# Scope

## What this is

The Nest is a lightweight communication platform for people who already
know each other — a friend group, or the "fun side-channel" running
alongside a workplace's official comms, the way people use a Slack/Teams
DM for the non-work stuff. It's meant for anyone, not built around one
specific friend group, but it's not trying to be an enterprise product
either.

## How it's structured

There's exactly one kind of container: the **Nest**. No company or
workspace layer sits above it — a Nest can be a friend group or a small
team's side room, and the app doesn't need to tell the difference. People
can belong to as many Nests as they want.

Every Nest is a flat space with two things in it:

- **Chat** — the ongoing text conversation
- **Meet** — a voice/video call you can drop into

There's no channel list inside a Nest, no sub-categories, and nothing
resembling a permissions system beyond "the owner can do a couple of
extra things." Simple on purpose.

## Platform

Web first, and responsive. Native mobile isn't part of the plan right
now — that's not a statement against it forever, just not something
being designed around yet.

## Hosting and license

Open source, self-hosted. The goal is that anyone can run their own copy
on their own server — this isn't being built as a hosted service the
author runs for other people.

## How big this needs to be

Built for a single self-hosted deployment — normal good engineering
practice (indexes, connection pooling, nothing obviously wasteful) but
no effort spent making it scale across regions or handle huge load. See
[../architecture.md](../architecture.md) for where that shows up in
actual technical choices.

## Only two pillars

Everything in the product falls under one of exactly two top-level
things:

- **Chat**
- **Meet**

Anything else — Doghouse, scoreboards, a soundboard, AI-assisted
messages, a confession booth — is a smaller feature living inside one of
those two, never a third top-level thing of its own.

## What's deliberately not here

- No company/workspace layer above a Nest.
- No native mobile app, for now.
- No effort toward multi-region or large-scale infrastructure.
- No growth tricks that make the product worse to use — streaks, guilt
  notifications, that kind of thing (see [principles.md](principles.md)).
- No third top-level pillar without rethinking this document first.
