# Signal Roadmap · Changelog

## 2026-05-12 (later still)

### Sprint 2 cycle 10.3 — invited-by bar + reply on shared views

The /[workspaceSlug]/update page gained a top-of-page bar that names
the inviter, when the page was last updated, what the workspace is
for, and how to reply. New component InvitedByBar — server-rendered,
gracefully degrades on missing fields.

Reply gesture is a mailto link, not a Resend feedback form. Dissent
named: the Sprint 2 plan mentioned "a small Resend webhook", but
the locked refusal "no comment-thread infrastructure" cuts harder.
Mailto means: conversations belong in email, no new infrastructure,
and Roadmap stays a clarity artefact. The email address is also
shown as plain text alongside the button so users without a mail
client can copy directly. No fake "your message was received"
theatre.

Schema: workspaces gained ownerEmail (nullable text). Captured from
Clerk at workspace creation alongside ownerName. Pre-Sprint-2
workspaces: ownerEmail null → reply gesture is dropped entirely.
No fake addresses, no broken mailto links.

Conditional rendering:
- ownerName null: "Shared with you" eyebrow instead of "{Name}
  shared this with you"
- ownerEmail null: reply gesture omitted (whole right column drops)
- description null: brand-coherent fallback sentence
- lastUpdated null (empty workspace): timestamp line omitted

Demo data updated: studio shipping log → hello@signalstudio.ie,
wedding-planning → aoife@harbourhouse.example.

What's NOT in this cycle: reply tracking, history, threading. Locked
refusals all hold. The owner gets the reply in their inbox; that IS
the channel.

Operator actions before deploy:
- ALTER TABLE workspaces ADD COLUMN owner_email TEXT (Roadmap Turso)
- Optionally backfill: UPDATE workspaces SET owner_email = '<email>'
  WHERE slug = '<slug>'

## 2026-05-12 (later)

### Sprint 2 cycle 10.2 — public guest view shows owner + last-updated

The /[workspaceSlug] public hero now carries a slim attribution line
below the description: "Shared by [Owner name] · Last updated
[X hours ago]". Brand-mission read: collaboration means the invited
person feels nothing — but they should also feel grounded. The
forwarded link now reads as "this is my friend Ethan's plan, last
updated this morning" instead of as a generic public page.

Schema: workspaces gained an ownerName column (nullable text).
Captured from Clerk at workspace creation via clerkClient.users.getUser
(first+last → username → email-local in that order). Public render
stays a single DB query — never a Clerk API call.

