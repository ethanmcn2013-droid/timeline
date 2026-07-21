# Signal Timeline redesign: state matrix

This matrix is the implementation and review checklist for the isolated design lab. All entries marked **Proposed** are fixture behaviours, not production claims.

## Selector contract

| Dimension | Values | Default |
| --- | --- | --- |
| Option | `a`, `b`, `c` | `a` |
| Surface | `owner`, `public`, `update`, `detail` | `owner` |
| Dataset | `wedding`, `freelance`, `small-business`, `edge` | `wedding` |
| Density | `sparse`, `normal`, `dense` | `normal` |
| State | `default`, `empty`, `loading`, `error`, `read-only`, `unpublished`, `recently-changed` | `default` |
| Viewport frame | `mobile`, `tablet`, `desktop` | `desktop` |
| Projection preview | `working`, `published` | `working` in owner review; `published` otherwise |
| Detail item | Public fixture item id | Dataset's first Now item |

**Proposed:** Every selector is represented in the query string so a reviewer can copy an exact state. Invalid values fall back to defaults and are normalized in the URL.

## Core surface-state matrix

| State | Owner plan | Public timeline | Shared update | Item detail |
| --- | --- | --- | --- | --- |
| Default | Working plan with readable buckets, selection, contextual edit tools, and publication receipt. | Published fixture plan in canonical bucket order. | Latest meaningful change, reason, current direction, and next step. | Selected public item's current fact set and change record. |
| Empty | One explanation, one primary `Add an item` action, and a quiet Tasks connection note. | Plan title, publication receipt, and `Nothing has been published here yet.` | `No update has been published yet.` with a route back to the plan. | Not-found treatment because no public item exists. |
| Loading | Stable skeleton rows matching the option's structure; owner controls disabled; no fake content flash. | Stable semantic skeleton with title retained where possible. | Headline and change blocks represented by restrained skeleton lines. | Detail title region and facts region represented without a spinner-only page. |
| Error | Preserve fixture controls and working state; explain that this is a simulated load failure; `Try again`. | Calm public failure with retry and no owner language. | Calm update failure with retry and route to public plan. | Calm detail failure with retry and route to public plan. |
| Read-only | Entire plan remains readable; edit controls disabled with `Reviewing a read-only copy.` | Same as default published view. | Same as default published view. | Same as default published view. |
| Unpublished | Persistent `N unpublished changes` receipt; working preview selected; Publish is available. | `Working preview · not published` strip and working projection. A published-view switch remains available. | Same working-preview strip; changed facts match the owner plan. | Same working-preview strip; selected item matches the working projection. |
| Recently changed | Changed row receives the option's one earned emphasis and a plain change receipt. | Latest moved item is identifiable without animation dependence. | Change record leads with before, after, reason, and date. | Change history starts with the same public-safe record. |

## Dataset matrix

| Dataset | Purpose | Required content | Edge being tested |
| --- | --- | --- | --- |
| Wedding | Primary collaboration proof path | A venue decision, one `Waiting on you` action, Now/Soon/Later items, Done receipt, dated refusal, and a recent movement reason. | A plan forwarded among a couple, venue, planner, and supplier without product context. |
| Freelance | Solo service operator | Client review, current deliverable, invoice or handoff milestone, uncertain date language, and one refused scope request. | Public clarity without exposing owner notes or internal client management detail. |
| Small business | Multi-stream public direction | Several active items, a dense Soon section, completed work, dependencies expressed in plain language, and one hidden synced item. | Scanability under realistic volume and restoration of hidden work. |
| Edge | Robustness and safety | Very long title, long unbroken text, missing optional dates, identical sort orders, no Now items, multiple refusals, sensitive owner-note sentinel, and one unavailable detail id. | Overflow, deterministic ordering, projection safety, empty subsection handling, and not-found behaviour. |

All fixture content must be deterministic. Dates use fixed ISO values and are formatted consistently; they must not depend on the machine clock.

## Density matrix

| Density | Fixture shape | Owner expectation | Public expectation |
| --- | --- | --- | --- |
| Sparse | 3 to 5 visible items, at most one per active bucket. | Contextual controls should not make the surface feel empty or oversized. | Direction remains immediately understandable without filler metrics. |
| Normal | 8 to 12 visible items distributed across all five buckets. | Default review density. Selection and unpublished changes remain easy to locate. | Balanced evidence for all four surfaces and all options. |
| Dense | 24 or more visible items, including 8 or more in one bucket. | Reorder and move controls remain usable; sticky or summary regions do not cover content. | Headings, indexes, and archive treatment preserve scanability without card grids or status colour. |

