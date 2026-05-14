# Signal Roadmap · the dispatch

Convention: BRAND.md §6.5. Entries before 2026-05-14 keep their
original shape; the new shape starts at the next cycle.

## 2026-05-14 · R·2 · ships · atlas drift-trigger wires into roadmap commits

**Roadmap commits now flag the umbrella's atlas when a referenced
file changes.** A pre-commit hook in `.githooks/` runs a node
script against the staged file list, resolves any atlas references
that point at this repo, and writes drift into the studio repo's
canonical sidecar. The hook never blocks — drift is a signal, not
a gate. Activation is one `git config core.hooksPath .githooks`.

Smoke-tested by staging a file under `src/lib/entitlements-shared/`:
`pricing-and-entitlements` picks up the new drifted path via union
merge. The shared script gates `git add` on
`REPO_ROOT === STUDIO_ROOT`, so commits in this repo leave studio's
sidecar uncommitted for the studio operator to pick up. Full spec
lives at `~/Projects/personal/studio/docs/ATLAS_DRIFT_TRIGGER.md`.

## 2026-05-14 · R·1 · tightens · the roadmap reads on a phone

**Signal Roadmap gets the same mobile parity the umbrella and Tasks
just shipped. Horizontal scroll guard, mobile-correct H1 leading,
Clerk sign-up tap targets at the 44px floor, viewport-fit for notch
hardware, and the footer legal strip lifted from 17×11 to 32×12. No
copy, no product change — mechanical hygiene against the same
disciplines that S·26 and T·47 followed.**

The home page hero "Show your work, not your Jira." rendered at 47px
font / 45px line-height on a phone before this — the descenders of
"your" clipped into the cap-height of "Jira". A `@media (max-width:
640px)` block in globals loosens `.h-display`, `.h-title`,
`.h-section`, and `h1` leading from 0.96–1.10 to 1.04–1.18. The
desktop display-tight register is preserved above 640px.

`html, body { overflow-x: clip }` is added as a belt-and-braces
guard. No content overflows the viewport today, but anything that
ever did would scroll the whole body horizontally — same latent risk
that bit the umbrella before S·26.

Clerk got the mobile correctness treatment too. `formFieldInput`
gains `!min-h-[48px] !text-[16px]` — the 16px is the iOS Safari rule
that prevents auto-zoom on input focus. `formButtonPrimary` and
`socialButtonsBlockButton` get `!min-h-[48px]` so every button on
sign-up / sign-in passes WCAG 2.5.5. The `!` overrides Clerk's
internal styles in the Tailwind cascade.

Viewport export gains `viewportFit: "cover"` so iPhone notches
expose `env(safe-area-inset-*)`. Footer legal links jump from 17px
tall × 11px font to 32px tall × 12px font with `inline-flex` hit
areas and `safe-area-inset-bottom` padding. Same treatment the
umbrella and Tasks footers carry.

Typecheck clean.


## 2026-05-14 · Free-tier workspace cap

Roadmap now reads tier from the shared `signal-entitlements` DB
(suite-wide source of truth, populated by Tasks's Stripe webhook +
the new Studio operator endpoints). Free-tier users are capped at
1 workspace; Event / Wedding / Workspace / Studio tiers are
unlimited. The workspace-create form surfaces the cap with a real
upgrade CTA pointing at `signalstudio.ie/pricing`. Tier read fails
closed: a transient DB blip resolves to `free`, never silently
unlocking paid capacity.

The cross-product nav already shipped in the design-system pass —
this is the first cycle that actually does something the rest of
the suite can see.

## 2026-05-13 · Suite design-system v1 · Paper turns white, the dot learns to advance

The umbrella's new design system landed. Roadmap is the third product
across the line after Studio and Tasks.

**Paper white, ink at #111.** `--bg` reset from warm-stone `#fafaf7`
to pure `#ffffff`. Ink moved from the ramp's `#18181b` to the spec's
`#111111`. The semantic-token layer (`--paper`, `--paper-soft`,
`--paper-deep`, `--ink`, `--ink-soft`, `--ink-faint`, `--ink-ghost`,
`--hairline`, `--hairline-2`, `--indigo`, `--indigo-soft`) lands in
`globals.css` alongside the existing ramp + alias system, so legacy
callsites keep working while the rest of the rollout proceeds.

**`.roadmap-dot` learns to advance.** The dot's motion swapped from
the one-shot slide-on-mount (which played once then sat still) to
**M·03 advance — drift right 4px, fade, reset, repeat every 2.6s.**
Direction without urgency. The dot moves toward a destination, then
quietly returns and goes again. Continuous because direction isn't a
one-time thing. The indigo glow box-shadow retired — the design
system is restrained.

**What didn't change.** The Wordmark component API (`<Link>`,
sm/md/lg/xl, href) is unchanged. The dot's eye-correct proportions
(0.30em / -0.36em) stay. The roadmap status palette
(shipped/in-flight/next/blocked/refused), the pill grid, the public
viewer chrome, the workspace editor — all intact. Page-level
retouches land as pages get walked through.

**Carries forward.** Phase 4 is Analytics — same token set, wordmark
motion to tick (2.4s scope-style vertical pulse).

## 2026-05-13 · Suite review · rate-limit unbroken, comment-thread refusal honest in the demo

### `getClientIp` was throwing every call.

The `try` in `src/lib/rate-limit.ts` called `require("next/headers")`
synchronously and `headers()` synchronously. Next 16's `headers()`
is async — the call threw on every invocation, the catch returned
`"unknown"`, and every IP shared one bucket. Workspace-create
(5/hr) and source-save (30/10min) were silently unprotected.
Now async, awaited properly, propagated to the two call sites in
`workspaces.ts`.

