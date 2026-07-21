# Signal Timeline redesign: design principles

These principles govern the isolated Timeline design lab. They translate the confirmed product, collaboration, design-system, brand, accessibility, and publication constraints into testable design decisions.

## 1. One plan, four truthful readings

**Confirmed:** Timeline is responsible for direction clarity and shareable output.

**Proposed:** Owner plan, public timeline, shared update, and item detail use one stateful plan contract. The surfaces may have different composition and emphasis, but they must not invent different labels, dates, buckets, visibility, reasons, or confidence statements.

Rule: reuse facts, not containers.

## 2. Time is the primary grammar

**Confirmed:** The primary ladder is `Now / Soon / Later / Done / Refused`.

**Proposed:** Every option makes time buckets the first scan path. Secondary state appears only where it resolves a practical question. `Waiting on you` is the sole high-presence state; `Underway`, `Coming up`, and `Done` remain quiet.

The lab must not use `Gantt`, `Next`, `In flight`, `Shipped`, `Doing`, `To do`, `Dropped`, `Blocked`, or `Needs attention` as a public primary ladder.

## 3. Direction outranks task administration

**Confirmed:** Viewers should understand where the work is going without learning project-management vocabulary.

**Proposed:** The first screen answers, in order:

1. What is happening now?
2. Does anyone need to act?
3. What changed and why?
4. What comes next?
5. What has been completed or explicitly refused?

Counts and percentages are supporting receipts only. They never lead the page or substitute for a written claim.

## 4. Publish a snapshot, not a cache state

**Inferred from the audit:** A durable draft-versus-published boundary is necessary for viewer trust.

**Proposed:** The owner edits a working plan. Public, update, and detail surfaces can inspect either:

- **Working preview:** explicitly marked as unpublished and visible only inside the lab review context.
- **Published view:** derived from the last immutable fixture snapshot.

Publish replaces the fixture snapshot with a public projection of the working plan and records when it happened. Reload resets all lab mutations. This is a proposal for evaluation, not a production publishing claim.

## 5. A move should explain itself

**Confirmed:** The collaboration contract calls for what changed and why.

**Proposed:** Reordering inside a bucket is low consequence and should be quick. Moving an item between buckets creates a change record. The owner can add a concise reason inline. Moving to `Refused` requires a reason and date before completion.

Change language stays concrete: previous bucket, new bucket, reason, date, and next step when relevant.

## 6. Refusal is a calm, first-class decision

**Confirmed:** `Refused` belongs in the primary ladder and is dated without apology.

**Proposed:** Refused work is not red error chrome, faded trash, or a euphemistic `Dropped` state. It has a neutral archive treatment, a readable decision reason, and a date. Owners can reverse a refusal in the working plan without erasing its history.

## 7. Public safety is a type-level property

**Inferred from the audit:** Page-by-page omission is too fragile for owner-only information.

**Proposed:** Every public surface consumes a strict whitelisted projection. Owner notes, internal source identifiers, unpublished fields, and editing metadata never enter the public object. Tests should fail if a sensitive fixture string appears in serialized public data.

## 8. One earned indigo moment

**Confirmed:** The Signal design system permits one earned indigo moment per view.

**Proposed:** Indigo identifies one current or consequential fact, such as the selected owner row, the current-position marker, or the one `Waiting on you` action. It does not colour every active tab, button, lane, or metric.

Primary owner actions use ink. Focus rings may use transient indigo because they are an accessibility state, not a competing visual moment.

## 9. Structure, not decoration, distinguishes the options

The options must still be identifiable when colour is removed.

### A. Quiet Direction Ledger

**Proposed structure:** A vertical ruled ledger. Rows and section rules do the organisational work. The owner selects and edits within the ledger; the public plan removes editing chrome; the shared update becomes a change ledger; item detail opens as a focused sheet or full page on small screens.

Avoid columns made to look like cards, repeated coloured badges, and ornamental timelines.

### B. Editorial Plan Room

**Proposed structure:** An asymmetric edited plan with a decision margin. The public surface reads like a concise briefing: one lead Now item, a restrained Soon and Later index, then Done and Refused as closing records. The update is a forwardable article. Detail is a wide narrative-and-facts layout.

Avoid marketing-page theatre, oversized display headings, and magazine decoration that reduces operational clarity.

### C. Signal Horizon

**Proposed structure:** A spatial horizon where width and whitespace communicate temporal distance. On desktop, Now receives the broadest field, Soon and Later progressively less, with a compact evidence rail. Done and Refused are archive bands. Mobile uses canonical document order rather than horizontal compression.

Avoid path drawings, node diagrams, gradients, false precision, and a scroll-dependent Gantt.

## 10. Owner power appears progressively