**Proposed:** Density changes fixture quantity, not typography scale. The design may reduce vertical spacing through semantic tokens, but may not shrink text below the design-system step chosen for that content.

## Viewport matrix

| Browser width | Lab frame | Required evidence |
| --- | --- | --- |
| 390 px | Mobile | No horizontal dependency; canonical bucket order; all primary navigation and owner actions remain reachable; detail is full page. |
| 768 px | Tablet | Touch-safe editing; no clipped labels; option structure remains recognizable; public output keeps readable line length. |
| 1280 px | Desktop | Default desktop composition and complete owner workflow. |
| 1440 px | Desktop | Content remains anchored within the design-system container. |
| 1728 px | Desktop | No uncontrolled stretch, inflated headings, or decorative emptiness. |
| 1920 px | Desktop | Whitespace remains intentional and the earned emphasis remains singular. |

The in-lab viewport frame is a review convenience. Browser screenshots at the actual six widths are still required because a framed desktop page does not prove browser-level responsiveness.

## Primary and secondary state rendering

| State | Public label | Required treatment | Forbidden treatment |
| --- | --- | --- | --- |
| `now` | Now | Highest structural priority; current direction is clear from placement and type. | A generic indigo column, urgency red, or pulsing animation. |
| `soon` | Soon | Clearly next in reading order; less spatial priority than Now. | `Next` as a primary public label. |
| `later` | Later | Quiet, still readable, and not visually discarded. | Extreme opacity reduction or hidden overflow. |
| `done` | Done | Settled archive receipt, available without dominating active direction. | A progress-celebration graphic or bright success field. |
| `refused` | Refused | Neutral dated decision with reason. | `Dropped`, error red, trash metaphors, or reasonless strikethrough. |
| `waiting-on-you` | Waiting on you | The one secondary state allowed strong functional presence. | More than two simultaneous high-presence calls in the primary wedding example. |
| `underway` | Underway | Quiet text or dot support inside the bucket. | A second accent system. |
| `coming-up` | Coming up | Quiet text or ring support inside the bucket. | A new lane. |
| secondary `done` | Done | Quiet settled marker where the primary bucket alone is insufficient. | Redundant repetition on every Done item. |

## Option-by-surface structure

| Option | Owner plan | Public timeline | Shared update | Item detail |
| --- | --- | --- | --- | --- |
| A. Quiet Direction Ledger | Ruled ledger with selected-row context controls, low-chrome reorder, and a recovery section. | Same ledger facts with all editing removed and archives separated by rules. | Change ledger ordered `Changed / Why / Next`. | Focused side sheet on desktop, full-page reading order on mobile. |
| B. Editorial Plan Room | Asymmetric working plan with a decision and change margin. | Briefing composition with a lead Now item, Soon and Later index, then closing Done and Refused records. | Forwardable article led by one change and its reason. | Wide narrative and facts layout, approximately 8/4 on desktop and linear on mobile. |
| C. Signal Horizon | Now, Soon, and Later fields use spatial width, with a compact evidence rail and archive bands. | Temporal distance is communicated through width and whitespace, not a Gantt or path diagram. | Before-and-after movement is the central composition, supported by the current horizon. | Inspector-style desktop view, full page on mobile, with canonical DOM order. |

Shared state logic may be reused. The three options may not share one generic lane or card component with different CSS skins.

## Owner interaction matrix

| Operation | Synced item | Manual item | Keyboard requirement | Recovery and feedback |
| --- | --- | --- | --- | --- |
| Select | Yes | Yes | Tab to item action, Enter or Space to select. | Selected item is named and visually evident without colour alone. |
| Edit public title | Override only | Direct working value | Labelled text field; Escape cancels; Enter or explicit Save confirms. | Save result announced; public working preview updates from the same state. |
| Edit date or date language | Override only | Direct working value | Native controls and labelled fields. | Clear date is explicit; save result announced. |
| Move bucket | Overlay or working override | Direct working value | `Move to` control operable without drag. | Cross-bucket move creates a change record; focus remains on moved item. |
| Reorder in bucket | Working sort order | Working sort order | `Move earlier` and `Move later`. | Live region announces new position and total. |
| Refuse | Working override | Direct working value | Fully operable form with reason and date. | Missing requirements block completion; successful move is reversible. |
| Hide | Hide from public projection | Hide from public projection | Plain `Hide from public plan` action. | Undo available; item remains in owner recovery area. |
| Restore | Yes | Yes | Recovery list fully keyboard operable. | Restored item returns to its previous bucket and public working preview. |
| Delete | Not allowed; direct owner to Signal Tasks or Hide. | Confirmed delete only. | Confirmation has safe focus order and Cancel default. | Undo restores the manual item during the lab session. |
| Publish | Whole working plan | Whole working plan | Standard button and confirmation summary, no drag. | Snapshot version, timestamp, and `0 unpublished changes` receipt update. |
| Share | Public projection only | Public projection only | Copy action is keyboard operable. | Copy status announced; lab-only or fixture status stays explicit. |