### The demo stopped pretending threading was coming.

`scripts/seed-demo.ts` and `src/lib/roadmap/demo-data.ts` both had
a task at sort-order 4 titled "Shared comment threads on roadmap
items" with `status: "in-flight"`. Threading is a locked refusal
in `AGENTS.md`. Replaced with the actual refusal — same title, but
`status: "refused"`, `kind: "refusal"`, with the honest
description: *"Not shipping. Conversations belong in the work,
not bolted onto a status page. Replying lands in your email —
that's the channel."*

Same pass: the keyboard-shortcuts overlay (`ShortcutsOverlay`)
advertised `t` "Filter to today's items" and `w` "Filter to this
week" — neither handler exists anywhere in the codebase. Removed
the Roadmap group from the overlay. Only `?` and `Esc` listed now,
because those are the only two that actually work.

### Migration debt named.

`drizzle/0002_workspace_owner_template.sql` is now committed. The
three columns (`owner_name`, `owner_email`, `template_id`) were
added to the schema in Sprint 2 cycles 10.2 / 10.3 / Templates
T-2.1 but never got a migration — prod was kept in sync via
`pnpm db:push --force`. Prod was verified at parity today via
`PRAGMA table_info(workspaces)`; the file documents the state
and unblocks a fresh-environment bootstrap.

### Belt-and-braces on the data layer.

- `seedWorkspaceFromTemplate` and `upsertParsedItems` now run
  inside `db.transaction()`. A mid-loop failure leaves the DB
  intact for a clean retry instead of half-applying.
- `getActivityForTask` was returning the *oldest* 20 events,
  ordered ascending. Fine on a fresh task; useless once a task
  accumulates history. Now ordered desc, then reversed for the
  panel's chronological render.
- `ActivityPanel` wraps `JSON.parse(e.payload || "{}")` in
  try/catch. A single malformed legacy row crashed the entire
  public task-detail render before.
- `saveProjectSourceAction` caps `rawMarkdown` at 200KB.
  `createWorkspaceAction` caps `name` at 80 characters. Both
  silent before.

### Memory drift corrected.

The Plan 4.2 memory entry claimed Sentry PII scrubbing was wired
"across Tasks + Roadmap". Roadmap has no Sentry — no
`@sentry/nextjs` in deps, no `sentry.*.config.ts`. Memory amended
to name the gap honestly rather than carry the false claim.

## 2026-05-12 (latest +3)

### Avatar dropdown gained the siblings — second jump path landed.

The Clerk UserButton in the in-app top bar now lists "Open Tasks",
"Open Notes", "Open Analytics" above the Manage account / Sign out
rows. Each opens in a new tab. Roadmap doesn't list itself — you're
already here.

This is a second route to the same place the suite launcher already
goes (and it shipped in the same turn across all four products).
Two jump paths because the discovery profile differs: the launcher
is what a user finds when they look at the breadcrumb; the avatar
dropdown is what they find when they reach for "settings."

Implementation: thin client wrapper `src/components/user-button-
with-suite.tsx` around Clerk's `<UserButton.MenuItems>` +
`<UserButton.Link>` API.

## 2026-05-12 (latest +2)

### The breadcrumb learned to open — suite launcher landed.

The `signal studio.` text in the in-app top bar is no longer a
plain hard link to the umbrella. Click it now and a popover opens:
"Signal Studio · Four products, one studio." Four rows — tasks,
roadmap, notes, analytics — each with a one-word tagline.
Roadmap shows as the current product (de-emphasised, "HERE" tag).
The other three open in a new tab, so a Roadmap user who needs
Tasks can jump without losing the workspace they're standing in.
Footer row routes to signalstudio.ie.

Dissent named: this is visible suite chrome inside an authenticated
product — exactly the kind of move that risks turning four
sovereign products into one suite. Counter — the trigger is the
same 12px ink-quiet text that was already there yesterday; the new
behaviour is hidden until clicked. No caret, no tab grid, no
visual weight added. The popover bloom is the smallest
intervention that turns "type the URL" into "click here."

Implementation: new client component
`src/components/suite-launcher.tsx`, all-inline-styles to match
the existing top-bar styling pattern (Roadmap doesn't carry a
Tailwind chrome layer in `app/layout.tsx`). Click-outside +
Escape handlers wired manually to keep the dependency surface
flat.

## 2026-05-12 (latest +1)

### Suite breadcrumb landed in the authenticated app shell.

The marketing nav got the `signal studio. /` prefix yesterday. The
in-app top bar — the one logged-in users actually live behind — did
not, until now. Same prefix, same indigo dot, same 12px ink-quiet
weight, hidden below sm: so the workspace surface keeps its breathing
room on phones.

Wordmark size in the in-app bar bumped from `sm` to `md` to match
the marketing nav and read proportionally next to the 12px
breadcrumb prefix.

Dissent named: the alternative was to leave the in-app shell pure
("the workspace is its own world, no umbrella chrome"). Rejected
because users coming from signalstudio.ie can't currently get back
to the umbrella from inside Roadmap without typing the URL. The
breadcrumb is the smallest possible bidirectional thread; a launcher
popover is the next cycle.

## 2026-05-12 (latest)

### Suite chrome consolidated — one bar, breadcrumb prefix.

Two stacked nav bars collapsed into one. The Roadmap wordmark now
sits next to a small "signal studio. /" back-link on a single row;
the prior cross-product strip is gone. Cross-product discovery now
falls back to the footer (where the Suite column already lives).
See the umbrella changelog for the dissent captured inside the
decision.

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
