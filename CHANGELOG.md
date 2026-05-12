# Signal Roadmap · Changelog

## 2026-05-12

### Cycle 11.3 shipped — cinematic demo rebuilt at the Tasks bar.

The old homepage demo had a side-by-side layout (text on the left,
small kanban on the right) and a single scene that didn't read as
the audience surface Roadmap actually is. That's been replaced.

Hero is now Tasks-pattern: eyebrow + H1 + body + CTAs + status pip
("Demo is live · choose an audience to reseed") + an AudienceToggle
+ the cinematic demo full-width below. Four audience packs share the
suite axis: Wedding (default per the locked GTM wedge), Building
project, Product launch, Startup plan. Each ships its own URL, view
counts, rows, transition script, and timeline window.

The demo itself runs an 18-scene loop. Three anonymous reader cursors
(Dublin · 14m ago / London · just now / Cork · 2h ago) drift in,
hover items, and *follow* them when their status changes — when
"Catering tasting Friday" slides Doing → Shipped, the reader who
was on that item rides along. Mid-loop, a Share button in the URL
bar gets pressed by a cursor before the "Link copied" toast fires;
the share gesture now has a cause inside the frame.

A reader lingers on a row and an inline comment thread opens
underneath ("Will this be confirmed by Friday?") — the owner reply
types out character-by-character with a blinking caret. Then the
whole surface morphs to Timeline view: rows reshape into horizontal
bars across a 6-month axis with a Today line drawn through the
active month. Holds, then a "+1 subscriber via RSS" toast lands in
the corner and the Followers count ticks up. Morphs back to List.
Cursors leave. Reset.

Stack: motion/react + the existing brand tokens, DOM-measured cursor
targeting against row refs, layoutId-stable cards across view morphs,
reduced-motion guard collapses to the final-state static composition.

### Workspaces can now start from a canonical template (T-2.1b).

The Roadmap product can now seed a new workspace's projects and items
from a Signal Studio canonical workspace template. The plumbing landed
earlier today (T-2.1a) — this cycle wires the actual workspace creation
path.

`createWorkspaceAction` accepts a `fromTemplate` form field. When set,
it resolves the template via `getSyncedTemplateRoadmap`, creates the
workspace with the matching `templateId`, then calls a new
`seedWorkspaceFromTemplate` helper that inserts the template's
projects and items in one pass. The user is redirected to the workspace's
public page on success rather than `/app`.

A new public route at `/onboarding/from-template/[id]` renders the
template-aware variant of the create form: the workspace name is
pre-filled from the template, an item-count line explains what will
land, and a hidden `fromTemplate` input wires the seed.

`onboarding` is now reserved — workspace slugs can't take it.

The next templates cycle (T-2.1c, in Tasks) wires the cross-product
CTA so remixing a template in Tasks surfaces the option to create a
Roadmap for the same workspace.

### Templates plumbing — workspaces remember their template, canonical wedding slice arrives (T-2.1a).

The Roadmap product is now wired to consume canonical workspace
templates owned by the Signal Studio repo. Three things landed:

The `workspaces` table gained a nullable `template_id` text column.
When a workspace is created from a canonical template (T-2.1b, next),
this column carries the template id (e.g. `wedding-planning-workspace`)
so subsequent visits and shared updates know which template framed the
plan.

A `pnpm sync:templates` script reads the sibling studio repo and
writes `src/lib/templates.generated.ts` with the roadmap slice from
each canonical template (projects, items, status, target dates).
The generated file is committed — Vercel doesn't need the studio repo
to build.

The canonical wedding planning workspace's roadmap slice is reshaped
to match Roadmap's actual data model — projects with items, not the
earlier sections+milestones placeholder. The wedding planning items
read as a clear shared update for venue, couple, and suppliers.

T-2.1b (the workspace create flow accepting `fromTemplate` and
actually seeding projects + items from the synced slice) is the next
templates cycle. The hand-built `weddingDemoWorkspace` continues to
render `/wedding-planning/update` in the meantime — no user-visible
regression.

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

Wedding-segment shared updates now send the "See Signal Studio" CTA to the
Studio `/weddings` route, giving forwarded planning updates a relevant
viewer-to-creator path instead of dropping people on the generic homepage.

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