Query: getLastUpdatedForWorkspace returns MAX(tasks.updated_at) for
the workspace, null if empty. Public hero formats relative ("3 hours
ago", "2 days ago"); brand-coherent with Notes's relativeTime.

Conditional rendering: if ownerName is null, just shows the last-
updated line. If no items yet, no line at all (the empty state copy
takes over). No fake attribution.

Demo data updated: studio shipping log shows "Ethan McNamara",
wedding-planning shows "Aoife Murphy".

What's NOT in this cycle: a settings UI for the owner to edit
ownerName after creation. Existing workspaces (pre-2026-05-12) have
null ownerName until an operator backfill — code falls back
gracefully. Operator action documented in the HQ block.

Operator actions before deploy:
- ALTER TABLE workspaces ADD COLUMN owner_name TEXT (Roadmap Turso)
- Optionally backfill existing rows: UPDATE workspaces SET
  owner_name = '<name>' WHERE slug = '<slug>'

## 2026-05-12

### Suite review T3.b — cinematic demo aligned to post-Comments reality.

The Cycle 11.3 cinematic demo scripted a comment-thread beat: a
cursor opens a thread on a roadmap row, types a reply ("Yes —
confirming with the supplier this morning"), the thread closes, the
view morphs to timeline. Three scenes, ~4 seconds. When the morning's
T3 ripped the Comments architecture out of the product, the demo
kept narrating a feature that no longer existed. §2.2 demo-vs-reality
gap — the exact failure mode the brand is built against. I created
the drift; this is the close-it-back-up.

The thread scenes are gone from the state machine. `cursor-lingers`
extends naturally and bridges straight to `view-morph-timeline` — the
cursor reads the row that just moved, the public-watching beat lands
honest, the demo gets ~3 seconds tighter. Less is more.

What stays in the narrative: workspace activity (three status
transitions), multi-cursor reading, viewer-count rising, share-link
copy, view morph to timeline, RSS subscription, follower count tick,
view morph back. Collaboration is still the story. What's gone is
the lie that someone-other-than-the-owner can write to a public
roadmap.

### Suite review T3 — Comments architecturally killed.

The morning's T0 owner-gate honored the locked refusal at the
render layer; this commit honored it at the architecture layer.
Comments removed:

- `src/components/roadmap/comments.tsx` (deleted)
- `addCommentAction` in `src/server/actions/workspaces.ts`
- `getCommentsForTask` + `addComment` query helpers
- the `Comments` import + JSX block in the item-detail page
- the `Comment` type + `comments` table import (unused)

The `comments` column in the schema stays — preserves any
pre-existing owner annotations. No code path reads or writes
through it. If a real owner-only annotation gesture ships later,
the right shape is a private description field on the task, not
a panel.

The Cycle 11.3 demo kept scripting a thread-typing beat after this
landed. The downstream T3.b fix above closes the drift.

### Cycle 12 shipped — BigStat extracted; project-detail status row aligned to the tabular register.

Closing the loose end I named at the bottom of the Cycle 11
notes. The workspace surface used a values-first stat row —
`9 TOTAL  2 DONE  3 DOING…` — big tabular numbers above small
uppercase labels, semantic colour. The project-detail surface
was still in the prose register: `9 total · 2 done · 3 doing…`
inline, small text, no tabular nums.

Two surfaces, one job, two visual registers. That's the kind of
small inconsistency that costs the brand its weight over time.

BigStat is now a shared primitive (`components/roadmap/big-stat.tsx`).
The workspace surface uses the imported version (no visual change
— same code, different file). Project-detail's status row drops
the prose and adopts the same component, including the project-
specific `Won't do` link to refusals. Visual register now matches
across both workspace-scoped heroes.

## 2026-05-12

### Cycle 11 shipped — the meta-strip rhythm becomes a brand primitive, now carries across project + refusals heroes.

The Cycle 8 workspace surface introduced a small uppercase rhythm
strip above the h1 — `STUDIO. SHIPPING LOG · 2026-05-08 → 2026-07-01
· 8 WEEKS · 2 MILESTONES`. The review memo §5.2 called it "the
most brand-coherent line on the page" and argued for extending it.
Cycle 11 does that.

The pattern is now a real component (`components/roadmap/meta-strip.tsx`)
with two slots: an `anchor` (the identity token, rendered slightly
bolder) and an `items` array (the quiet register, separated by
middle dots). Conditional items can be passed as `null` and they
filter themselves out — no ternary spaghetti at the call site.

Project-detail heroes now read `PRODUCT ROADMAP · 2026-05-08 →
2026-07-01 · 8 WEEKS · 2 MILESTONES` and the h1 below picks up the
§5.1 period-dedup rule. Refusals heroes now read `TASKS · PRODUCT
ROADMAP · REFUSALS · 1 DECISION`; the h1 below shortens to "What we
said no to." (the meta strip already carries the workspace identity,
so the h1 doesn't need to repeat it).

Homepage skipped on purpose — it's product marketing, not workspace
data, and inventing made-up stats for the meta strip would break the
plain-English brand promise.

## 2026-05-12

### Cycle 10 shipped — the hero dial earns its place; the h1 stops doubling its period.

Two small tightenings to the hero. The dial + Next-milestone lockup
used to render on every workspace regardless of size — a 50% dial on
a two-item roadmap is theatre. They now gate on a hasMomentum check:
≥5 non-refused items OR ≥1 milestone. Below that, the hero stays
calm and a single understated line reads "{shipped} of {total}
shipped." right-aligned where the dial was. The stat row below
already carries the actual numbers, so the dashboard furniture
disappears until the work earns it.

Second, the h1 used to hardcode-append a period (`{workspace.name}.`).
That broke when a workspace name already ended in punctuation —
"studio. shipping log." would have read "studio. shipping log.."
when we still had it. Now the page checks whether the name already
ends in `.`, `!`, or `?` and only adds the period when missing.
Tasteful by default; safe for whatever a user types.

The third sharpening from the review memo (§5.4: switch the dial
fill from `--status-shipped` green to `--brand` violet) was
considered and pushed back on — see review §5.4 dissent below.

## 2026-05-12

### Cycle 9 shipped — items show which milestone they're for, demo workspace gets a name a stranger can read.

Two sharpenings from the Cycle 8 review memo (`docs/REVIEW_2026_05_12.md`),
both small enough to fit in one cycle.

The first: items in the main list now render a soft `→ for <milestone>`
line under the title when the item is dated on or before the next
un-shipped milestone. The line only shows on the first row in a
contiguous run pointing at the same milestone, so a group of items
all rolling up to "Public launch" reads as `→ for Public launch`
once at the top of the group, not eight times down the column. The
gravitational pull of the next moment is now legible without the
reader having to mentally connect dates.

The second: the demo workspace is renamed from `studio. shipping log`
(a designer in-joke that broke the plain-English brand promise) to
`Tasks · Product Roadmap`. The description carries the framing —
"An example public roadmap, drawn from Tasks (the live task-workspace
product)." A first-time visitor can now parse the title on first read
and the substance (Tasks's real product work) stays grounded.

`hasMomentum` gating on hero furniture (REVIEW §3.2) is deferred —
the judgment of *when* a workspace earns the dial is heavier than
either of the above and wants a dedicated cycle.

## 2026-05-12

### Cycle 8 shipped — public viewer rebuilt at the GTM beat, milestones land as a first-class section.

The workspace surface used to read like a clean list of items with a
small stat strip on top. Polite. Generic. The Tasks GTM page reads
like a working document with stakes — date range, progress dial,
launch beats, blockers as a card grid. The difference isn't decoration;
it's emotional charge. This cycle imports that beat into Roadmap
without copying the parts that didn't fit.

The hero now opens with a meta strip (workspace · date range · weeks ·
milestone count), a typographic h1 ending in a period, the plain-English
description, and — top-right — a "Next milestone" lockup with T-N
countdown plus a progress dial reading `done / (total − refused)`.
Stats sit inline under the title as values-then-labels rather than
chips, so the eye reads `9 TOTAL  2 DONE  3 DOING…` as one rhythmic
row instead of a colour bar.

Below the hero, two new sections sit above the list: **Blockers** as
a card grid (dwell time, "two weeks" badge when held up longer than a
fortnight) and **Milestones** as a card grid with per-milestone
progress bars (share of dated non-refused items due on or before that
date that have shipped), a T-N pill, and an `n/m` ratio. The right
rail gains a Milestones list with the same T-N treatment.

Milestones are promoted from markdown. Wrap a bullet title in
`**bold**` and the parser sets `kind = "milestone"` + `isLaunch = true`
— the schema already had the columns; the parser shipped v1 with the
flag hard-wired to false. The editor's new collapsible bullet-syntax
legend documents the six bracket conventions plus the bold convention
in one place.

The demo workspace gained two seeded milestones (Public launch,
First paying workspace) so the new section reads at first glance.

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
