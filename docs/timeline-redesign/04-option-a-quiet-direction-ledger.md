# Option A: Quiet Direction Ledger

Phase: coded design-lab direction only
Selection status: pending
Production status: unchanged

Implementation: `src/components/design-lab/timeline/options/option-a.tsx` and `option-a.module.css`
Shared contracts: `02-public-direction-contract.md` and `03-state-matrix.md`
Supporting guidance: `08-copy-guidelines.md` and `09-motion-guidelines.md`

## Direction

Quiet Direction Ledger is the calmest and most compact direction. It is designed for an owner who maintains the plan frequently and for a public reader who needs to scan it quickly.

Its organising device is a ruled document. The option does not use board columns, card grids, status colour, or schedule geometry. The canonical ladder `Now / Soon / Later / Done / Refused` remains one continuous reading path.

## Structural signature

- A vertical ledger uses section rules, row rhythm, and typography to organise the plan.
- Owner selection reveals the shared editing and movement controls in place.
- Working and published copies remain visibly distinct, with a publication receipt and unpublished count.
- Public mode removes owner controls and retains Done and Refused as readable records.
- Shared update becomes a dated change ledger using `Changed`, `Why`, and `Next practical step`.
- Detail pairs a compact plan index with one focused sheet. On mobile, the selected detail precedes the supporting index.

The option remains identifiable in grayscale because its hierarchy comes from rules and reading order, not theme styling.

## Surface decisions

| Surface | Phase 1 composition | Intended result |
| --- | --- | --- |
| Owner plan | Publication controls followed by five ruled sections and contextual tools. | Rapid repeated maintenance without a permanent control bar on every row. |
| Public timeline | Purpose and active direction first, then complete and refused records. | Predictable scanning with no editing noise. |
| Shared update | Recent public changes with reason, next step, and date. | A concise update that can be forwarded or printed. |
| Item detail | Public-safe detail sheet with timing, next step, history, and decision record. | Context one layer down without losing the wider plan. |

Every surface uses the shared fixture model and public projection. Option A does not calculate a separate interpretation of the plan.

## Owner interaction position

The ledger favours explicit, labelled controls over hidden gestures. Add, edit, move, reorder, hide, restore, delete, undo, and publish are supplied by the shared owner controller. A consequential move records a reason; Refused also requires a decision date.

The lab proves a keyboard-operable movement and reorder path. It does not prove final production drag behaviour, persistence, or publication.

## Strengths under review

- Lowest expected learning cost for daily curation.
- Strong direct comparison across all five buckets.
- Dense plans remain compact without smaller type.
- Owner and public versions retain a recognisable relationship.
- Change records are easy to quote, capture, and print.

## Tradeoffs and required scrutiny

- Repetition can become monotonous in a sparse plan.
- Purpose and change narrative receive less editorial emphasis than Option B.
- Archive treatment must never conceal a refusal reason or date.
- A long detail index must not delay selected content on mobile.
- Exposing more controls by default in Phase 2 would undermine the calm ledger.

## Phase 2 boundary

Selection would approve this information and interaction direction, not a mechanical replacement of production rows. Production implementation would still require canonical mapping from legacy tasks and overlays, a durable working-versus-published model, a server-enforced public DTO, source-parameter preservation, anonymous-link verification, and real migration and rollback evidence.

No production route, database record, publish action, or public URL is changed by this Phase 1 option.
