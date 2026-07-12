# Signal Timeline · Product

Signal Timeline delivers **direction clarity**.

It gives a person one public place to explain what is happening, what changed,
what is waiting, and what will not be picked up. It is for people who need the
plan without being made to learn project-management vocabulary.

## Promise

Publish a readable plan in minutes. Share one link. Let customers, clients, and
collaborators see the direction without an account.

## Current State

Status: **private preview**.

The repo contains the core Roadmap product surface:

- Public workspace and project pages.
- Shared update page at `/[workspace]/update`.
- Item detail pages.
- Refusals page.
- Auth-backed app shell.
- Workspace and project creation forms.
- Milestone sync and an owner-only curation surface.
- Frozen Audience Timeline previews for a named class, module, or couple,
  gated for new creation by `SIGNAL_AUDIENCE_TIMELINE_ENABLED`.
- Hashed, revocable Audience Timeline links at `/s/[token]`, with a separate
  projector view and no access to the underlying private workspace.
- Public demo route.

Claims about billing, digest emails, calendar subscriptions, custom share
images, or other paid-plan automation must stay marked planned unless the repo
contains the route, dependency, and preview proof.

## Audience

Signal Timeline is for the person who has to explain direction to people outside
the work:

- Service operators sharing a plan with clients.
- Solo professionals keeping commitments visible.
- Small teams that need a public plan without a status meeting.
- Students and public-facing coordinators who need one readable source of
  truth.

## Surface

The default surface is public. A roadmap that cannot be shared without a login
has missed the point.

Audience Timelines are a separate publication boundary, not private Timeline
workspaces and not a new visibility mode for legacy slug links. An owner copies
only selected labels, calendar dates, and completion states into a frozen
projection, previews that exact copy, and then creates a revocable bearer link.
Later source edits are marked for review and never propagate automatically.

### Lane Vocabulary (locked 2026-06-07 — Dalí walkover row 4)

Signal Timeline uses **one ladder**: time-buckets, not project-management
states. The primary lanes are when, not what.

Time-buckets (the primary ladder, one ladder only):

- `Now` — what is moving this week.
- `Soon` — what is coming up, no action required yet.
- `Later` — the last things, written down so no one has to ask.
- `Done` — what has happened.
- `Refused` — what will not be picked up. Dated. No apology.

Status verbs are **secondary chips only** and should be used sparingly,
inside a lane card, to call out the one item that needs presence:

- `Waiting on you` — the only chip that carries colour.
- `Underway` — work in motion (quiet dot).
- `Coming up` — queued (hollow ring).
- `Done` — settled (check glyph).

The legacy vocabulary `Shipped / Doing / Next / Held up / Blocked` is
deprecated as a primary ladder. It may appear inside a workspace owner's
editor as legacy terminology but must not surface in public copy, demo
data, or marketing.

All public roadmap surfaces (hero, demo, /the-wedding, [workspace], marketing
copy) align to the `Now / Soon / Later / Done / Refused` ladder.

## Locked Refusals

- No private workspaces in v1.
- No team tier in v1.
- No comment threading.
- No public directory of Roadmap workspaces.
- No "all-in-one" framing.
- No engineering-team framing.
- No demo-vs-reality gap.
- No user-facing Vercel fallback URLs.

## Copy Rules

Use full product names in marketing and suite surfaces: Signal Timeline, Signal
Tasks, Signal, Signal Notes.

Do not use "stakeholder", "sprint", "velocity", "backlog export", "project
management tool", or "engineering team" as positive product language. If a
forbidden word appears, it should be clearly framed as something Signal Timeline
refuses.

Use `hello@signalstudio.ie` for contact. Never use a personal email address in
public product copy.
