# Option A: Quiet Direction Ledger

Phase: coded design-lab direction only
Production status: not selected and not shipped
Implementation evidence: `src/components/design-lab/timeline/options/option-a.tsx` and `option-a.module.css`

## Intent

Quiet Direction Ledger optimises for repeated owner maintenance and fast public scanning. Its organising device is a ruled document, not a board. The plan reads in the canonical order `Now / Soon / Later / Done / Refused`, with colour reserved for the one fact that needs attention.

The option should feel dependable enough to update every day and calm enough to share without explanation.

## Structural signature

- A single vertical ledger uses section rules, row rhythm, and type hierarchy rather than card grids.
- Selecting an owner row reveals the shared edit and movement controls in place.
- Working and published copies remain explicitly switchable, with an unpublished-change receipt beside the publish action.
- Public mode removes owner controls and keeps Done and Refused as legible archive sections.
- Item detail pairs a compact plan index with one focused detail sheet. On a narrow frame, the selected detail takes priority over the index.

This structure remains identifiable without colour. It is not a renamed kanban and does not use spatial position to imply exact dates.

## Four-surface composition

| Surface | Composition | Primary question answered |
| --- | --- | --- |
| Owner plan | Publication receipt, five ruled sections, selectable rows, and contextual controls. | What needs maintaining, and what is not published yet? |
| Public timeline | Purpose, active direction first, then complete and refused records. | Where is this going now and next? |
| Shared update | A dated change ledger with `Changed`, `Why`, and `Next practical step`. | What moved, why did it move, and what happens next? |
| Item detail | Direction index plus a focused public-safe sheet with timing, next step, history, and decision record. | What does this item mean in the plan? |

All four surfaces receive facts from the shared lab model. The option does not create a separate data interpretation.

## Interaction position

The ledger favours explicit controls over hidden gestures. Add, edit, move, reorder, hide, restore, delete, undo, and publish are supplied by the shared owner controller. A move that carries consequence records a reason; a move to Refused also requires a decision date.

The Phase 1 lab proves a keyboard-operable move and reorder path. It does not prove final production drag behaviour, durable storage, or real publication.

## Strengths to test

- Lowest expected learning cost for an owner who updates the plan frequently.
- Strongest direct comparison across all five time buckets.
- Dense states can remain compact without shrinking typography.
- The public and owner versions retain a recognisable relationship while removing editing noise.
- The change ledger is easy to quote, print, or forward.

## Tradeoffs and red-team risks

- Repetition can become monotonous in sparse plans unless purpose and current direction remain prominent.
- A compact ledger gives change narrative less editorial emphasis than Option B.
- Archive disclosure must never hide the existence, date, or reason for a refusal.
- On mobile, the index must not delay the selected detail.
- Dense inline editing can become visually noisy if more controls are exposed by default in Phase 2.

## Phase 2 boundary

Selection of this option would approve the interaction and information direction, not a mechanical replacement of production rows. Production work would still need to map legacy tasks and overlays into the canonical ladder, define a durable working-versus-published model, preserve source parameters, enforce the public DTO at the server boundary, and verify real anonymous share links.

No production route, database record, publish action, or public URL is changed by this option.
