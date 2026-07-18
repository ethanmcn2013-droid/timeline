# Signal Timeline redesign: public direction contract

This document separates confirmed product rules from the proposed design-lab data contract. The proposed types are fixture-only until a direction is selected and a production migration is approved.

## Confirmed publication rules

1. Signal Timeline is public by default and must be readable without an account.
2. The public primary ladder is `Now / Soon / Later / Done / Refused`.
3. `Waiting on you / Underway / Coming up / Done` are secondary states, not parallel lanes.
4. `Waiting on you` is the only secondary state with strong colour presence.
5. Refused work is a dated decision.
6. Audience Timelines remain a separate frozen projection and bearer-link boundary.
7. Timeline v1 does not add private workspaces, comments, a team tier, or a public directory.
8. Public copy must not expose internal project-management vocabulary or unsupported product claims.

## Proposed object model

```ts
type TimelineBucket = "now" | "soon" | "later" | "done" | "refused";

type SecondaryState =
  | "waiting-on-you"
  | "underway"
  | "coming-up"
  | "done"
  | null;

type ItemSource = "synced" | "manual";

type Confidence = "on-track" | "watching" | "date-uncertain" | null;

type DirectionDecision = {
  reason: string;
  decidedAt: string;
};

type TimelineChange = {
  id: string;
  itemId: string;
  fromBucket: TimelineBucket | null;
  toBucket: TimelineBucket;
  reason: string | null;
  changedAt: string;
};

type TimelineItem = {
  id: string;
  title: string;
  publicSummary: string | null;
  ownerOnlyNote: string | null;
  bucket: TimelineBucket;
  secondaryState: SecondaryState;
  targetLanguage: string | null;
  targetDate: string | null;
  milestone: boolean;
  confidence: Confidence;
  nextStep: string | null;
  decision: DirectionDecision | null;
  publicVisible: boolean;
  source: ItemSource;
  sortOrder: number;
  changes: TimelineChange[];
};

type TimelineWorkingPlan = {
  id: string;
  title: string;
  publicIntroduction: string;
  ownerOnlyBrief: string | null;
  updatedAt: string;
  items: TimelineItem[];
};

type TimelinePublishedSnapshot = {
  version: number;
  publishedAt: string;
  plan: PublicTimelinePlan;
};

type PublicTimelineItem = {
  id: string;
  title: string;
  summary: string | null;
  bucket: TimelineBucket;
  secondaryState: SecondaryState;
  targetLanguage: string | null;
  targetDate: string | null;
  milestone: boolean;
  confidence: Confidence;
  nextStep: string | null;
  decision: DirectionDecision | null;
  sortOrder: number;
  recentChange: TimelineChange | null;
};

type PublicTimelinePlan = {
  id: string;
  title: string;
  introduction: string;
  items: PublicTimelineItem[];
};
```

## Proposed plan states

```text
Fixture baseline
  -> working plan
       -> owner mutations
       -> strict public projection
            -> working preview, marked not published
       -> Publish
            -> immutable fixture snapshot
                 -> public timeline
                 -> shared update
                 -> item detail

Reload
  -> fixture baseline restored
```

### Working plan

- Owner-only.
- Contains source type, owner notes, hidden items, editing state, and all change records.
- May differ from the last published snapshot.
- An unpublished-change count is derived by comparing its public projection to the snapshot.

### Working preview

- Lab-only.
- Uses the strict public projection of the current working plan.
- Carries a persistent `Working preview · not published` label.
- Exists to test cross-surface continuity, not to imply a production draft URL.

### Published snapshot

- Fixture-only in Phase 1.
- Replaced only by the lab's Publish action.
- Contains public fields only.
- Includes a version and `publishedAt` receipt.
- Drives public timeline, shared update, and item detail when `preview=published`.

## Strict public projection

**Proposed:** `toPublicPlan(workingPlan)` constructs a new object from an explicit allowlist. It must never spread a working item or serialize the owner model wholesale.

Projection rules:

1. Exclude items where `publicVisible` is false.
2. Include only the fields declared on `PublicTimelinePlan` and `PublicTimelineItem`.
3. Never include `ownerOnlyNote`, `ownerOnlyBrief`, `source`, editor state, sync identifiers, hidden items, or unpublished future metadata.
4. Sort buckets in `now`, `soon`, `later`, `done`, `refused` order.
5. Sort items inside each bucket by stable `sortOrder`, then `id` as a deterministic tie-breaker.
6. Normalize empty optional copy to `null` rather than omitting meaning inconsistently across surfaces.
7. For `refused`, require a non-empty `decision.reason` and ISO `decision.decidedAt` before projection.
8. For non-refused items, omit a refusal decision. Preserve earlier movement through `recentChange` only when that record is safe and relevant.
9. Reduce changes to the newest public-safe record. Do not expose private edit history.
10. Preserve the same item identifier in all public surfaces so detail links and continuity checks are deterministic.

Example implementation shape:

