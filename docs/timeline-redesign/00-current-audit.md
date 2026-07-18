# Signal Timeline redesign: current audit

Audit date: 2026-07-18
Scope: owner plan, public timeline, shared update, item detail, and their publication boundary
Phase: design-lab audit only. This document does not claim that proposed behaviour is shipped.

## Evidence language

- **Confirmed** means the behaviour or rule is directly present in the current repository or a canonical product document.
- **Inferred** means the conclusion follows from confirmed implementation evidence but is not itself an explicit product decision.
- **Proposed** means a design-lab contract to test before any production-route replacement.

## Executive finding

**Confirmed:** Signal Timeline already has the four required product surfaces, an owner curation view, Tasks milestone sync, manual milestones, public workspace and project pages, item details, refusals, a shared update, and a separately frozen Audience Timeline publication path.

**Confirmed:** Those surfaces do not yet read one consistent direction object. The owner plan primarily edits effective milestone overlays, while public workspace, public project, shared update, and detail routes each assemble their view from different combinations of tasks, projects, overlays, and derived summaries.

**Inferred:** The product has capable parts but not yet one legible publishing system. A person can change what the owner sees without receiving a reliable guarantee that the same wording, bucket, reason, and visibility will appear across every public surface.

**Proposed:** The design lab should test a single working plan, an explicit published snapshot, and a strict public projection shared by public timeline, shared update, and item detail. Production data and routes remain unchanged until a direction is selected.

## Locked product constraints

| Constraint | Status | Evidence |
| --- | --- | --- |
| Signal Timeline delivers direction clarity. | Confirmed | `docs/PRODUCT.md` |
| The primary product surface is public and readable without an account. | Confirmed | `docs/PRODUCT.md` |
| The public ladder is `Now / Soon / Later / Done / Refused`. | Confirmed | `docs/PRODUCT.md` |
| `Waiting on you / Underway / Coming up / Done` are secondary states, used sparingly. | Confirmed | `docs/PRODUCT.md` |
| `Waiting on you` is the only secondary state that earns strong colour. | Confirmed | `docs/PRODUCT.md` |
| A refusal is a dated decision, without apology. | Confirmed | `docs/PRODUCT.md` |
| Audience Timelines are a separate frozen publication boundary, not private Timeline workspaces. | Confirmed | `docs/PRODUCT.md`, `src/server/audience-timeline.ts` |
| No private workspaces, team tier, comments, public directory, all-in-one framing, or engineering-team framing in v1. | Confirmed | `docs/PRODUCT.md` |
| The collaboration loop must answer where this is going, what changed, and what is next. | Confirmed | `docs/COLLABORATION_LOOP.md` |
| Shared outputs should expose change reasons, confidence language, and a practical next step. | Confirmed | `docs/COLLABORATION_LOOP.md` |

## Current architecture by surface

| Surface | Current source | Confirmed behaviour | Continuity gap |
| --- | --- | --- | --- |
| Owner plan | `getEffectiveNodesForWorkspace()` plus `nodeOverlays` | Owner can sync milestones, add manual milestones, change label, lane, date, visibility, and order. | Owner ladder is `Next / In flight / Shipped / Later`, not the locked public ladder. Overlay edits are milestone-oriented and are not consumed uniformly by downstream routes. |
| Public workspace | Workspace, projects, raw tasks, and a partial effective-node merge | Bare workspace URL defaults to Gantt. Manual milestone overlays are fabricated into task-shaped records for some workspace render paths. | Raw tasks remain a parallel source. Public presentation can differ from owner curation and does not represent a frozen publication. |
| Public project | `getTasksForProject()` | Renders raw project tasks, counts, attention state, and milestones. | Does not use the owner plan's effective-node projection. It exposes legacy status concepts such as `Next` and `Needs attention`. |
| Shared update | Raw tasks and a separately derived update summary | Shows current state, Now, Needs attention, Next, progress, and source-tracking query parameters. | Vocabulary and grouping differ from both the owner plan and locked public ladder. It is derived independently instead of from one published direction record. |
| Item detail | `getTask()` and generic activity | Shows one raw task, status pill, description, date, and history. | Manual milestones redirect to in-page anchors. Status labels include `To do`, `Doing`, and `Dropped`; history does not form a clear decision record. |
| Refusals | `getRefusedTasks()` | Has a dedicated public route with workspace publication checks. | `Dropped` remains in component copy, while the canonical product word is `Refused`. Reason and decision date are not enforced as a complete public record. |
| Audience Timeline | Selected frozen projection with bearer token lifecycle | Preview, publish, rotate, revoke, and unpublish are distinct from legacy public workspaces. Later source edits are reviewable rather than auto-published. | This stronger publication model is separate from the four legacy Timeline surfaces and should not be conflated with them. |

