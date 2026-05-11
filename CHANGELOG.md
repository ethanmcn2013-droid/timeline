# Signal Roadmap · Changelog

## 2026-05-11

### Cycle 3 shared update artefact.

Roadmap now has a public shared update surface at `/[workspace]/update`.
It derives a short plain-English update from existing roadmap data: current
state, current focus, held-up work, next steps, recent progress, and project
snapshot.

Workspace headers and master roadmap pages now link to the shared update with
source-tracking query fields. The demo seed includes dates and completed items
so `/tasks/update` can show a useful proof page after seeding.

The demo update route also falls back to bundled proof data when preview
deployments do not have Turso rows available, so the shared link remains
useful instead of failing with a server error.

Cycle 4 has started with the first weddings/events proof path:
`/wedding-planning/update`. It uses bundled wedding planning data so a venue,
planner, couple, or supplier can see a plausible shared planning update before
the live template and invite flow exist.

## 2026-05-10

### Readiness alignment.

Roadmap was pulled back into the Signal Studio suite contract. Public chrome now
uses canonical `*.signalstudio.ie` URLs. The old Vercel fallback links and
personal email address are gone from marketing surfaces.

The homepage, about page, footer, and pricing page now speak as Signal Roadmap:
direction clarity, private preview, public plans in plain English. Paid-plan
claims are marked planned when the repo does not yet contain billing or delivery
routes.

Missing homepage and pricing components were restored so the repo can build from
GitHub main instead of depending on local-only files.
