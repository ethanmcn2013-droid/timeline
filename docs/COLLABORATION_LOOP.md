# Signal Timeline Collaboration Loop

Signal Timeline owns the direction and shareable-output layer of the Signal Studio collaboration loop.

Core question:

Where is this going, what changed, and what is next?

## Current integration contract (2026-07-22)

The private Timeline working surface lives in the unified Signal Studio app at
`/app/plan`. Sharing creates a separate frozen Audience Timeline. The recipient
does not need an account, but must have the exact revocable bearer link. This is
link-only sharing, not a public directory or discoverable workspace.

Option D, **The Current**, is the selected shareable artefact. It presents one
horizontal line, completed distance, milestone points, a calendar-positioned
`Today` dash, and one `Our next milestone` point. The owner sees the same
artefact at full size and inside a phone frame before sharing. The recipient
sees an experience page without the Signal Studio operating rail.

Production deployment evidence is pending. Until the unified owner route,
bearer-link route, branded-link handoff, and qualified-view path are verified,
this section records the selected contract rather than shipped state.

## Role In The Ecosystem

Timeline turns execution into a plan people can understand without decoding internal work.

It should help invited collaborators and outside viewers understand:

- current direction
- next milestones
- what changed
- why it changed
- how confident the plan is

## Growth Loop Responsibility

Timeline is a natural acquisition surface because plans are meant to be shared.

It supports this loop:

Workspace created -> collaborators invited -> work becomes clearer -> shareable output created -> new creator discovered.

Timeline is responsible for the "shareable output created" moment.

## Shared Objects Timeline Should Respect

| Object | Timeline meaning |
| --- | --- |
| Workspace | The private place where the working Timeline belongs. |
| Person | Creator, collaborator, guest, client, supplier, or viewer. |
| Milestone | A visible point in the direction of the work. |
| Decision | The reason a plan changed. |
| Risk | A confidence or timing issue that needs attention. |
| Update | A Timeline change that can feed changelog, activity, and briefing. |
| Shareable output | Unlisted Audience Timeline, change note, shared update, or planning page. |

## Cycle 1 Product Work

Prioritise:

- owner-only working plan and explicit link-only publication controls
- "what changed and why" history
- confidence language
- shared update summary
- privacy-safe source tracking for shared links
- events for Timeline item created, milestone moved, publication created,
  share link copied, qualified view counted, and change note published

Avoid:

- fake precision
- internal-only plans
- jargon-heavy roadmap statuses
- shared pages that hide the practical next step

## Acceptance Test

For the wedding/events wedge, a couple or venue coordinator should open a shared Timeline and understand:

- what phase the planning is in
- what is next
- what changed
- which decisions explain the change
- how much is complete and how long remains until the primary date

## Cycle 2: Invite And First View

Timeline owns the "Where this is going" and "What changed" parts of the invited collaborator's first view.

Role defaults for Timeline:

- Creator controls Timeline publication and sharing.
- Collaborator can see the shared Timeline and relevant changes.
- Guest can open an owner-controlled planning Timeline.
- Client / supplier can see phases and milestones relevant to them.
- Viewer can read an owner-controlled bearer-link Timeline and discover Signal Studio.

Cycle 2 implementation targets:

- owner-controlled bearer-link sharing
- change note for "what moved and why"
- confidence language for shared views
- source tracking on Timeline share links
- tasteful "Created with Signal Studio" placement

Acceptance test:

A couple opens a shared wedding Timeline and understands the completion state,
the next milestone, today's position, and the event horizon at a glance.

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

## Cycle 5: Wedding Conversion Path

When a shared update carries `segment=weddings`, its Signal Studio CTA now points to `/weddings`.

This keeps the viewer path specific:

- open a wedding planning update
- understand the state of the plan
- click through to a weddings/events Studio page
- ask about the Founding Venue Pilot or private planning workspace

Acceptance test:

A viewer of `/wedding-planning/update?source=roadmap_share&segment=weddings&role=viewer&campaign=founding_venue&artefact=shared_update` clicks "See Signal Studio" and lands on a page that explains Signal Studio in wedding planning language.

## Cycle 6: The Timeline Becomes The Artefact

The selected Audience Timeline owns the suite's clearest shareable-output
moment:

1. The owner chooses the milestones and publishes a frozen copy.
2. The owner reviews that exact copy at full size and in a phone frame.
3. The owner shares one unlisted, revocable link.
4. The recipient reads progress from one line without account or app chrome.
5. After two seconds of visible reading, one qualified view may be counted.
6. The owner sees the publication-level total without being told it represents
   unique people.

Acceptance test:

- At 90% complete, the line looks almost finished before the labels are read.
- The `Today` dash can sit between milestones.
- The first unfinished point reads `Our next milestone`.
- Percent complete and days remaining are both true, selectable readings.
- Phone preview and recipient view use the same public-safe projection.
- Owner previews, prefetch, crawlers, reload loops, and rotated links do not
  inflate or reset the view total.
- A person without the exact link cannot find the Timeline through search,
  navigation, a directory, or a guessable slug.
