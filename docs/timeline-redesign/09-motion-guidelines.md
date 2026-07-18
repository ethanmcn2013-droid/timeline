# Timeline motion guidelines

Scope: owner plan, public timeline, shared update, item detail, and design-lab states
Status: proposed interaction contract; Phase 1 contains only restrained examples

## Purpose

Motion may explain a state change, preserve continuity, or show that context opened. It must not decorate the plan, imply live progress, create urgency, or carry information that is absent from text and structure.

The default Timeline experience should still feel complete when every duration is zero.

## Design-system contract

- Use only `--motion-instant`, `--motion-fast`, `--motion-base`, and `--motion-slow`.
- Use `--ease-out` for arrival and direct manipulation; use `--ease-in-out` only for a deliberate paired transition.
- Animate only `transform` and `opacity`.
- Do not animate layout dimensions, colour, blur, shadow, paths, counters, or progress bars.
- Do not introduce product-local duration or easing values.
- A transition must end with the same semantic state exposed to keyboard and assistive technology users.

## Event guidance

| Event | Standard response | Reduced-motion response |
| --- | --- | --- |
| Row selection | Immediate selection; contextual tools may settle with a short opacity change. | Immediate content change. |
| Move between buckets | Keep focus on the moved item; an optional short transform may connect old and new positions. Announce the new bucket. | Immediate placement and the same live announcement. |
| Reorder | Optional short positional transform; announce new position and total. | Immediate order change and announcement. |
| Context or archive disclosure | A small disclosure indicator may rotate using `--motion-fast`. | Indicator changes immediately with no transition. |
| Item detail opening | Context may enter with `--motion-base` opacity and transform if focus and reading order remain stable. | Immediate detail with identical focus destination. |
| Publish | Keep button geometry stable, change its label, then announce the published revision. | Same label and announcement without animation. |
| Loading fixture | A restrained opacity pulse may indicate unresolved loading. | Static skeleton with `aria-busy` and readable hidden status. |
| Error, empty, read only | No entrance theatre. State and recovery action appear immediately. | Identical. |

## Option-specific restraint

- Option A may animate only its disclosure indicator and simulated loading mark. The ledger itself should not drift or spring.
- Option B relies on editorial continuity and should generally use no visible motion beyond focus, disclosure, and state feedback.
- Option C may use short press, selection, and context transitions to support the horizon relationship. It must not animate paths, nodes, continuous movement, or temporal flow.

No option should pulse `Waiting on you`, Refused, or the current bucket. Strong state presence comes from hierarchy and copy, not ambient animation.

## Focus and announcement rules

1. A moved or reordered item retains programmatic focus.
2. Opening context never sends focus to the document start without a navigation reason.
3. A live region names the item, resulting bucket or position, and publication outcome.
4. Animation completion is never required before a control becomes operable.
5. Pointer, keyboard, and touch actions receive the same final state and message.

## Performance and testing

Motion must remain compositor-friendly and must not create horizontal overflow or layout shift. Test each implemented transition with normal motion and `prefers-reduced-motion: reduce`, then verify keyboard focus after move, reorder, disclosure, detail navigation, and publish.

Phase 1 currently demonstrates restrained disclosure, loading, selection, and press treatments. It does not claim a complete production cross-bucket animation system. Any selected direction needs a final motion pass against real data and production focus management before launch.