```ts
function toPublicItem(item: TimelineItem): PublicTimelineItem | null {
  if (!item.publicVisible) return null;
  if (item.bucket === "refused" && !item.decision) return null;

  return {
    id: item.id,
    title: item.title,
    summary: item.publicSummary,
    bucket: item.bucket,
    secondaryState: item.secondaryState,
    targetLanguage: item.targetLanguage,
    targetDate: item.targetDate,
    milestone: item.milestone,
    confidence: item.confidence,
    nextStep: item.nextStep,
    decision: item.bucket === "refused" ? item.decision : null,
    sortOrder: item.sortOrder,
    recentChange: newestPublicChange(item.changes),
  };
}
```

## Cross-surface fact contract

The composition may vary, but these facts must remain identical wherever the same item appears.

| Fact | Owner plan | Public timeline | Shared update | Item detail |
| --- | --- | --- | --- | --- |
| Public title | Editable working value | Projected value | Projected value | Projected value |
| Bucket | Editable working value | Primary grouping | Change and next-step grouping | Named current bucket |
| Secondary state | Editable, sparingly | Present only when useful | Present only when useful | Present with plain explanation |
| Target language/date | Editable | Same public value | Same public value when relevant | Same public value |
| Confidence | Editable proposal | Same public value | Summarized without false precision | Same public value with context |
| Next step | Editable | Visible on relevant item | Required in summary when available | Same public value |
| Recent movement | Full owner-safe history | Latest public-safe change | Lead change record | Latest public-safe change |
| Refusal reason/date | Editable and reversible | Required | Included when newly refused | Required decision record |
| Visibility | Owner control | Hidden items absent | Hidden items absent | Hidden items not addressable |
| Owner-only note | Visible to owner | Never present | Never present | Never present |

## Surface derivations

### Public timeline

- Uses all five buckets in canonical order.
- Leads with Now and a practical next step.
- Keeps Done and Refused available without making them compete with current direction.
- Shows publication state and date.
- Does not show owner controls, internal sources, percentages as a headline, or draft ambiguity.

### Shared update

- Derives its headline from the newest meaningful public change.
- Answers what changed, why it changed, what is happening now, and what comes next.
- Includes a calm `Waiting on you` callout only when action is actually required.
- May summarize a subset of items, but every included fact must match the public plan.
- Does not calculate a different status ladder from raw tasks.

### Item detail

- Looks up the selected item from the same projected plan.
- Uses the exact public title, bucket, date language, confidence, next step, and newest public change.
- Returns a clear not-found state when the item is hidden or absent from the chosen projection.
- Does not fall back to an owner entity or raw task query in the lab.

## Refusal contract

**Confirmed rule:** Refused work is dated and does not require an apology.

**Proposed requirements:**

- Owner selects `Refused` as a deliberate move, not a destructive delete action.
- Reason and decision date are required before the move completes.
- Public label is `Refused`, never `Dropped`.
- Public treatment is neutral and readable, not error red.
- The reason is plain language and specific enough to answer why it will not be picked up.
- Reversal moves the item to a chosen active bucket and appends a new change record. It does not erase the refusal record from owner history.

## Share-link contract

**Confirmed:** Shared update links currently carry source-tracking parameters.

**Proposed lab URL dimensions:**

```text
/__design-lab/timeline
  ?option=a|b|c
  &surface=owner|public|update|detail
  &dataset=wedding|freelance|small-business|edge
  &density=sparse|normal|dense
  &state=default|empty|loading|error|read-only|unpublished|recently-changed
  &viewport=mobile|tablet|desktop
  &preview=working|published
  &item=<public-item-id>
```

The lab may also retain campaign parameters for review of attribution copy, but it must not send analytics or make external requests.

Safe share rules:

- Copying a lab URL copies only fixture selectors and public identifiers.
- No owner note, draft payload, token, email, database identifier, or credential appears in the URL.
- `preview=working` is always visibly marked as a non-public review preview.
- `preview=published` is labelled as a fixture snapshot, not a production publication.
- `source` remains independent campaign attribution and is preserved when lab controls change.
- Production-safe sharing, revocation, and authentication are out of scope for the isolated lab and must not be implied.

## Failure behaviour

| Failure | Proposed response |
| --- | --- |
| Missing public item | Render a calm not-found state from the public projection. Do not fall back to owner data. |
| Refused item without reason or date | Prevent owner transition and explain the missing field. Do not project the item as refused. |
| Invalid query selector | Fall back to the documented default and keep the URL canonical. |
| Empty public projection | Show the explicit public empty state and publication receipt. |
| Simulated load failure | Preserve lab controls and offer `Try again`; do not erase the fixture state. |
| Working changes exist | Keep `Not published` visible on every working-preview surface. |
| Owner action in read-only state | Disable the control with visible explanatory copy, not silent failure. |

## Required contract tests

1. Every visible working item produces the same public title, bucket, date, confidence, next step, and recent change across public, update, and detail selectors.
2. Hidden items are absent from the public plan and cannot be resolved by detail lookup.
3. A sentinel owner-only note never appears in JSON serialization of the public plan.
4. Publishing replaces the fixture snapshot and increments its version.
5. Editing the working plan does not mutate the previous snapshot before Publish.
6. A refused item without both reason and date cannot enter a valid public projection.
7. Refusal reason and date match across public timeline, shared update, and detail.
8. Bucket ordering and item ordering are stable.
9. Legacy public labels are absent from every public string table.
10. Reload restores the deterministic fixture baseline.

These tests prove the proposed lab contract only. They are not evidence that production publication, revocation, privacy, or durability has changed.
