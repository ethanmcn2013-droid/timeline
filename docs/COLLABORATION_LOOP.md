# Signal Roadmap Collaboration Loop

Signal Roadmap owns the direction and shareable-output layer of the Signal Studio collaboration loop.

Core question:

Where is this going, what changed, and what is next?

## Role In The Ecosystem

Roadmap turns execution into a plan people can understand without decoding internal work.

It should help invited collaborators and outside viewers understand:

- current direction
- next milestones
- what changed
- why it changed
- how confident the plan is

## Growth Loop Responsibility

Roadmap is the first natural acquisition surface because plans are meant to be shared.

It supports this loop:

Workspace created -> collaborators invited -> work becomes clearer -> shareable output created -> new creator discovered.

Roadmap is responsible for the "shareable output created" moment.

## Shared Objects Roadmap Should Respect

| Object | Roadmap meaning |
| --- | --- |
| Workspace | The place where a roadmap belongs. |
| Person | Creator, collaborator, guest, client, supplier, or viewer. |
| Milestone | A visible point in the direction of the work. |
| Decision | The reason a plan changed. |
| Risk | A confidence or timing issue that needs attention. |
| Update | A roadmap change that can feed changelog, activity, and briefing. |
| Shareable output | Public roadmap, change note, shared update, or planning page. |

## Cycle 1 Product Work

Prioritise:

- public/private share controls
- "what changed and why" history
- confidence language
- shared update summary
- source tracking for shared links
- events for roadmap item created, milestone moved, confidence changed, public page shared, and change note published

Avoid:

- fake precision
- internal-only plans
- jargon-heavy roadmap statuses
- public pages that hide the practical next step

## Acceptance Test

For the wedding/events wedge, a couple or venue coordinator should open a shared roadmap and understand:

- what phase the planning is in
- what is next
- what changed
- which decisions explain the change
- whether the plan is on track

## Cycle 2: Invite And First View

Roadmap owns the "Where this is going" and "What changed" parts of the invited collaborator's first view.

Role defaults for Roadmap:

- Creator controls roadmap visibility and sharing.
- Collaborator can see the shared roadmap and relevant changes.
- Guest can open an owner-controlled planning roadmap.
- Client / supplier can see phases and milestones relevant to them.
- Viewer can read a public or owner-controlled roadmap and discover Signal Studio.

Cycle 2 implementation targets:

- owner-controlled roadmap sharing
- change note for "what moved and why"
- confidence language for shared views
- source tracking on roadmap share links
- tasteful "Created with Signal Studio" placement

Acceptance test:

A couple opens a shared wedding roadmap and understands the current phase, next milestone, recent change, and whether the plan is on track.

## Cycle 3: First Shared Update

Roadmap now owns the first built shareable artefact: `/[workspace]/update`.

The shared update is a read-only, plain-language page derived from existing roadmap data. It shows:

- current state
- what is happening now
- what is held up
- what comes next
- what changed
- project progress
- a tasteful "Created with Signal Studio" discovery link

Source tracking is carried through query parameters:

`source`, `segment`, `role`, `campaign`, and `artefact`.

Cycle 3 intentionally avoids a new table or publishing workflow. The first goal is to prove the output format and make the sharing surface real. Owner-controlled visibility, revocation, and richer history can come after the artefact is useful.

Acceptance test:

A viewer opens `/tasks/update?source=roadmap_share&segment=general&role=viewer&campaign=collaboration_proof&artefact=shared_update` and understands the state of the roadmap without needing to open the full plan.

## Cycle 4: Wedding Planning Proof Path

Roadmap now carries the first wedge-specific shared update proof path:

`/wedding-planning/update?source=roadmap_share&segment=weddings&role=viewer&campaign=founding_venue&artefact=shared_update`

This demo update is bundled as proof data so the preview link works before a live wedding workspace exists.

It should help a venue, planner, couple, or supplier understand:

- current planning state
- what the venue or couple is doing now
- which supplier follow-up is held up
- what comes next
- what was recently decided

Acceptance test:

A wedding venue coordinator can open the shared update and see a plausible planning artefact they could forward to a couple or supplier.
