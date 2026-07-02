# Signal Roadmap · the dispatch

Convention: BRAND.md §6.5. Entries before 2026-05-14 keep their
original shape; the new shape starts at the next cycle.

## 2026-07-02 · R·28 · tightens · Timeline keeps the shared shell

**Timeline's accepted footer and product-header chrome now ride on current main.** The footer uses the shared Product, Company, Resources, Suite structure with the iOS status link, and the public/app headers keep the same sticky product shell as the rest of Signal Studio while preserving Timeline's own reading surface.

## 2026-07-01 · R·27 · ships · the public plan answers "where does this stand?" before the title lands

**One plain-English line now opens the public workspace page: "On track for Jun 14." — or, honestly, "Aiming for Jun 14." when something is late or waiting, or "Everything here has shipped." when the work is done.** The verdict is derived entirely from data the page already fetches (zero new queries, ISR intact) and reuses the needs-attention overdue logic rather than re-deriving it. The taste call is in the degradation: the public share is the owner's face to their client, so the "aiming" state carries the truth in the verb without broadcasting counts of late items the owner didn't choose to publish — receipts stay on owner surfaces. Green and amber dots from the existing status palette; no red, no percentages. This is also the mobile reader's first date read — the milestone emphasis block is desktop-only, so phones previously rendered the plan with no target date anywhere. Milestone rows themselves don't flip the verdict; only the feeding items do. Eight unit tests lock the three-state contract. Branch-pending via PR.

## 2026-06-20 · R·26 · ships · two views, not four — a Gantt and a Timeline, no list

