# Option C: Signal Horizon

Phase: coded design-lab direction only
Selection status: pending
Production status: unchanged

Implementation: `src/components/design-lab/timeline/options/option-c.tsx` and `option-c.module.css`
Shared contracts: `02-public-direction-contract.md` and `03-state-matrix.md`
Supporting guidance: `08-copy-guidelines.md` and `09-motion-guidelines.md`

## Direction

Signal Horizon is the most distinctive restrained Signal Studio interpretation. Near work receives more structural room than distant work, making current position and horizon visible without implying exact dates.

The option uses spatial hierarchy only as a reading aid. Written bucket labels remain authoritative. It does not use Gantt geometry, paths, nodes, gradients, glass, glow, or a zoomable canvas.

## Structural signature

- Now, Soon, and Later form a bounded horizon with deliberately unequal room.
- Done and Refused remain archive bands inside the same plan.
- The owner view adds a contextual planning rail on wide screens.
- Public mode keeps the horizon but removes editing chrome and internal facts.
- Shared update makes before-and-after direction shifts the central composition.
- Item detail uses a narrative body and public-facts inspector. Mobile becomes a canonical linear document.

Content remains anchored to the design-system container. Additional browser width produces calm margins, not a wider planning canvas.

## Surface decisions

| Surface | Phase 1 composition | Intended result |
| --- | --- | --- |
| Owner plan | Weighted active horizon, archive bands, and selected-item planning rail. | See where an item sits while editing its direction. |
| Public timeline | Purpose and publication receipt above active horizon and settled records. | Understand nearness, sequence, and decisions at a glance. |
| Shared update | Direction shifts with Before, Now, reason, date, current work, and coming-up work. | Make movement legible without progress theatre. |
| Item detail | Narrative, next step, decision and history beside an inspector of public facts. | Connect one item to the wider horizon. |

Spatial emphasis never changes facts or bucket membership. All four surfaces receive the shared model and public projection.

## Owner interaction position

The planning rail gives selected-item controls a stable wide-screen home. On smaller frames it enters ordinary document flow, so no action depends on a sticky sidebar or precise pointer input. The shared controller provides explicit move, reorder, refusal, visibility, deletion, recovery, and publication actions.

The lab proves a bounded spatial composition. It does not implement a schedule engine, dependency graph, production animation system, or false timing precision.

## Strengths under review

- Most distinctive structural expression without ornamental graphics.
- Makes current work and future direction visibly related.
- Before-and-after records create a strong movement grammar.
- A stable rail can keep owner controls powerful without repeating them.
- Archive bands keep Done and Refused in the same direction object.

## Tradeoffs and required scrutiny

- Highest responsive and implementation complexity.
- Unequal width can be mistaken for duration, effort, or certainty.
- The planning rail must not become a dashboard column.
- Dense Soon or Later data can disrupt the intended spatial balance.
- Mobile must be judged as a first-class linear document, not a compressed desktop layout.

## Phase 2 boundary

Selection would approve a relative-horizon hierarchy, not Gantt behaviour or schedule precision. Production implementation would still require canonical mapping, durable publication snapshots, a strict server projection, source tracking and public-link verification, production focus restoration, real-data performance proof, and a motion pass tied to actual state changes.

No production route, database record, publish action, or public URL is changed by this Phase 1 option.