## Publication-preview matrix

| Condition | `preview=working` | `preview=published` |
| --- | --- | --- |
| No unpublished changes | Facts match the snapshot; owner still sees working context. | Standard fixture publication receipt. |
| Unpublished changes | Persistent non-public preview label on all four surfaces. | Previous snapshot remains unchanged and clearly dated. |
| Newly hidden item | Absent from working public, update, and detail projections. | Remains present until Publish because the previous snapshot is immutable. |
| Newly refused item | Appears only after valid reason and date. | Previous bucket remains until Publish. |
| Publish invoked | Becomes identical to new projected snapshot. | New version and time receipt; all public surfaces update together. |
| Reload | Returns to deterministic baseline. | Returns to deterministic baseline snapshot. |

## Loading and motion matrix

| Event | Visual response | Accessibility response |
| --- | --- | --- |
| Surface change | Immediate content swap or a short opacity transition using semantic motion tokens. | New surface heading receives programmatic focus only when navigation semantics require it. |
| Item selection | Context region appears without layout-jumping the selected row. | Region has a heading linked to the selected item. |
| Move or reorder | Optional short transform or opacity response. | Polite live announcement includes title, bucket, and position. |
| Publish | Button pending label and stable layout; no spinner-only control. | Pending and completion states announced. |
| Simulated loading | Skeletons preserve final geometry; no shimmer dependency. | Busy region has an accessible label; hidden skeleton decoration is ignored. |
| Reduced motion | No transform animation; state changes remain immediate and legible. | No information is lost. |

## Print matrix

| Surface | Printed content | Removed content |
| --- | --- | --- |
| Owner | Not a primary print target; if printed, working or published status must be explicit. | Editing controls, drag handles, lab selector chrome. |
| Public | Title, introduction, publication date, all visible buckets, reasons, dates, and provenance. | Navigation chrome, copy buttons, sticky controls. |
| Update | Update title/date, what changed, why, current direction, next step, action needed, and provenance. | Navigation chrome, copy buttons, interactive selectors. |
| Detail | Item title, bucket, public summary, target, confidence, next step, and public-safe change record. | Back-button chrome and owner controls. |

## Cross-surface invariants

For each dataset, density, option, and projection preview:

- [ ] Public title matches across public timeline, shared update, and item detail.
- [ ] Bucket and secondary state match across all surfaces.
- [ ] Date language and next step match wherever they appear.
- [ ] Hidden items are absent from every public surface and detail lookup.
- [ ] Owner-only sentinel text is absent from rendered public text and serialized public data.
- [ ] Refused items have the same reason and date everywhere.
- [ ] Working preview is marked as not published on every public-facing surface.
- [ ] Published view remains unchanged before Publish.
- [ ] Done and Refused are reachable at every viewport.
- [ ] Empty subsections are omitted or explained consistently, never replaced by false metrics.
- [ ] No legacy public ladder terms appear.
- [ ] One earned indigo moment remains visually dominant.
- [ ] Heading order and landmarks remain valid after responsive reflow.
- [ ] All owner actions have a keyboard route and visible focus.
- [ ] All meaningful information remains available with colour and motion removed.
- [ ] Public and update outputs remain coherent in print preview.

## Review coverage requirement

At minimum, capture and inspect all 72 primary combinations:

```text
3 options × 4 surfaces × 6 browser widths = 72 screenshots
```

Add targeted evidence for:

- all seven named states;
- all four datasets;
- all three densities;
- both working and published projections;
- one successful keyboard reorder;
- one cross-bucket move with reason;
- one refusal validation failure and success;
- one hide, restore, manual delete, and undo sequence;
- one publish sequence;
- reduced-motion and print output;
- the owner-only sentinel absence check.

The review is incomplete if only the default wedding dataset at desktop width is visually polished.
