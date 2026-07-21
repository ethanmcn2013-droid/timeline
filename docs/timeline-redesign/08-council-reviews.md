# Timeline design-lab council reviews

Review status: authoring, red-team, and final acceptance reviews complete
Selection status: no option selected
Production status: unchanged

## Review basis

The council reviewed the canonical product contract, current production architecture, public-output boundary, design-system rules, shared lab model, all three structural directions, the final source, and the frozen browser evidence. The source-backed audit is recorded in `00-current-audit.md`; the response is recorded in `01-design-principles.md`, `02-public-direction-contract.md`, and `03-state-matrix.md`.

## Specialist findings and final disposition

| Lens | Evidence-backed risk | Requirement integrated into Phase 1 | Final disposition |
| --- | --- | --- | --- |
| Information architecture and public comprehension | Existing public surfaces use fragmented ladders and derived summaries. | Every option leads with purpose and the canonical time ladder; update and detail reuse public facts. | Passed in source, tests, and the twelve-surface visual review. |
| Visual and editorial hierarchy | Existing surfaces over-emphasise containers, counts, and progress treatment. | Structure and type identify direction; metrics do not lead; options remain distinct in grayscale. | Passed final craft review; all visual scores are at least 9.7. |
| Owner curation and publishing interaction | Existing curation is pointer-led and lacks complete consequence and recovery feedback. | Explicit movement and reorder controls, reasons, refusal requirements, hidden recovery, undo, publication receipt, and focus continuity. | Passed model and browser interaction coverage. |
| Accessibility and responsive reading | Existing mobile and keyboard paths do not preserve full parity. | Canonical mobile order, touch-safe controls, visible focus, live announcements, actual-width review, reduced motion, and print treatment. | Passed Axe on all twelve surfaces, 390 px and 320 px checks, container reflow, keyboard, print, and reduced motion. |
| Front-end architecture and share reliability | Surfaces assemble facts independently; the lab route must not become a second production product. | One in-memory reducer, strict public projection, no database or server actions, bounded query selectors, and a review-only route guard. | Passed source review, route-guard tests, production build, and route-scoped bundle review. |
| Trust, privacy, and source tracking | Direct public entity reads increase leakage risk; legacy publish is not a frozen snapshot. | Separate working and published fixtures, exact public allowlist, hidden-item exclusion, owner-only sentinel, and privacy-safe URL selectors. | Passed privacy, attribution, and publication-continuity tests. |
| Benchmark and red-team critique | Familiar roadmap patterns can become a renamed kanban, Gantt theatre, or decorative progress graphic. | A ledger, editorial briefing, and bounded horizon provide distinct structures without copying benchmark pixels or importing their complexity. | Passed automatic-failure review; no option is a reskin. |

## Frozen acceptance evidence

- 18 of 18 model, query, and route-guard checks passed.
- 52 of 52 Playwright browser checks passed.
- 94 of 94 fresh screenshots were captured and hashed; the committed receipt matches the manifest SHA-256.
- Every option and surface passed desktop Axe review and 390 px reflow; dense fixtures also passed at 320 px.
- Keyboard movement, focus restoration, attribution persistence, public-sentinel exclusion, explicit not-found recovery, print, and reduced motion are covered.
- Repository lint, typecheck, design-system drift, experience self-test, experience validation, full tests, diff checks, and optimized production build passed.
- Production Timeline owner, public, update, detail, and data paths were not replaced.

## Final panel record

| Panel | Option A | Option B | Option C | Recommendation | Blocking Phase 1 changes |
| --- | ---: | ---: | ---: | --- | --- |
| Product and public comprehension | 9.74 | 9.78 | 9.74 | A owner + B public/update/detail + bounded C movement receipt. | None. |
| Visual craft and brand restraint | 9.86 | 9.84 | 9.87 | C first when distinctiveness is the deciding lens. | None. |
| Architecture, accessibility, and trust | 9.74 | 9.81 | 9.73 | B as the strongest standalone system. | None. |

All three panels kept scores below the 9.9 aspiration where real tradeoffs remain. No category fell below 9.5. Their evidence and category-level consensus are recorded in `07-comparison-scorecard.md`.

## Remaining tradeoffs

### A. Quiet Direction Ledger

- Fastest and clearest repeated owner curation.
- Least editorial shared update and least visually ownable complete direction.
- Most maintainable path when owner speed outweighs expressive change narrative.

### B. Editorial Plan Room

- Strongest ten-second orientation, public reading, change explanation, shared update, and standalone consensus.
- Owner mode has the highest vertical cost, especially with dense data.
- Requires disciplined copy editing to avoid becoming a long report.

### C. Signal Horizon

- Strongest product identity and Before/Now movement grammar.
- Spatial structure adds implementation and responsive complexity.
- Dense public mobile remains readable and overflow-free, but is the longest of the three.

## Phase 2 boundaries

Selection does not prove production integration. Phase 2 must still map canonical Tasks and Timeline data, implement durable working and published snapshots, enforce the public projection on the server, preserve history and refusal semantics, verify anonymous sharing against real access controls, migrate safely, measure production performance, prove rollback and observability, and update HQ and changelog receipts after deployment.

The fixture model proves the interaction and visibility contract. It is not evidence that the current production data plumbing already implements that contract.

No option or hybrid has been selected.
