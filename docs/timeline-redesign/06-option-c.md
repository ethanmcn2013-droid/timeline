# Option C: Signal Horizon

Phase: coded design-lab direction only
Production status: not selected and not shipped
Implementation evidence: `src/components/design-lab/timeline/options/option-c.tsx` and `option-c.module.css`

## Intent

Signal Horizon optimises for a distinctive but restrained reading of movement through time. Near work receives more structural room than distant work. The layout expresses relative direction, never schedule precision.

Its central proposition is that a viewer can understand current position and horizon through spatial hierarchy while retaining the canonical written ladder.

## Structural signature

- Now, Soon, and Later form a bounded horizon whose relative width communicates nearness.
- Done and Refused remain calm archive bands in the same plan, not hidden routes.
- The owner view adds a planning rail on wide screens for the selected item's facts and controls.
- The public view preserves the horizon without paths, nodes, gradients, glass, glow, or Gantt geometry.
- The shared update makes before-and-after direction shifts the central visual record.
- Item detail uses a narrative body and an inspector rail. Mobile reflows into canonical document order.

The content remains anchored to the design-system container. Extra browser width creates quiet margins, not a wider planning canvas.

## Four-surface composition

| Surface | Composition | Primary question answered |
| --- | --- | --- |
| Owner plan | Weighted horizon, archive bands, and contextual planning rail. | Where is the item now, and how does moving it change the direction? |
| Public timeline | Purpose and publication receipt over the active horizon and settled records. | What is close, what follows, and what has been decided? |
| Shared update | Direction-shift records with Before, Now, reason, date, current work, and coming-up work. | How did the direction move? |
| Item detail | Public narrative and history beside an inspector of bucket, timing, confidence, and update date. | Where does this item sit in the wider direction? |

Every surface uses the shared public projection. Spatial emphasis does not alter item facts or bucket membership.

## Interaction position

The planning rail gives selected-item controls a stable wide-screen home. On smaller frames it becomes ordinary document flow so no control depends on a sticky sidebar or precise pointer input. The common owner controller supplies explicit move, reorder, refusal, visibility, deletion, recovery, and publication actions.

The Phase 1 lab demonstrates a bounded spatial composition. It does not implement a schedule engine, dependency graph, zoomable canvas, or production animation system.

## Strengths to test

- Most distinctive Signal Studio expression without adding ornamental graphics.
- Makes the relationship between current work and future direction visible at a glance.
- Before-and-after update records give movement a clear visual grammar.
- A stable planning rail can keep owner controls powerful without repeating them on every item.
- Archive bands keep Done and Refused inside the same direction object.

## Tradeoffs and red-team risks

- Highest responsive and implementation complexity of the three options.
- Unequal width can be misread as effort, certainty, or duration unless copy and proportions remain disciplined.
- The planning rail must not dominate the plan or become a dashboard column.
- Dense Soon or Later sections can challenge the intended spatial balance.
- Mobile must be assessed as a first-class linear document, not a compressed desktop horizon.

## Phase 2 boundary

Selection of this option would approve a relative-horizon hierarchy, not Gantt behaviour or schedule precision. Production work would still need canonical data mapping, durable publication snapshots, a strict server projection, public link and source tracking verification, production focus restoration, performance proof with real data, and a motion pass tied to actual state changes.

No production route, database record, publish action, or public URL is changed by this option.