**Proposed:** The default owner view keeps the plan readable. Row selection reveals contextual editing. Consequential actions use plain labels. Advanced controls do not repeat at full prominence on every row.

Required owner operations:

- Add a manual item.
- Edit public wording and date.
- Move between time buckets.
- Reorder inside a bucket.
- Add or revise a movement reason.
- Refuse with a required date and reason.
- Hide a synced item from the public projection.
- Restore a hidden item from a recovery area.
- Delete a manual item with confirmation and undo.
- Inspect unpublished changes.
- Publish the working plan.
- Copy or inspect a share link without implying production publication.

## 11. Keyboard, touch, and pointer are peers

**Proposed:** Drag can remain a convenience, never the only method.

- Every item has an accessible name that includes its title and bucket.
- `Move to` changes bucket through a native select or menu with predictable keyboard behaviour.
- `Move earlier` and `Move later` reorder within the current bucket.
- Results are announced through a polite live region.
- Focus returns to the moved item or the control that opened the action.
- Touch targets are at least 44 by 44 CSS pixels where space allows, and never depend on precision dragging.
- Visible focus is never removed without an equivalent replacement.
- Loading, error, save, undo, and publish outcomes are announced without moving focus unexpectedly.

## 12. Responsive means equal meaning

**Proposed:** All viewports keep the same facts, wayfinding, and primary actions. Layout may change, but product capability must not disappear.

| Width | Required behaviour |
| --- | --- |
| 390 px | Single canonical document order, full public navigation, full-page detail, no horizontal dependency. |
| 768 px | Tablet reflow with readable line lengths and touch-safe owner controls. |
| 1280 px | Default desktop composition for all options. |
| 1440 px | Deliberate use of whitespace within the 1120 px content contract. |
| 1728 px | No uncontrolled stretching or oversized in-product typography. |
| 1920 px | Composition remains anchored and calm, with no empty decorative acreage. |

## 13. Shared output should survive forwarding

**Confirmed:** Timeline owns a shareable output moment.

**Proposed:** Public timeline and shared update must make sense when opened without prior context, copied as a link, printed, or captured as a screenshot. Each includes the plan name, publication state, current direction, practical next step, change date, and restrained Signal Studio provenance.

Print rules remove owner controls, lab controls, sticky chrome, and interaction-only affordances. Content order and reasons remain intact.

## 14. Copy is plain, specific, and honest

**Confirmed:** Signal copy avoids project-management jargon and unsupported claims.

**Proposed copy rules:**

- Use sentence case and ordinary verbs.
- Prefer `Moved to Soon because the venue needs the final guest count` over `Timeline adjusted`.
- Use `Not published` and `Published 18 July 2026`, not ambiguous save language.
- Mark lab-only capability as `Review prototype` or `Proposed behaviour`.
- Do not describe the lab as live, secure, private, synced, or published to production.
- Do not use em dashes in public-facing strings.
- Do not use the internal quality ambition as user-facing copy.

## 15. Design-system application is exact

| Area | Required rule |
| --- | --- |
| Type | Geist and Geist Mono; weights 400, 500, 600 only; in-product headings no larger than `--text-section`. |
| Colour | Semantic tokens only; white paper and ink lead; one earned accent moment; functional state tokens only when meaning requires them. |
| Spacing | Existing base-4 semantic scale and `--container`; no ad hoc local spacing scale. |
| Borders | Hairlines separate ordinary regions; no nested-card borders. |
| Radius | Existing 4, 6, 10, and pill tokens only. Pills are reserved for compact state, not generic containers. |
| Elevation | No shadow on ordinary cards or rows. Modal shadow only for an actual modal layer. |
| Motion | Existing 80, 140, 220, and 400 ms tokens; transform and opacity only; reduced-motion fallback. |
| Local tokens | Timeline-specific extensions use the `--x-` prefix and may not redefine foundation tokens. |

## Phase 1 quality gates

**Proposed acceptance:**

- The three options are structurally distinct at 390, 768, 1280, 1440, 1728, and 1920 px.
- Each option supports owner, public, update, and detail surfaces from one fixture plan.
- Every required dataset, density, and state is directly selectable and linkable.
- Working preview and published view never look identical when unpublished changes exist.
- No owner-only string appears in any public projection or rendered public surface.
- Public facts match across public timeline, shared update, and item detail.
- Refused items always show a reason and date publicly.
- All owner mutations have keyboard-operable paths and visible feedback.
- Heading order, landmarks, accessible names, focus order, and live updates pass manual inspection.
- Text and meaningful controls meet WCAG AA contrast.
- Reduced-motion and print treatments are present.
- No production route, database call, server action, or production data mutation is reachable from the lab.
- Screenshots and review URLs identify their exact option, surface, dataset, density, state, viewport, and projection source.

Selection of A, B, C, or a named hybrid is the gate before any production implementation plan.