## Source-backed findings

### P0: owner edits are not one shared fact

**Confirmed:** `upsertNodeOverlayAction()` writes owner overlay changes and revalidates the private plan route only (`src/server/actions/workspaces.ts:310-329`). `reorderNodesAction()` follows the same private-only revalidation rule (`src/server/actions/workspaces.ts:351-375`).

**Confirmed:** `getEffectiveNodesForWorkspace()` says overlay fields win for the owner and public node list, but it only builds effective milestone nodes and retains the legacy display lanes (`src/server/db/queries.ts:715-749`). The public workspace separately reads all tasks and merges selected manual milestones (`src/app/[workspaceSlug]/page.tsx:316-432`). Public project and item detail routes read raw task records (`src/app/[workspaceSlug]/[projectSlug]/page.tsx:90-108`, `src/server/db/queries.ts:920-940`).

**Inferred:** There is no single object whose public label, bucket, visibility, reason, and order are guaranteed to match across owner plan, public timeline, shared update, and item detail.

### P0: publication is a visibility gate, not a content snapshot

**Confirmed:** Publishing sets `publishedAt` across projects and invalidates the public subtree (`src/server/actions/workspaces.ts:390-432`, `src/server/db/queries.ts:310-327`). Public pages then query current project, task, and overlay tables.

**Confirmed:** Sync and curation actions deliberately avoid public revalidation, which is a useful two-step control. The database model still does not persist an immutable published copy for legacy workspace URLs.

**Inferred:** Cache invalidation reduces accidental immediate change, but it is not a durable draft-versus-published boundary. The published page is not reproducible as a versioned snapshot after the underlying records change.

### P0: public language is fragmented

**Confirmed:** The owner plan uses `Next / In flight / Shipped / Later` (`curation-surface.tsx:28`). The public workspace defaults to `Gantt` (`workspace-view-switcher.tsx:7-10`). The shared update uses `Now / Needs attention / Next` (`update/page.tsx:130-178`). Detail components map statuses to `To do`, `Doing`, and `Dropped` (`activity-panel.tsx:14-18`, `status-pill.tsx:19-35`).

**Confirmed:** The canonical primary ladder is `Now / Soon / Later / Done / Refused`, and legacy status vocabulary must not appear in public copy.

**Inferred:** A viewer must learn the page they are on instead of learning one Signal Timeline grammar.

### P0: there is no strict public data-transfer boundary

**Confirmed:** The public routes query database `Task`, `Project`, and `Workspace` records directly and shape them inside page components. Audience Timelines use an explicit frozen projection, but legacy public routes do not share one strict public DTO.

**Inferred:** Direct entity reads increase the chance that a future owner-only field is rendered or serialized accidentally. A whitelist projection is safer than relying on every surface to remember exclusions.

### P1: owner interaction is pointer-led and recovery is incomplete

**Confirmed:** Reordering is implemented through drag and pointer-drop handlers. Lane choice is rendered as repeated custom radio controls. The manual-add flow accepts title, lane, and date. Hidden rows are dimmed in the owner surface.

**Confirmed:** The current surface has no complete keyboard move-and-reorder path, no required reason on cross-bucket movement, no dedicated hidden-item recovery drawer, and no explicit unpublished-change count.

