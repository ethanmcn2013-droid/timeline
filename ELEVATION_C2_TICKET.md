# C2 — Inline-edit & reorder silent-absorb (deferred, tracked)

**Opened:** 2026-05-19 · roadmap-elevation cycle · gate-required before branch merge (Product + UX panel condition on C1 9.5 clearance)

**Scope:** `NodeCard` inline-edit paths (`commitTitle`, `toggleHidden`, `setLane`, `setDate`) and `applyReorder` / `reorderNodesAction` call `upsertNodeOverlayAction` / reorder action but do **not** inspect the `UpsertOverlayResult` / reorder return value. On a DB/network fault the optimistic UI shows success while the write was lost — same class as the C1 manual-add bug, but on the owner-only curation surface (not the public viewer) and on already-existing nodes.

**Severity:** pre-existing (predates roadmap-elevation), owner-surface only, lower tier than manual-add (owner sees the result immediately; not a "thought I created something that doesn't exist" trap). Correctly deferred out of C1 scope.

**Required fix when picked up:**
- Inspect the action return on all four NodeCard inline-edit sites + `applyReorder`.
- On error: revert the optimistic state and surface a **transient, advisory** message using `role="status"` (NOT `role="alert"` — these are non-blocking confirmations, not interruptive errors), rendered as a brief inline note adjacent to the affected field, auto-dismissing.
- Error copy: BRAND §3 voice, plain English, actionable (same register as C1: "Couldn't save that change. Check your connection and try again.").

**Do not merge `roadmap-elevation` without this ticket existing.** (It does.)

## SUITE-SKELETON-RECONCILE

Roadmap's `.skeleton-shimmer` trough was deepened from `--bg-deep` (#f4f4f5, ~L*96) to `--paper-bone` (#ebebec, ~L*92) for legibility. The prior trough→peak delta was ~3–4 L* (trough `--bg-deep` #f4f4f5, peak a `color-mix` blend of `--bg-deep`/`--bg-elev` that collapsed to near-identical values on the light theme), making the shimmer practically invisible. The new ramp: trough `--paper-bone` #ebebec (~L*92) at 0%/100%, peak `--paper-deep` #f4f4f5 (~L*96) at 40–60% — a restrained ~4 L* delta, readable without being a flash. The `--paper-bone` token was added to the paper ramp in `src/app/globals.css` immediately after `--paper-deep`. The reduced-motion static fill was also updated from `--bg-deep` to `--paper-bone` so the static "loading" state reads as visually distinct from a blank/empty surface on both animated and no-motion paths.

The suite skeleton canon (studio `DESIGN.md §13`, shared as the loading-boundary reference across the other 4 repos: Studio, Tasks, Analytics, Notes) does NOT yet carry `--paper-bone`. This is a tracked, deliberate divergence — roadmap ships the fix first. A later suite-conformance pass must add `--paper-bone` to all four remaining repos' paper ramps and update their `.skeleton-shimmer` gradient stops to match, so the skeleton does not produce different contrast levels per-product. Do not silently absorb this into a general CSS sync; open a dedicated conformance issue when picking it up.

## GESTURE-VOCAB-RECONCILE

Roadmap's wordmark currently uses a low-key opacity pulse (0.85 to 1.0, 3s ease-in-out alternate, reduced-motion guarded) per the approved elevation plan (`roadmap-elevation` branch, `src/app/globals.css` `.roadmap-dot` + `@keyframes roadmap-dot-ambient`). This diverges from the ratified per-product gesture vocab (Roadmap = "sweep" — a horizontal translation gesture, per the suite gesture-conformance record at `~/Projects/personal/studio/DESIGN.md §14`). The divergence is intentional: RW-5 of the elevation plan deliberately removed the sweep dot to avoid competing with the SuiteLoader skeleton pulse sequence during page load. Restoring a canonical horizontal sweep would require either sequencing it after the SuiteLoader exits or scoping it away from the load boundary entirely. Whether to restore a canonical Roadmap sweep gesture on the wordmark is a deferred brand-conformance decision. It must not be silently forked: when picked up, reconcile against the suite gesture-conformance record and document the resolution.
