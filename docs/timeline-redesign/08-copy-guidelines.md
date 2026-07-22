# Timeline copy guidelines

Scope: owner plan, shared Timeline artefact, shared update, and item detail
Status: selected Option D language contract; production runtime evidence pending

## Voice

Timeline copy is calm, specific, and useful without product knowledge. It describes direction and decisions in ordinary language. It does not perform certainty, celebrate routine status changes, or teach project-management terminology.

- Use sentence case.
- Prefer a concrete verb and object.
- Keep headings short enough to scan.
- Use a reason when a direction changed.
- Use dates as receipts, not decoration.
- Do not use em dashes in user-facing strings.
- Do not expose the internal quality target or call a surface `world-class`.

## Canonical vocabulary

| Meaning | Use | Avoid |
| --- | --- | --- |
| Product | plan, direction, share link, update, decision | public listing, roadmap software, PM tool, all-in-one workspace |
| Primary time | Now, Soon, Later, Done, Refused | Next, In flight, Shipped, To do, Doing, Dropped |
| Secondary state | Waiting on you, Underway, Coming up, Done | Blocked, Needs attention, At risk |
| Change | moved, changed, restored, hidden from the public plan | transitioned, progressed, updated status |
| Publication | working plan, working preview, not published, published plan, revision | synced, live, saved, secure copy |
| Uncertainty | timing open, direction set, clear | 80% confidence, low risk, on track |
| People | owner, couple, venue, client, supplier, customer | stakeholder, resource, assignee |
| Line position | Our next milestone, Today, coming up, complete | Current, Now as a claim about today, active node |
| Time lens | Milestones complete, days remaining, days left | health score, confidence score, percent on track |
| Audience receipt | Timeline view, Timeline views | visitor, unique person, reach |

`Waiting on you` is used only when the reader can take a real action. It is not a general warning label.

## Core sentence patterns

### Purpose

Write one sentence that names the outcome and audience.

- Good: `A clear route from final guest count to a room-ready wedding day.`
- Avoid: `Track all milestones and optimise delivery across stakeholders.`

### Direction change

Use fact, reason, then next step.

- `Ceremony start moved from Soon to Now because the venue confirmed the access window.`
- `Next: share the revised arrival time with suppliers.`

Do not write `Timeline adjusted` or `Status updated` when a more specific statement is available.

### Refusal

Use the word `Refused`, a date, and a neutral reason.

- `Refused 18 July 2026`
- `Fireworks were refused because the venue cannot approve them under its licence.`

Do not use apology, failure language, error colour names, `Dropped`, or a reasonless strikethrough.

### Publication

- `3 unpublished changes`
- `Working preview. These changes are not public yet.`
- `Published 18 July 2026. Revision 4.`

Do not say `live` unless a real production publication succeeded and the linked public page was verified.

### Confidence and timing

Use only language the current facts justify.

- `Clear` means the direction is settled enough to act on.
- `Direction set` means the route is understood while details may move.
- `Still open` means a choice or timing remains unresolved.

Never convert those phrases into a percentage, score, traffic light, or
prediction. The selected artefact may show an exact completion percentage when
it is derived only from completed milestones divided by all non-cancelled
milestones. That percentage describes settled work, never confidence.

### Selected line and countdown

- Use `Our next milestone` for the first unfinished point.
- Use `Today` only on the calendar-position dash derived from the publication's
  date context.
- Use `Milestones complete` for exact completion arithmetic.
- Use `N days remaining` or `N days left` for a future primary date.
- Use the primary date's own label in supporting copy, for example `Wedding
  day, 14 September 2026`.
- Do not call an overdue or unfinished milestone `Current` or `Now` merely
  because it is the next point on the line.
- Do not animate by changing facts. Motion may move between two already true
  readings and must leave the active reading available to assistive technology.

### Views

- Zero: `No views yet`.
- One: `1 Timeline view`.
- More than one: `184 Timeline views`.
- Never say `people`, `unique viewers`, or `reach` when an anonymous bearer
  link cannot prove identity.
- View counts are owner-only. The shared artefact never mentions them.

### Product identity

The visual wordmark in the selected artefact reads lowercase `timeline`.
Product prose still uses the full name `Signal Timeline`. The shared artefact
does not show the Signal Studio operating rail. `A Signal Studio product` may
appear once as restrained attribution.

## Surface-specific rules

| Surface | Copy priority | Boundary |
| --- | --- | --- |
| Owner plan | Action, publication state, recovery, and consequence. | Owner notes may appear, but public wording must remain separately identifiable. |
| Shared Timeline | Purpose, completion, Our next milestone, Today, horizon, and dated decisions. | No owner controls, view count, raw Notes content, internal source identifiers, or draft ambiguity. |
| Shared update | Current direction, what changed, why, and what comes next. | No invented progress metrics or claims derived from counts alone. |
| Item detail | Meaning now, timing, next practical step, decision, and history. | No fallback to owner-only data when a public item is absent. |

## System and recovery copy

- Empty: say what is absent, not that the user failed. `Nothing has been published here yet.`
- Loading: retain context. `Preparing the latest published plan.`
- Error: protect trust. `We could not load this plan. The last published version is unchanged.`
- Read only: explain the limit. `Reviewing a read-only copy.`
- Hidden: name the destination. `Hidden from the public plan. You can restore it here.`
- Delete: distinguish source. Synced work can be hidden; only manual lab items can be deleted.
- Undo: name the object and result. `Supplier access window restored.`

## Accessibility copy

Accessible names include the item title and action: `Move Menu tasting and dietary sign-off to Soon`. Live announcements state the result and position without repeating the entire row. Link text should identify the item; do not use `Read more` as the only label.

## Planned milestone-memory copy

`Add the moment` is the proposed owner prompt after a milestone is complete.
Captions should name the people and moment plainly. Shared Timelines must not
show empty media placeholders. Media upload and publication remain planned, so
no production copy may imply that a photograph can be added until that flow is
implemented and verified.

## Production boundary

The selected vocabulary is a contract, not production evidence. Before release,
every production string, metadata field, share preview, error response, and
legacy state mapping must be audited against it. Claims about privacy,
publication, link-only access, view counting, sync, or anonymous access require
implementation and runtime receipts.
