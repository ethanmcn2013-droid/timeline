# C2 — Inline-edit & reorder silent-absorb (RESOLVED R·18, 2026-05-22)

**Opened:** 2026-05-19 · roadmap-elevation cycle · gate-required before branch merge (Product + UX panel condition on C1 9.5 clearance)

**Closed:** 2026-05-22 · R·18 commit `658aef0` deployed prod (smoke OK; redirect from R·17 still works; build + typecheck + 35/35 test suite green).

**Scope (as opened):** `NodeCard` inline-edit paths (`commitTitle`, `toggleHidden`, `setLane`, `setDate`) and `applyReorder` / `reorderNodesAction` call `upsertNodeOverlayAction` / reorder action but do **not** inspect the `UpsertOverlayResult` / reorder return value. On a DB/network fault the optimistic UI shows success while the write was lost — same class as the C1 manual-add bug, but on the owner-only curation surface (not the public viewer) and on already-existing nodes.

**As-shipped:**
- All four NodeCard inline-edit sites + `applyReorder` inspect the action result.
- A single `handleEditResult(result, onLocalRevert?)` helper consolidates the four near-identical sites; `applyReorder` keeps its own snapshot-and-revert for the full-list rollback.
- On error: transient `role="status"` flash adjacent to the "Saved" tick, mutually exclusive with it, auto-clears at 4s. Local optimistic state reverts where it exists (input value for title, full-list snapshot for reorder).
- Error copy returned from the action; thrown-exception fallback uses the C1d-register string: "Couldn't save that change. Check your connection and try again."
- `reorderNodesAction` picks up a try/catch around `batchUpsertNodeSortOrders` for symmetry with `upsertNodeOverlayAction` — no rejected promise bubbles into the React tree.

## SUITE-SKELETON-RECONCILE (CLOSED — not applicable, 2026-05-22)

**Closed reason:** the ticket was opened on the assumption that Studio, Tasks, Analytics, and Notes carried the same `.skeleton-shimmer` gradient as Roadmap. Verified empirically 2026-05-22: none of the four other repos contain a `.skeleton-shimmer` rule at all. The architectural direction shifted to **wordmark loaders** between this ticket opening (2026-05-19) and the suite's next loader pass (`wordmark-loader-2026-05-20`). The four other repos now use the static-dot loader canonized in studio `DESIGN.md §13` — there is no shimmer to reconcile.

`--paper-bone` is therefore a Roadmap-only token, deliberately. Mechanically porting it to three repos that have no consumer would have shipped dead CSS.

If a future suite-wide skeleton pattern is reintroduced (currently no plan), `--paper-bone` (+#ebebec, ~L*92) is the trough token to copy and `--paper-deep` (#f4f4f5, ~L*96) is the peak — that pairing produces the restrained ~4 L* delta documented in the original ticket body. Until then the divergence is intentional architectural, not drift.

## GESTURE-VOCAB-RECONCILE

Roadmap's wordmark currently uses a low-key opacity pulse (0.85 to 1.0, 3s ease-in-out alternate, reduced-motion guarded) per the approved elevation plan (`roadmap-elevation` branch, `src/app/globals.css` `.roadmap-dot` + `@keyframes roadmap-dot-ambient`). This diverges from the ratified per-product gesture vocab (Roadmap = "sweep" — a horizontal translation gesture, per the suite gesture-conformance record at `~/Projects/personal/studio/DESIGN.md §14`). The divergence is intentional: RW-5 of the elevation plan deliberately removed the sweep dot to avoid competing with the SuiteLoader skeleton pulse sequence during page load. Restoring a canonical horizontal sweep would require either sequencing it after the SuiteLoader exits or scoping it away from the load boundary entirely. Whether to restore a canonical Roadmap sweep gesture on the wordmark is a deferred brand-conformance decision. It must not be silently forked: when picked up, reconcile against the suite gesture-conformance record and document the resolution.

## SUITE-SKELETON-RECONCILE

Roadmap's `.skeleton-shimmer` trough was deepened from `--bg-deep` (#f4f4f5, ~L*96) to `--paper-bone` (#ebebec, ~L*92) for legibility. The prior trough→peak delta was ~3–4 L* (trough `--bg-deep` #f4f4f5, peak a `color-mix` blend of `--bg-deep`/`--bg-elev` that collapsed to near-identical values on the light theme), making the shimmer practically invisible. The new ramp: trough `--paper-bone` #ebebec (~L*92) at 0%/100%, peak `--paper-deep` #f4f4f5 (~L*96) at 40–60% — a restrained ~4 L* delta, readable without being a flash. The `--paper-bone` token was added to the paper ramp in `src/app/globals.css` immediately after `--paper-deep`. The reduced-motion static fill was also updated from `--bg-deep` to `--paper-bone` so the static "loading" state reads as visually distinct from a blank/empty surface on both animated and no-motion paths.

The suite skeleton canon (studio `DESIGN.md §13`, shared as the loading-boundary reference across the other 4 repos: Studio, Tasks, Analytics, Notes) does NOT yet carry `--paper-bone`. This is a tracked, deliberate divergence — roadmap ships the fix first. A later suite-conformance pass must add `--paper-bone` to all four remaining repos' paper ramps and update their `.skeleton-shimmer` gradient stops to match, so the skeleton does not produce different contrast levels per-product. Do not silently absorb this into a general CSS sync; open a dedicated conformance issue when picking it up.

## GESTURE-VOCAB-RECONCILE

Roadmap's wordmark currently uses a low-key opacity pulse (0.85 to 1.0, 3s ease-in-out alternate, reduced-motion guarded) per the approved elevation plan (`roadmap-elevation` branch, `src/app/globals.css` `.roadmap-dot` + `@keyframes roadmap-dot-ambient`). This diverges from the ratified per-product gesture vocab (Roadmap = "sweep" — a horizontal translation gesture, per the suite gesture-conformance record at `~/Projects/personal/studio/DESIGN.md §14`). The divergence is intentional: RW-5 of the elevation plan deliberately removed the sweep dot to avoid competing with the SuiteLoader skeleton pulse sequence during page load. Restoring a canonical horizontal sweep would require either sequencing it after the SuiteLoader exits or scoping it away from the load boundary entirely. Whether to restore a canonical Roadmap sweep gesture on the wordmark is a deferred brand-conformance decision. It must not be silently forked: when picked up, reconcile against the suite gesture-conformance record and document the resolution.