**Inferred:** The owner can curate quickly with a pointer, but the system does not yet make consequential changes explainable, reversible, and keyboard-equivalent.

### P1: refusals are visually present but not yet decision-complete

**Confirmed:** Refused tasks have a dedicated route and are excluded from active-task progress. Component copy also renders `Dropped` and strikes through refused items.

**Confirmed:** The canonical contract requires `Refused`, a date, and a calm decision record.

**Inferred:** Strikethrough and a status label communicate removal, not the reasoned decision viewers need.

### P1: shared update is a dashboard, not yet a forwardable change note

**Confirmed:** The update page independently derives current state, three status columns, a next clear step, project progress, counts, and percentage bars.

**Inferred:** The page contains useful facts but gives equal visual weight to metrics and direction. A forwardable update should lead with what changed, why, and what happens next.

### P1: responsive and accessibility gaps block parity

**Confirmed from source and baseline inspection:**

- The owner drag surface does not expose a complete semantic sortable-list model or keyboard alternative.
- Custom lane radios place every option in the tab order rather than using roving radio behaviour.
- Inline title editing lacks a durable visible label and removes the default outline.
- Several small icon-only or compact controls fall below a comfortable touch target.
- The public mobile header hides links that remain available on desktop.
- Gantt content relies on horizontal scrolling and lacks equivalent list semantics.
- Detail history can render without a clear section heading or meaningful empty-state action.
- There is no product-specific print treatment for the primary shared outputs.

**Inferred:** The current responsive layouts compress content, but do not always preserve the same wayfinding and actions. Mobile and keyboard users receive a reduced product, not merely a reflowed one.

### P2: visual hierarchy spends emphasis on containers and metrics

**Confirmed from baseline inspection:**

- Owner rows repeat borders and controls at high density.
- Public workspace combines a hero, coloured statistics, a view switcher, progress graphics, and row content.
- Shared update uses repeated cards, equal columns, a percentage bar, and a long mobile stack.
- Item detail is comparatively sparse but uses several status treatments and leaves history underdeveloped.

**Inferred:** The strongest visual moments currently describe application structure and progress accounting. They should instead identify the current direction, the one action that needs presence, or the most important recent change.

## Design-system and brand audit

**Confirmed:** The repository vendors Signal Design System tokens in `src/ds/tokens.css`. The token values match the current semantic system even though the vendored header names an older package version.

The redesign must preserve these confirmed rules:

- Geist and Geist Mono only, with weights 400, 500, and 600.
- White paper, near-black ink, and hairlines for ordinary separation.
- Product CSS consumes semantic tokens. Product-local tokens use the `--x-` prefix.
- One earned indigo moment per view. Indigo is not a generic active-navigation or primary-button colour.
- In-product hierarchy stops at `--text-section`.
- The content container is at most `--container`.
- Cards do not nest. Ordinary cards do not use shadows.
- Motion uses the existing duration and easing tokens, affects transform or opacity, and respects reduced motion.
- Public copy is plain English, sentence case, specific, and free of project-management jargon.
- No gradients, glass effects, glow, ornamental diagrams, or decorative status colour systems.

## What Phase 1 must prove

The design lab should be considered successful only if it can demonstrate all of the following without touching production routes or production data:

1. One fixture plan drives owner plan, public timeline, shared update, and item detail.
2. Owner changes appear consistently in a clearly labelled working preview.
3. The last published snapshot remains independently inspectable until Publish is invoked.
4. Public projection excludes every owner-only field by construction.
5. Every surface uses the locked primary and secondary vocabulary.
6. A refusal includes a reason and date, and can be reversed safely in the owner working copy.
7. Move, reorder, edit, hide, restore, and publish flows have keyboard-equivalent paths and visible outcomes.
8. The three options remain structurally distinct in grayscale and at every required viewport.
9. Empty, loading, error, read-only, unpublished, and recently changed states are deliberate, not incidental.
10. Public and update surfaces remain readable when printed or forwarded as screenshots.

Production replacement remains a separate decision after selection and implementation planning.
