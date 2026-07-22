# Signal Timeline · Product

Signal Timeline delivers **direction clarity**.

It gives a person one shared place to explain what is happening, what changed,
what is waiting, and what will not be picked up. It is for people who need the
plan without being made to learn project-management vocabulary.

## Promise

Publish a readable plan in minutes. Share one link. Let customers, clients, and
collaborators see the direction without an account.

## Current State

Status: **unified private preview; Option D production integration pending
deployment evidence**.

The active owner experience now belongs in the unified Signal Studio app:

- Owner plan: `app.signalstudio.ie/app/plan`.
- Audience Timeline management: `/app/plan/audience`.
- Selected owner artefact view: `/app/plan/audience/[publicationId]`.
- Selected shared artefact: an unlisted, revocable `/s/[token]` bearer link.

This Roadmap repo retains the legacy implementation, schema history, migration
authority, compatibility routes, and the design decision record. The selected
Option D interface is being integrated in the Tasks-hosted unified app. Do not
describe that interface, its owner phone preview, its qualified view count, or
the branded-link handoff as deployed until runtime receipts have been added.

The existing publication boundary remains the foundation:

- A named class, module, or couple receives a frozen Audience Timeline
  projection gated for new creation by `SIGNAL_AUDIENCE_TIMELINE_ENABLED`.
- A share stores only the digest of a 256-bit bearer token and can be rotated,
  revoked, expired, or unpublished.
- The shared DTO contains only the selected label, dates, completion states,
  and public identifiers. It does not expose the underlying private workspace.
- Later source changes mark the frozen copy for review and never propagate
  automatically.

Claims about billing, digest emails, calendar subscriptions, custom share
images, or other paid-plan automation must stay marked planned unless the repo
contains the route, dependency, and preview proof.

## Audience

Signal Timeline is for the person who has to explain direction to people outside
the work:

- Service operators sharing a plan with clients.
- Solo professionals keeping commitments visible.
- Small teams that need a shareable plan without a status meeting.
- Students and public-facing coordinators who need one readable source of
  truth.

## Surface

The working Timeline is owner-only. Sharing is an explicit publication act.
The recipient does not need an account, but they do need the exact bearer link.
There is no public directory, indexable listing, guessable slug, or navigation
path that lets someone stumble onto an Audience Timeline.

Audience Timelines are a separate publication boundary, not private Timeline
workspaces and not a new visibility mode for legacy slug links. An owner copies
only selected labels, calendar dates, and completion states into a frozen
projection, previews that exact copy, and then creates a revocable bearer link.
Later source edits are marked for review and never propagate automatically.

### Selected artefact direction (2026-07-22)

Option D, **The Current**, is the selected production direction for Audience
Timelines.

- One horizontal line is the primary composition. Milestones are points on the
  line, not cards in a dashboard.
- The completed part of the line makes overall progress readable at a glance.
- A distinct vertical `Today` dash shows the calendar position even when today
  falls between milestones.
- The first unfinished point reads `Our next milestone`; `Now` and `Current`
  are not used as if the milestone were happening today.
- A time lens may switch between exact milestone completion and days remaining
  to the primary date. Completion is completed milestones divided by all
  non-cancelled milestones; it is never a confidence score.
- The owner sees the same artefact at full size and inside a real phone frame.
  That phone preview never emits view analytics.
- The shared view is an experience page with no Signal Studio operating rail,
  owner controls, view count, or private source data.

### Qualified Timeline views

A Timeline view means the shared artefact remained visible for at least two
seconds. Counting is publication-scoped and deduplicated so link rotation does
not reset the lifetime total. Owner previews, metadata fetches, route prefetch,
known bots, revoked links, and repeated sessions inside the dedupe window do not
count. Do not persist raw IP addresses, user agents, referrers, bearer tokens,
or cross-product identifiers. The owner sees `Timeline views`, never a claim
about unique people.

### Planned milestone memories

Wedding owners should later be able to add one chosen photograph, a short
caption, capture date, and descriptive alt text to a completed milestone. The
shared line remains primary; a published image enriches the selected milestone
detail rather than creating a gallery. Media upload, processing, consent,
moderation, retention, export, and deletion are **planned, not shipped**.

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

Legacy roadmap surfaces (hero, demo, `/the-wedding`, and workspace shares)
retain the `Now / Soon / Later / Done / Refused` ladder. The selected Audience
Timeline artefact maps the same facts onto points on one line and labels the
first unfinished point `Our next milestone`.

## Locked Refusals

- No team tier in v1.
- No comment threading.
- No public directory or indexable listing of Audience Timelines.
- No discoverable or guessable replacement for the bearer-link boundary.
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