**The public plan now offers exactly two views: a Gantt — every dated item as a bar across the months, grouped by project — and a Timeline that is literally one straight line with the milestones plotted as points along it. The Overview list, the milestone-card stack, and the month-grid Schedule are gone.** Founder direction closes REVIEW Gap 2, the four-view switcher question R·24 deferred as founder-gated: rather than gate the old Overview/Roadmap/Milestones/Schedule set, the set itself collapses to the two views a non-technical reader actually asks for — "where does everything sit in time" (Gantt) and "what are the moments we're building toward, in order" (Timeline). Gantt is the default (bare URL); Timeline is the single deep-linkable `?view=timeline`. The pre-paint CSS now shows the Gantt with no JS at all and the inline script only flips to Timeline on a deep link, so ISR and the no-JS baseline are intact and the bare shared link renders the Gantt immediately. The honest-data contract holds: real task rows carry a single `targetDate`, never a span, so the live Gantt's bars sit at each item's target *month* (true at the data's granularity) and never invent per-item durations — the locked refusal the old Schedule view documented. The marketing demo mirrors the product — its two morphing views are now Gantt (real start→end spans from the demo pack, honest there) and Timeline (the same straight-line-of-points) — and the hero loader + product loading wordmark read "timeline", with the dot laying a timeline track ("the line extends") instead of unfolding a map. Removed the now-dead `roadmap-flow`, `milestone-map`, `schedule-view`, `list-view`, and `roadmap-row` components. Typecheck + build clean (17/17 static pages, no route-shape change).

## 2026-06-14 · R·25 · ships · the plan shows what's anchored and how fresh it is

**A reader can now see the milestones on the line and how recently the plan moved, without asking.** Milestones render as a dated diamond glyph on the Now/Soon/Later ladder — not a new lane, not a drag-bar. The public view carries a plain-English freshness stamp ("Updated this morning", "3 days ago") computed from the latest edit, honouring the copy rules: no raw timestamps, no project-management phrasing. Branch-pending via PR #5.

## 2026-06-09 · R·24 · cuts · the hero stops greeting the recipient with chrome, and "Refusals" stops being the first word they read

**The non-logged-in visitor — the wedding planner's mother who was sent a link to a plan — no longer crosses a demo banner, a mono meta-strip, a six-count BigStat band, and an eleven-colour KIND taxonomy before they reach the first thing the work is actually about. The Refusals surface stops shouting the operator's word three times before its plain-English H1. And the curious recipient who landed on the marketing homepage gets a quiet path back to "what is this?" instead of a hero written only for prospects considering signing up.** The cuts close REVIEW-2026-06-09 Layer 2 — the four moves the Director of Roadmap Product Excellence flagged as runnable without a founder gate. (1) On the public `/{workspaceSlug}` hero, the demo banner is gated to `isOwner` (a recipient did not arrive to see "what your roadmap could look like" — they arrived to read the work), the MetaStrip is gated to `isOwner` (the title + "Shared by … Last updated …" already carry identity, attribution, recency without a decorative uppercase mono sweep), and the BigStat band — Total · Done · Doing · Next · Waiting · Won't do — is gated to `isOwner`. The BigStat row in particular was the brand drift the review named directly: it reassembles dashboard energy in the hero of a calm-pages product, in the language of a project manager auditing their own grid, when the recipient came to see what is happening, not to audit lane balances. (2) On the public row list, the KIND pill on `ItemRow` is gated to `isOwner` and threaded down from both call sites (`OverviewView` → `ItemListByProject` on the workspace overview, and the project drill-down). The eleven kinds — POST, ASSET, PRESS, PAID, KPI, LAUNCH, MILESTONE, ACTION, BLOCKER, REFUSAL, CYCLE — are marketing-team vocabulary; a wedding planner's mother reading "PAID" next to a deposit row reads it as "paid for", and "KPI" in emerald is dashboard register lifted directly. The taxonomy stays for the owner; it leaves the public surface entirely. (3) On `/refusals` the public copy renames to "What didn't make it" — the phrase already living in the right rail at `workspace.page` line 1139, now a single source of truth across the workspace-header nav chip, the breadcrumb, the page `<title>`, and the H1. The MetaStrip on this surface is cut — there is no timeline or count rhythm to anchor and it was pure decoration; the H1 carries the meaning. The "Decisions are only legible if you can see the no's" sub-copy is cut — a brand sentence written to the operator about the brand, not to the visitor about the work. The URL slug stays `/refusals` so shared links don't break. (4) On the marketing homepage hero, a quiet 12.5px line — "Were you sent this? What Signal Roadmap is." — sits below the reading-room status pulse and routes to `/about`, the existing recipient-oriented explainer. The hero copy above still reads to prospects; the new line catches the second audience the mandate names — the recipient — without growing the page. Deferred by directive: the four-view switcher gating (REVIEW Gap 2) is L3 founder-gate and stays untouched this pass; the hero-copy rewrite and pulse-removal (REVIEW Gap 5) are L3 and stay untouched — only the recipient-path link landed. Typecheck clean; build clean (16/16 static pages, no route shape change).

## 2026-06-06 · R·23 · tightens · "blocked" is gone from the database too, and "waiting" is calm sky, not alarm red

**The Status enum that was renamed in the UI in R·19 is now renamed in the database itself, the calm-status visual is a soft sky instead of borrowing the alarm tone, and the `--alarm` token is its own thing for surfaces that actually need to alarm.** R·19 ended the display gap — what a stakeholder reads is "Waiting". R·20 closed the KIND/STATUS overlap and added the attention layer. R·21 finishes the thread at the persistence layer: the `Status` union, the Drizzle migration (`drizzle/0006_rename_status_blocked_to_waiting.sql`), the synthetic counts, the shared-update snapshot shape, the template sources in Signal Studio and the regenerated `templates.generated.ts`, and every consumer of `t.status === "blocked"` now speak the same word the operator and stakeholder do. The CSS gets its own disentangle: `--status-waiting` (`#1d6fa3` on `#eff6fc`) replaces `--status-blocked`, and a new `--alarm` / `--alarm-bg` (`#ef4444` / `#fee2e2`) token carries the genuinely alarming red for surfaces that earn it — the blocker card on the public roadmap (GTM blocker is a real blocker), form validation copy on workspace/project/template creation, and `publish-control` error text. Status-domain consumers point at the calm sky; alarm-domain consumers point at the explicit alarm. The two semantics no longer share a paint, which means a "Waiting" pill can never again look like an emergency. Migration is forward-only: prod runs `0006_rename_status_blocked_to_waiting.sql`, which `UPDATE`s any row in `tasks` and `node_overlays.manual_status` carrying the old literal. `templates.generated.ts` no longer admits `"blocked"` so an unmigrated template would fail at parse-time — verified that no shipped canonical template (wedding planning, local business monthly rhythm) carried that status literal at deploy time; both sources were rewritten in this cycle. Typecheck clean on both roadmap and studio repos.

## 2026-06-06 · R·22 · ships · drift is now visible while you edit, not only while you read

**The plan editor's NodeCard wears the same calm "Idle" or "Overdue" pill the reading surfaces gained in R·21 — so the owner sees the attention signal at the moment they're authoring, not only when they're scanning the public view.** R·20 surfaced the count, R·21 surfaced per-row indicators on ItemRow, and R·22 closes the loop on the third surface where the owner reads about their own plan — the curation/plan editor. The same pure `attentionReason(task, now)` selector runs at the card level: NodeCard computes the reason once per render and renders the amber pill (`var(--status-flight)` tone, no red, no glow) when set, sitting between the title and the meta row so it never competes with the lane segmented control or date input. The curation surface is owner-only by route, so no `isOwner` gating is needed — the pill simply never reaches a non-owner because the page itself doesn't. `EffectiveNode` gained a required `updatedAt: Date` field so the selector has the timestamp it needs; synced nodes use the underlying Tasks row's `updatedAt`, manual nodes use the overlay row's `updatedAt` (manual nodes are the source of truth for themselves). The type is type-checked end to end — a future regression that drops the field fails the build. Calendar-day-anchored overdue and day-bucket idle mean server-render and client-hydration agree within the same calendar day, so the indicator is hydration-safe without `suppressHydrationWarning`. Typecheck clean.

## 2026-06-06 · R·21 · ships · drift surfaces per row, not just in the count

**Every drifted item now wears a small "Idle" or "Overdue" pill where the owner is reading — public stakeholders still see nothing.** R·20 surfaced the Needs attention count; R·21 closes the per-item loop so the owner can scan the list and see *which* rows the signal is about. The same pure selector from R·20 runs at the row level: ItemRow takes a new optional `attentionReason` prop, rendered as a calm amber pill (`var(--status-flight)` tone, no red, no glow) when set. Both call sites — the workspace overview's project-grouped list and the project drill-down's flat list — pass the reason only when `isOwner` is true; visitors receive `null` and the pill never renders. The project drill-down also gained the same owner-only "Needs attention" BigStat that landed on the workspace page in R·20, so the count is present at both scopes. `ItemListByProject` and `OverviewView` now thread `isOwner` as a required prop — type-checked end to end, so a future regression that drops the gating fails the build instead of silently leaking the indicator to visitors. Notes and Analytics audited at the same time and confirmed clean: Analytics already speaks the calm vocabulary natively (the briefing blocks are "Needs attention / Moving well / Quiet risks / Suggested focus"), Notes has no status vocabulary surface to align. Typecheck clean on the four edited files.

## 2026-06-06 · R·20 · ships · the calm-attention layer lands, and a KIND finally stops sharing a word with a STATUS

**Owners now see a single quiet "Needs attention" count on their own workspace page — drifted items the plan needs them to look at — and the KIND pill that names a blocker entity no longer reads "Blocked" the same way the status field used to.** Two threads close together in one cycle. (1) Tier 3 attention layer (the brief's "Quiet Intelligence" tier): a pure `needs-attention.ts` selector flags any task as needing attention when it's `overdue` (target date in the past, status not settled — shipped or refused) or `idle` (status `in-flight` or `blocked`, untouched for the same 14-day cadence the blocker dwell badge already uses). Overdue wins precedence when both apply — the date miss is the more concrete signal. The count surfaces as one more BigStat on the workspace overview, gated by `isOwner` so a stakeholder reading the public plan never sees a number that would alarm them without giving them agency. Computed server-side once per request from the existing task fetch — no second query, no DB write, no migration. Refused tasks are excluded — a dropped item is not drift. 14 unit tests over the selector cover the boundary cases (13-day-old is calm, 14-day-old flags; same-day target is not overdue, calendar-day-anchored; settled states exempt; malformed dates don't crash; precedence rule). (2) The `blocker` KIND pill renamed "Blocked" → "Blocker" — the row was already a noun ("this thing is a blocker"), the label just hadn't caught up. Closes the vocabulary thread opened in R·19: KIND and STATUS no longer share the word "Blocked", and "Waiting" is the only place "blocked" semantics surface as a label. Untouched on purpose: the `--status-blocked` token (the amber tone still anchors the calm waiting visual), the `Status` DB enum (per-workspace overrides keep working), the cinematic showcase demo (no new attention signal needs surfacing in the marketing reel), and the curation surface itself (Needs attention is information for now, not an action gate — the count surfaces drift without dictating the fix). Typecheck clean on the 5 edited/added files; pure-helper suite 18/18 green.

## 2026-06-06 · R·19 · tightens · status reads "Waiting" not "Blocked"

**Across every public and owner surface, the `blocked` status now reads as "Waiting" — the calm-coordination word a stakeholder actually parses without translation.** This is the suite-wide Tier 1 vocabulary move continued from Signal Tasks T·81 (lanes `doing`/`review` rendered as "Moving"/"Waiting"). Six sites updated: the `STATUS_META` map in `status-pill.tsx` (every pill across owner and public views), both BigStat treatments on the public workspace page (the §1.6 calm public-view block and the standard counts strip), the project drill-down BigStat, the project-card stat strip on the master roadmap, and the activity-feed status-change label map. The cinematic showcase demo's `STATUS_LABEL.held` was aligned from "Held up" to "Waiting" to honour the demo contract that its vocabulary must mirror the live product. The §1.6 comment that explained the public view chose plain `var(--ink)` (no red) because "'Blocked' in red is alarming" was rewritten to capture the calmer read — "Waiting" reads calm to a recipient who doesn't know the internal language. Untouched on purpose: the DB `Status` enum (`blocked` stays the persisted token so per-workspace column overrides via `meta` keep working), the `--status-blocked` / `--status-blocked-bg` CSS tokens (the amber tone carries the calm semantic), the `blocker-card.tsx` aria-label (GTM blockers, different domain), and the KIND pill in `kind-pill.tsx` whose `blocker` entry still labels "Blocked" — that's a separate semantic (KIND, not STATUS) and a follow-up rename. Typecheck clean on the six edited files.

## 2026-05-22 · R·18 · fixes · the curation surface stops silently swallowing failed edits

**Renaming a milestone, toggling hidden, changing lane, picking a date, and reordering rows on the owner's plan view all silently dropped the user's change on a DB or network fault — the optimistic UI showed success while the write was lost.** The four NodeCard inline-edit paths (`commitTitle`, `toggleHidden`, `setLane`, `setDate`) and `applyReorder` called overlay/reorder actions but never inspected the `{ ok: true } | { error: string }` return value. Same shape of bug as the C1 manual-add silent-fail from R·14 — same fix pattern, transposed to the existing-node owner surface. Each site now inspects the result, surfaces the error string via a transient `role="status"` (not `role="alert"` — non-blocking, polite-announce), and reverts any local optimistic state (input value for title, full-list snapshot for reorder). The error flash and the existing "Saved" tick are mutually exclusive — a fresh success supersedes a stale error, and vice versa — so the user never sees both states in the same breath. `reorderNodesAction` also picked up a try/catch around `batchUpsertNodeSortOrders` for symmetry with `upsertNodeOverlayAction`, returning a calm error string instead of bubbling a rejected promise into the React tree. A single `handleEditResult` helper kills four near-identical copies of the result-handling pattern across the four edit sites. Error copy is BRAND §3 voice — plain English, actionable, mirrors the C1d register: "Couldn't save that change. Check your connection and try again." Closes the C2 ticket opened during the 2026-05-19 roadmap-elevation cycle. Build + typecheck + 35/35 test suite green.

## 2026-05-22 · R·17 · fixes · manual milestones no longer 404, and they stop pretending to belong to a project

**Tapping a manual milestone on a published roadmap used to break the workspace — the link routed to a project-scoped detail page that had no row to render, and a fallback assignment quietly bucketed every manual milestone under the first project in the workspace, so the same item appeared to "belong" to a project it had nothing to do with.** Manual milestones live entirely in `node_overlays`; they have no `tasks` row and no project foreign key. The fix splits the title link by source: synced milestones keep their existing project-detail deep link, manual milestones become in-page anchor jumps to `#milestone-{id}` so the click lands on the milestone in context instead of a 404. The right-rail upcoming list applies the same split. Every milestone card now carries an `id` attribute regardless of source — anchor targets exist for synced cards too, which means a shared overview URL can be deep-linked to a specific milestone for the first time. The `[projectSlug]/[id]` route gracefully redirects manual ids that arrive via pre-existing shared links or crawler indices, and the metadata function flips `noindex` on them so the about-to-redirect URL stops getting indexed. The misleading `projects[0]` fallback is now isolated — the synthetic Task shape still carries it for back-compat with MilestoneMap accents (where it degrades to the brand colour, harmless), but no consumer of the title link or anchor target reads it anymore. Four new pure-helper tests verify the discriminator (`isManualMilestoneId`) does not false-positive on synced ids or false-negative on manual ids — getting either direction wrong would resurface the original bug. Build, typecheck, 35/35 test suite green.

## 2026-05-21 · R·16 · ships · close your account, install the app to your home screen

**Settings · Account is now reachable from the avatar dropdown, with an irreversible delete that closes your Signal identity in one step; the web app installs to a phone or desktop home screen with the Roadmap mark.** Typing your email confirms the delete; the server wipes every workspace you own — projects, items, sources, the lot — and then asks the identity layer to close the account. There is no grace period; the action is final and visible before you commit to it. Installable add-to-home-screen now ships a manifest, an Apple touch icon carrying the full wordmark, and a maskable Android tile. The cross-origin first-paint window — the moment when another product hops to the workspace surface — now paints the wordmark identity loader instead of a bare dot, on both the authed wrapper and the public viewer. Required for Apple App Store submission later this summer.

## 2026-05-19 · R·15 · fixes · manual-only published workspaces now render publicly

**A workspace whose milestones were all created by hand — never synced from Signal Tasks — now shows its plan to stakeholders instead of "Nothing here yet."** `isWorkspacePublished` was checking the `tasks` table only; manual nodes live entirely in `node_overlays`. The public page now fetches effective nodes and merges manual milestones in; `hasItems` accounts for visible effective nodes. The plan page's CurationSurface is now behind a scoped Suspense boundary so the breadcrumb and heading paint immediately on navigation, eliminating the full-page skeleton flash (D4). DEPLOYED to production 2026-05-19 (dpl_7ED9taw6MqfYApj5EMYLvccZX4F1, main 4db4892).

## 2026-05-19 · R·14 · ships · the manual milestone path works, and the route voids are gone

**A milestone added by hand now persists and appears immediately — the core
write path that was silently failing on production is fixed, end to end.**
The plan editor no longer froze its node state at mount, the overlay write
revalidated a wrong path, and a background sync could clobber an in-flight
edit; all three are closed, with the create form now holding open and
surfacing the reason when a save fails. Navigating into the app no longer
flashes a charcoal void or an oversized dot: the authed shell is one
persistent route group with in-flow skeletons. The empty state collapses to
one clear action with the add form opening in place; a sync that finds
nothing now says exactly what to do in Signal Tasks instead of a dead grey
line; the publish gate counts what you actually see, so a hand-built plan
can be published. Copy made honest and declarative, date inputs unified, a
quiet publish nudge added, the wordmark given its own ambient mark.
Panel-gated end to end (holistic 9.5/9.5/9.5/9.7). Build clean; deployed to
prod and verified (200 marketing, 307 app entry, 200 public plan). Deferred
by plan: the RSC-driven node refactor (H4); tracked in
ELEVATION_C2_TICKET.md.

## 2026-05-19 · R·13 · ships · the workspace chrome carries four visible pills

**The authed `/app` chrome now shows all four products as always-visible
pills instead of the hidden "signal studio." popover trigger.** The shared
canonical `SuiteSwitcher` replaces the launcher in the app layout, carrying
the umbrella anchor once, the dot-morph jump, hover-prefetch and preconnect.
The public workspace header — the forwarded shared-plan view a guest sees —
deliberately keeps the popover: suite pills must not leak the logged-in
affordance to a stakeholder reading a plan. Build clean; deployed to prod
and verified (200 marketing, 307 app entry).

## 2026-05-18 · R·12 · tightens · escape hatch reconciled to suite-wide §14 canonical

**The seamless-ecosystem escape hatch used a roadmap-local cookie name
(`roadmap_demo_mode`) while every other Signal product already implemented
DESIGN.md §14's `signal_preview_public` — meaning "View public site" was
the only escape hatch in the suite that wouldn't survive a cross-product
session handoff.** The reconcile lands five files: the middleware reads
the canonical cookie and accepts `?preview=public` as an alternative entry
point; client-side cookie writes gain a 24-hour expiry (`max-age=86400`)
and `SameSite=Strict` to match the spec; and the account menu now renders
"Exit preview" when the cookie is live, with a click clearing it. No Layer
0 change — `/{workspaceSlug}/*` category-C routes were never in the
M-allowlist and remain unrestricted for all visitors.

## 2026-05-17 · R·10 · ships · the wedding example is a calm plan, not a stakeholder roadmap

**The one artifact the whole venue pitch points at was rendering a
couple's wedding in software-roadmap chrome — "Doing 2 · Blocked 1 ·
Won't do 1", a 31%-done dial, T-44 countdowns, a refusals rail, "Press ?
for shortcuts" — and carried no venue name at all.** That surface is
right for a product roadmap shown to stakeholders and wrong for a couple
who was forwarded their plan. `/the-wedding` is now a bespoke read-only
route: Now / Soon / Later, four plain states (Done · Underway · Waiting
on you · Coming up), and the venue named once at the top in a quiet line
— an eyebrow, never a logo. Only "Waiting on you" carries colour,
because it is the only state that asks the couple to do anything.

It is a document, not an app: no per-item drill-down, no stat band, no
dial, no shortcuts. No database read, no rate limiter, no schema change
— a static segment that takes route precedence over the generic viewer,
so the generic viewer keeps its correct stakeholder vocabulary for real
product roadmaps. `/demo` points here. Content is verbatim-faithful to
the panel-approved venue example. Verified at 390 and 1440 by
computed-style audit (the perpetual wordmark gesture times out
screenshots): paper white, ink #111, the wedding accent spent only on
the one state that earns it, no horizontal overflow at either width.

## 2026-05-16 · R·9 · tightens · the unified H1 fits the phone, not just the page

**The unification's own headline — and every public plan's title — was
sized for the desktop and sheared off the right edge of a phone.** A
pixel-verify of the shipped unification (the fictional product gone, the
real viewer as the landing, the Schedule view live) at a true 390-pixel
viewport found the one gap a desktop eye misses: the display H1's lower
bound was too large, so the hero ran past its own clip and a long
workspace name like "Maya & Tom — Spring Wedding." ran off its axis.

Both H1 floors were brought down — the landing hero and the public
viewer title now wrap and fit a phone, with the workspace title given
balanced wrapping. Desktop is untouched: both still reach their full
size by the time the viewport is wide enough to hold them. Verified by
reading the rendered layout at 390 and 1440, not by trusting a
screenshot — the headline now fits the phone, not just the page.



**Every column link in the site footer was an 18-pixel target stacked
eight pixels from the next — fine with a cursor, a coin-toss with a
thumb.** The legal row beneath them had already been given a real
touch height in the mobile pass; the navigation column above it never
was. On a phone the two rows looked alike and behaved differently.

The column links now carry the same minimum touch height as the legal
row, deliberately without the horizontal padding that would have
broken the column's vertical rhythm. No visible change under a desktop
pointer; on a phone the whole footer is reliably tappable. Found in a
four-product parity sweep against the mobile discipline the umbrella
set in S·26 — Tasks already held the line, Notes has no marketing
footer, Analytics carried the identical gap and is fixed in the same
pass.

## 2026-05-15 · R·5 · cuts · the banned purple out of the live demo cursors

**The §5-forbidden `#7c5cff` was the colour of a cursor in the
public roadmap demo — the "beta · London · just now" visitor — on a
file whose own comment says "anonymous indigo tones." A prior pass
declared the suite's purple "purged," but that sweep only ever
looked at the Tasks repo, case-sensitively. Roadmap was never
checked. One banned cursor, live on the marketing demo every
visitor watches.**

`beta` is now `#6366f1` (indigo-500, a real ramp token) — distinct
from `alpha` (#4f46e5) and `gamma` (#5b6cff) so the three demo
cursors stay legible, now genuinely "anonymous indigo tones" as the
file always claimed. Found by re-running the overclaimed §5 sweep
the right way: case-insensitive, all five repos, the command pasted
into the record. That sweep now returns zero `#7c5cff` /
`rgba(124,92,255)` across the entire suite — verified, not asserted.
typecheck + build clean. The standing lesson, repeated because it
keeps paying out: a scoped or case-sensitive grep is not a sweep,
and "purged" without the command is a guess.

**The product was selling a wedding planner a software roadmap. The
public demo read "Composite-PK multi-tenancy" and "paste your markdown"
to an audience of people planning weddings and running building jobs —
the exact vocabulary-alienation failure the brand exists to refuse
(§2.2). This cycle makes the demo their own use case, and makes the
landing lead with the real thing instead of a fabricated mock.**

**The demo is now a real wedding plan.** `/the-wedding` — Maya & Tom,
a spring wedding, planner-voiced, dated across eight months, three
milestones with distinct progress. "Save-the-dates out" is 100% done,
so the milestone map's settled state is real, not theoretical: a green
station, a filled ring, "Everything for this is done." Every view now
sings on real data — the Schedule spreads across nine months, the
board fills four honest lanes, the path to the day reads at a glance.
A wedding planner lands here and sees their own work, in their own
words. Seeded idempotently (`scripts/seed-wedding.ts`).

**The front door tells the truth.** `/demo` was a 1.5-second client
redirect to the software roadmap; it's now an instant server redirect
to the wedding — no flash, no JS needed, crawlable. The hero shows the
real product framed as a live page, not the audience-toggle mock. The
landing lost its duplicate feature/how-it-works triads, its
hairline-divider spam, and its dead vertical rhythm: one narrative —
real product, what an item is, how it works, one confident close.

**Readable on a phone.** Schedule chips wrap to two lines on wider
columns, so a real task name ("Florist arrival time still not
confirmed") reads instead of truncating. Verified world-class on
mobile across Overview, Roadmap, and Milestones; Schedule scrolls
horizontally like a calendar, which is the honest pattern for a
timeline on a small screen.

Held, named not silent: the mobile Schedule gutter is wide on small
screens (a polish refactor of the grid math, not a blocker); the
orphaned `showcase/` tree and the dead `RoadmapView`/`MilestonesView`
functions are tree-shaken already (zero user impact) and wait for a
dedicated tidy cycle; the pre-existing Overview blocker card can read
"blocked for 0 days" on a future-dated item.

## 2026-05-15 · R·U2 · ships · Roadmap and Milestones become maps, not lists

**For the 80% who don't work in tech, a list is a spreadsheet and a map
is a plan. Two of the four views were still lists pretending to be
visualisations. This cycle makes them things you see, not things you
read — and fixes the two P0s the last deploy left live.**

**Roadmap → flow map.** The project-grouped list is now four
plain-English lanes a wedding planner or a builder reads at a glance:
To do, Doing, Held up, Done. Project-tinted cards, milestone chips,
calm register (Apple/Linear/Arc, never Jira). Overview keeps the
briefing list — it's the read-everything view; Roadmap is the
where-does-it-stand view.

**Milestones → progress map.** The card stack is now a path: stations
in date order on a spine, each with a draw-on ring, a plain T-minus
("31 days to go"), and the work feeding it as a calm pip row. A station
at 100% earns a quiet settled state. The payoff is real progress made
visible — the delight is earned, never decorative.

**Motion that never hides content.** Entrances are mount-triggered, not
scroll-gated — a public roadmap must be readable on first paint, with
no JS, by a crawler. `prefers-reduced-motion` renders the final state
flat. The stats band is now Overview-only; on the board it counted
milestones the lanes exclude and contradicted itself.

**The two P0s closed.** The hero demo toggle said "Timeline" — a
locked-banned word for this product; it now says "Schedule", matching
the shipped view. The landing's proof image showed the retired
"studio. shipping log" brand; it's regenerated from the unified viewer.

Deferred to R·U3 (named, not silent): the real viewer as the landing
hero (P4); the landing's duplicate three-column rows and dead vertical
rhythm; an Overview deep brand pass; demo data with spread target dates
so Schedule and the milestone rings stop looking identical; and the
now-dead RoadmapView/MilestonesView functions left in page.tsx.

## 2026-05-15 · R·U · unifies · the fictional product dies; one viewer, four honest views

**Signal Roadmap was two products wearing one nav — a ~1,400-line
marketing landing that faked a live product (invented followers, phantom
viewers, "Cork · 2h ago" presence theatre) bolted onto the real
server-rendered viewer it shared zero components with. This cycle
collapses them into one surface and ships the view model the product
always implied.**

**The strip (R·U1).** The fake engagement theatre and the four-audience
preset spread are gone. The landing now leads with the real viewer's
bones and the weddings/events wedge. One status vocabulary, one set of
components, one product. A rounded-pill view switcher promotes the three
working lenses — Overview, Roadmap, Milestones — to first-class
destinations off `?view=`, server-derived, ISR preserved.

**The gated fast-follow (R·U2).** Schedule lands as the fourth view.
It is deliberately *not* a port of the cinematic showcase timeline: that
component fabricates start/end spans from a demo pack, and a real task
carries only a single target date. Inventing durations would have
re-opened the demo-vs-reality gap this whole cycle exists to close.
Instead, items sit as markers at their real target month, grouped by
project, with a milestone diamond lane, a Today line, and an explicit
"No date yet" tray for unscheduled work — honest about what the data
does and does not know. Status colour reuses the live viewer's own
scale so the schedule reads as the same product, not a bolt-on.

**The unblock.** The known-live production blocker is closed: Upstash
is provisioned, so every rate-limited write path is live again instead
of failing 100% closed. Deployed to production this cycle.

## 2026-05-15 · R·4 · tightens · the code-review slate closes the security, perf, and dead-code queue

**A three-axis code review (architecture / security / data-perf) ran in
parallel against the whole repo; the safe-to-ship findings land here in
one cycle, holding the composite-FK migration and dead-table drops for a
dedicated DB cycle so a schema push doesn't surf in on a hardening pass.**

**Security P0s.** `createProjectAction` was the only state-mutating
server action with no rate limit — it now caps at 20/IP/hour, matching
the workspace + source-save guards. `refusals` joined `RESERVED_SLUGS`:
a workspace could previously register that slug and shadow its own
`/[slug]/refusals` sub-page. The entitlements resolver no longer trusts
the raw `tier` text column — an unknown value (a legacy "pro" row from
the old Tasks-era schema) coerces to `free` rather than flowing through
`as EntitlementTier` and resolving to `undefined` in TIER_LABEL.

**Perf.** The public roadmap was accidentally dynamic-everything.
`getWorkspace` / `getProject` / `getTask` are now wrapped in React
`cache()` so `generateMetadata` and the page body share one query per
request instead of round-tripping Turso twice — three duplicate reads
killed on the task-detail page alone. The workspace page dropped its
separate `getCountsForWorkspace` full-table read and derives the status
counts from the task list it already fetches. `saveSourceAndItems`
collapsed its per-item insert loop into one batched
`INSERT … ON CONFLICT DO UPDATE` — pasting a 50-item roadmap is now one
Turso round trip, not fifty. The three public routes gained
`revalidate = 300`; the source-save action already calls
`revalidatePath` so stakeholders still see edits immediately.

**Bundle.** `ClerkProvider` moved off the root layout — it now scopes
to `/app/*` and the sign-in / sign-up routes via a shared appearance
module. The Clerk runtime no longer ships to the public roadmap viewer
or marketing pages, which never call Clerk; `/`, `/about`, `/pricing`,
`/changelog`, and `/demo` now prerender as static. `optimizePackageImports`
added for `motion` + `@clerk/nextjs`.

**Dead code.** `upsertParsedItems` (no callers), `getCountsForWorkspace`
(now derived in-page), and the three cross-tenant count aggregates (no
callers, full-table fetches to count in JS) were removed. The
`tasks.projectSlug` schema comment claimed deletes cascade through a
`deleteProject` that doesn't exist — corrected to state plainly that no
project/workspace delete path ships in v1 and the DB will not cascade.

The dashboard plan chip rendered `workspace.plan` — a column written
once at creation and never updated on upgrade, so a paid user saw
"Free" forever. It now reads the live canonical tier from the shared
entitlements DB. Held for a dedicated cycle: composite FKs across
`tasks` / `subtasks` / `activity`, dropping the dormant `comments` +
`subtasks` tables, and the `0002` migration's fresh-env re-run hazard.

## 2026-05-15 · R·3 · ships · the post-launch audit lands across copy, share, security, and the cards

**Five-axis review of Signal Roadmap (doc / copy / app / UI / UX / code)
ran in parallel; the actionable findings ship here as four commits.**
This is the cycle that closes the audit's P0/P1 queue without dragging
the structural workspace-routing refactor into the same push — that one
holds for a dedicated cycle so it doesn't surf in on the back of a copy
bundle.

**Copy bundle.** Eight one-line swaps in `domains.ts`, `demo-data.ts`,
`app/page.tsx`, and `about/page.tsx`. "This sprint", "two teams",
"Composite-PK multi-tenancy", "a team telling customers", "investors
and the team", and "small teams" all surfaced live despite Plan 3.5 +
Plan 5 catch-net passes. The "studio. shipping log" workspace name in
demo-data.ts — a designer in-joke previously retired only in the seed
script — gets corrected at source so any fallback path renders the
right name.

**Share moment.** This was the gap that most undermined the product
promise. The public URL rendered as static monospace text with no
copy affordance — the value moment of the product had zero
interaction. Pulled PublicUrlChip into its own client component with
a Copy-link button that confirms "Copied" on tap. The workspace
creation form retires the word "slug" — label is now "Your public
link", headline is "What's the plan?", helper copy describes the
link directly. Marketing nav flips: primary CTA is "Start for free" →
/sign-up, "See it live" demotes to ghost. Hero CTA "Open the roadmap"
becomes "Publish your plan", routed to /sign-up instead of the gated
/app. Mobile menu added to SiteNav — it was missing, leaving every
mobile visitor with one CTA and no path to Pricing, About, Changelog,
or sign-in.

**Code P1s.** `saveProjectSourceAction` verified workspace ownership
but not that the supplied `projectSlug` actually belonged to that
workspace — an authenticated user could pair workspaceSlug=A with
projectSlug=B and the upsert would manufacture task rows under a
mismatched composite key. Added a `getProjectsForWorkspace` check
mirroring `createProjectAction`'s uniqueness guard. Separately:
`upsertParsedItems` and `upsertProjectSource` ran as two independent
calls — a mid-flight failure left items in the tasks table while
`lastParsedAt` stayed null (editor renders "never parsed" while the
public viewer renders the new items). New `saveSourceAndItems` wraps
both writes in one `db.transaction`.

**UI de-slop.** ProjectCard sat at `rounded-2xl` with an
absolute-positioned `blur-3xl` radial glow blob behind every card —
the Vercel-template signature DESIGN.md §10 calls out as a refusal.
Removed the glow span outright; the top accent bar was already doing
the identity work alone. Radius pulled to `rounded-[10px]` (the `--r-3`
card token), hover shadow goes through `--shadow-2`. Same radius
correction on the proof-section homepage screenshot — it's a thumbnail,
not a hero panel.

**Held for next cycle.** Workspace routing fix — `getCurrentWorkspace`
anchors to `workspaces[0]`, so the `workspace` paid tier can create N
workspaces under the entitlement cap but the editor and `/app`
dashboard silently scope to the first one. Bundling a URL-segment
refactor with this copy + UI bundle would have mixed blast radius.
Holding for R·4.

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
