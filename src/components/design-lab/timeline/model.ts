import {
  TIMELINE_BUCKETS,
  type LabDataset,
  type LabDensity,
  type LabScenario,
  type PlanSnapshot,
  type PreviewSource,
  type PublicPlanDto,
  type PublicTimelineItem,
  type TimelineBucket,
  type TimelineChange,
  type TimelineItem,
  type TimelineLabAction,
  type TimelineLabState,
} from "./types";

export const OWNER_ONLY_SENTINEL = "OWNER_ONLY_SENTINEL_DO_NOT_PUBLISH";

const BASE_PUBLISHED_AT = "2026-07-12T09:00:00.000Z";
const BASE_UPDATED_AT = "2026-07-12T08:30:00.000Z";
const ACTION_STEP_MS = 60 * 60 * 1000;

const BUCKET_INDEX = new Map<TimelineBucket, number>(
  TIMELINE_BUCKETS.map((bucket, index) => [bucket, index]),
);

interface DatasetDefinition {
  slug: string;
  title: string;
  purpose: string;
  author: string;
  coreItems: TimelineItem[];
  fillerBuckets?: TimelineBucket[];
}

function item(
  id: string,
  project: string,
  title: string,
  bucket: TimelineBucket,
  order: number,
  options: Partial<Omit<TimelineItem, "id" | "project" | "title" | "bucket" | "order">> = {},
): TimelineItem {
  const createdAt = options.createdAt ?? "2026-06-02T09:00:00.000Z";
  const updatedAt = options.updatedAt ?? "2026-07-10T10:00:00.000Z";

  return {
    id,
    project,
    title,
    publicSummary: options.publicSummary ?? `${title} is part of the current direction.`,
    ownerNote: options.ownerNote ?? "",
    bucket,
    secondaryState: options.secondaryState ?? null,
    timing: options.timing ?? "Timing to be confirmed",
    confidence: options.confidence ?? "directional",
    nextStep: options.nextStep ?? "Confirm the next practical step.",
    publicVisible: options.publicVisible ?? true,
    origin: options.origin ?? "tasks",
    order,
    createdAt,
    updatedAt,
    decision: options.decision
      ? {
          date: options.decision.date,
          publicReason: options.decision.publicReason,
          ownerReason: options.decision.ownerReason,
        }
      : undefined,
  };
}

const DATASET_DEFINITIONS: Record<LabDataset, DatasetDefinition> = {
  wedding: {
    slug: "mara-finn-wedding",
    title: "Mara and Finn's wedding",
    purpose: "A calm shared view of the decisions shaping the day.",
    author: "Mara and Finn",
    coreItems: [
      item("wed-venue", "The day", "Confirm the venue layout", "now", 0, {
        publicSummary: "Walk the final room plan with the venue and confirm the wet-weather layout.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: the provisional venue discount is private.`,
        secondaryState: "waiting-on-you",
        timing: "By 24 July",
        confidence: "clear",
        nextStep: "Mara and Finn choose between the two table layouts.",
      }),
      item("wed-invitations", "Guests", "Approve the invitation proof", "now", 1, {
        publicSummary: "The final invitation proof is ready for names and address checks.",
        secondaryState: "underway",
        timing: "This week",
        confidence: "clear",
        nextStep: "Send one combined list of corrections to the stationer.",
      }),
      item("wed-menu", "Food", "Choose the evening menu", "soon", 0, {
        publicSummary: "The tasting is complete and two menu combinations remain.",
        secondaryState: "coming-up",
        timing: "Late July",
        nextStep: "Confirm dietary counts before choosing the final menu.",
      }),
      item("wed-music", "The day", "Set the ceremony music", "soon", 1, {
        publicSummary: "Shortlist the entrance, signing, and exit pieces.",
        timing: "Early August",
        nextStep: "Share the three-piece shortlist with the musicians.",
      }),
      item("wed-transport", "Guests", "Arrange evening transport", "later", 0, {
        publicSummary: "Plan return transport once the final guest locations are known.",
        timing: "After final replies",
        confidence: "open",
        nextStep: "Group guest addresses by area after the reply date.",
      }),
      item("wed-signage", "The day", "Prepare venue signage", "later", 1, {
        timing: "September",
        nextStep: "Reuse the invitation type system for the sign set.",
      }),
      item("wed-photographer", "Suppliers", "Book the photographer", "done", 0, {
        publicSummary: "The photographer is booked and the deposit is received.",
        secondaryState: "done",
        timing: "Confirmed 18 June",
        confidence: "clear",
        nextStep: "Revisit the shot list one month before the wedding.",
      }),
      item("wed-fireworks", "The day", "Add a fireworks finish", "refused", 0, {
        publicSummary: "A fireworks finish is not part of the plan.",
        timing: "Decided 5 July",
        confidence: "clear",
        nextStep: "Keep the evening close simple and venue-led.",
        decision: {
          date: "2026-07-05",
          publicReason: "It would add cost and venue complexity without improving the guest experience.",
          ownerReason: "The supplier quote was above the private contingency.",
        },
      }),
      item("wed-private-budget", "Budget", "Reconcile supplier deposits", "soon", 2, {
        publicSummary: "Supplier deposits are being reconciled against the agreed plan.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: private cash-flow timing and account details.`,
        publicVisible: false,
        timing: "Owner only",
        nextStep: "Reconcile the private ledger.",
      }),
    ],
  },
  freelance: {
    slug: "north-star-studio-client-plan",
    title: "North Star studio launch",
    purpose: "A client-safe view of what is moving, what follows, and what is out.",
    author: "Eden Cole",
    coreItems: [
      item("free-review", "Website", "Review the launch page", "now", 0, {
        publicSummary: "The complete launch page is ready for one consolidated client review.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: do not expose the client's internal stakeholder disagreement.`,
        secondaryState: "waiting-on-you",
        timing: "By 22 July",
        confidence: "clear",
        nextStep: "The client returns one marked-up review by Friday.",
      }),
      item("free-case-study", "Content", "Finish the first case study", "now", 1, {
        publicSummary: "Draft the outcome narrative and prepare the approved project images.",
        secondaryState: "underway",
        timing: "This week",
        nextStep: "Confirm the final outcome quote with the client.",
      }),
      item("free-mobile", "Website", "Complete the mobile pass", "soon", 0, {
        publicSummary: "Complete the focused mobile layout and interaction review after copy approval.",
        timing: "After copy approval",
        nextStep: "Resolve the launch-page review first.",
      }),
      item("free-handoff", "Delivery", "Prepare the editor handoff", "soon", 1, {
        timing: "Late July",
        confidence: "directional",
        nextStep: "Record the five common editing tasks.",
      }),
      item("free-invoice", "Delivery", "Issue the final invoice", "later", 0, {
        publicSummary: "Issue the final project invoice after launch acceptance.",
        timing: "When launch is accepted",
        confidence: "open",
        nextStep: "Confirm written launch acceptance.",
      }),
      item("free-domain", "Launch", "Connect the launch domain", "later", 1, {
        timing: "Launch window",
        nextStep: "Ask the client for registrar access through the secure channel.",
      }),
      item("free-foundation", "Website", "Approve the visual foundation", "done", 0, {
        publicSummary: "Typography, colour, and page rhythm are approved.",
        secondaryState: "done",
        timing: "Confirmed 2 July",
        confidence: "clear",
        nextStep: "Use the approved foundation through launch.",
      }),
      item("free-social", "Scope", "Add a monthly social package", "refused", 0, {
        publicSummary: "A monthly social package is outside this launch plan.",
        timing: "Decided 8 July",
        confidence: "clear",
        nextStep: "Keep the current engagement focused on the website launch.",
        decision: {
          date: "2026-07-08",
          publicReason: "It is a separate ongoing service and would blur the launch scope.",
          ownerReason: "Do not mention the client's delayed payment history.",
        },
      }),
      item("free-private-invoice", "Delivery", "Resolve the overdue deposit", "now", 2, {
        publicSummary: "The project account is being kept current.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: invoice number, balance, and collection notes.`,
        publicVisible: false,
        timing: "Owner only",
        nextStep: "Follow the private collection plan.",
      }),
    ],
  },
  "small-business": {
    slug: "harbour-bakehouse-direction",
    title: "Harbour Bakehouse direction",
    purpose: "The current direction for customers, staff, and local partners.",
    author: "Harbour Bakehouse",
    coreItems: [
      item("biz-booking", "Customer experience", "Open the celebration cake booking page", "now", 0, {
        publicSummary: "The new booking page is ready for final product photography and opening copy.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: launch margin assumptions and staffing concerns.`,
        secondaryState: "underway",
        timing: "By 26 July",
        confidence: "clear",
        nextStep: "Add the six final cake photographs.",
      }),
      item("biz-summer", "Shop", "Confirm the summer counter range", "now", 1, {
        publicSummary: "Choose the smaller summer range that can stay consistent through busy weekends.",
        secondaryState: "waiting-on-you",
        timing: "This week",
        nextStep: "The kitchen confirms which two tarts can run every day.",
      }),
      item("biz-packaging", "Supply", "Move to recyclable cake boxes", "soon", 0, {
        publicSummary: "The preferred recyclable box is in supplier testing.",
        secondaryState: "coming-up",
        timing: "August",
        nextStep: "Test the large box on the next delivery route.",
      }),
      item("biz-rota", "Team", "Publish the August rota", "soon", 1, {
        publicSummary: "The draft rota is waiting for final holiday confirmations.",
        timing: "By 29 July",
        nextStep: "Confirm two outstanding holiday requests.",
      }),
      item("biz-wholesale", "Growth", "Pilot the hotel breakfast order", "soon", 2, {
        publicSummary: "A small three-week breakfast pilot is being prepared with one local hotel.",
        timing: "Mid August",
        confidence: "directional",
        nextStep: "Agree the daily cut-off and return crate process.",
      }),
      item("biz-window", "Shop", "Refresh the front window", "later", 0, {
        timing: "Early autumn",
        confidence: "open",
        nextStep: "Review after the summer range settles.",
      }),
      item("biz-allergen", "Customer experience", "Publish the allergen guide", "done", 0, {
        publicSummary: "The counter and online allergen guide now use the same source.",
        secondaryState: "done",
        timing: "Published 4 July",
        confidence: "clear",
        nextStep: "Review whenever a recipe changes.",
      }),
      item("biz-delivery-app", "Growth", "Join a third delivery app", "refused", 0, {
        publicSummary: "A third delivery app is not part of the current direction.",
        timing: "Decided 6 July",
        confidence: "clear",
        nextStep: "Improve direct collection before adding another channel.",
        decision: {
          date: "2026-07-06",
          publicReason: "It would add operational load without strengthening the direct customer relationship.",
          ownerReason: "The private margin test did not clear the minimum.",
        },
      }),
      item("biz-hidden-pos", "Operations", "Replace the till integration", "soon", 3, {
        publicSummary: "A till integration change is being assessed.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: vendor contract and incident details.`,
        publicVisible: false,
        timing: "Owner only",
        nextStep: "Resolve in Signal Tasks before making it public.",
      }),
    ],
  },
  "edge-cases": {
    slug: "edge-case-review-plan",
    title: "Direction review with deliberate edge cases",
    purpose: "Fixture content for overflow, absence, deterministic order, and privacy review.",
    author: "Signal Timeline lab",
    fillerBuckets: ["soon", "later", "done", "refused"],
    coreItems: [
      item(
        "edge-long-title",
        "A project name that is intentionally long enough to wrap more than once",
        "Confirm the deliberately long and carefully qualified direction statement without allowing controls or adjacent evidence to collapse",
        "soon",
        0,
        {
          publicSummary:
            "This sentence is deliberately long so the layout proves that readable prose, action controls, and evidence remain separate at narrow and wide widths.",
          ownerNote: `${OWNER_ONLY_SENTINEL}: edge-case private note must never enter public output.`,
          secondaryState: "waiting-on-you",
          timing: "A date is intentionally not available",
          confidence: "open",
          nextStep: "Choose the least ambiguous direction after the layout review.",
        },
      ),
      item("edge-unbroken", "Overflow", "Test an unbroken public reference", "soon", 0, {
        publicSummary:
          "PUBLICREFERENCEABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        timing: "",
        nextStep: "Verify wrapping without horizontal page overflow.",
      }),
      item("edge-later", "Absence", "Keep a plan coherent when Now is empty", "later", 0, {
        publicSummary: "No item occupies Now in this dataset by design.",
        timing: "When prerequisites become clear",
        nextStep: "Explain the absence without inventing progress.",
      }),
      item("edge-done", "Archive", "Retain a settled decision receipt", "done", 0, {
        secondaryState: "done",
        timing: "Confirmed 1 July",
        confidence: "clear",
        nextStep: "Keep the receipt available in the archive.",
      }),
      item("edge-refused-one", "Decisions", "Adopt an urgent red status system", "refused", 0, {
        publicSummary: "An urgent red status system is not part of this direction.",
        timing: "Decided 3 July",
        confidence: "clear",
        nextStep: "Use hierarchy and plain language instead.",
        decision: {
          date: "2026-07-03",
          publicReason: "Colour should not carry the meaning of direction on its own.",
          ownerReason: "Private review note about the rejected vendor concept.",
        },
      }),
      item("edge-refused-two", "Decisions", "Publish owner notes in item detail", "refused", 0, {
        publicSummary: "Owner notes remain outside public item detail.",
        timing: "Decided 4 July",
        confidence: "clear",
        nextStep: "Project only the documented public fields.",
        decision: {
          date: "2026-07-04",
          publicReason: "Owner notes can contain private operational context.",
          ownerReason: `${OWNER_ONLY_SENTINEL}: privacy test inside a refused decision.`,
        },
      }),
      item("edge-hidden", "Privacy", "Hidden synced source item", "later", 0, {
        publicSummary: "This text must not appear because the item is hidden.",
        ownerNote: `${OWNER_ONLY_SENTINEL}: hidden item source metadata.`,
        publicVisible: false,
        timing: "Owner only",
        nextStep: "Restore only during a deliberate owner action.",
      }),
    ],
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

const SUPPORTING_TITLES: Record<LabDataset, readonly string[]> = {
  wedding: [
    "Confirm guest transport pickup points",
    "Review the ceremony reading order",
    "Hold the indoor portrait location",
    "Confirm the legal paperwork appointment",
    "Add a second late-night bar",
    "Verify final guest accessibility needs",
    "Choose the table linen tone",
    "Prepare the morning delivery sequence",
    "Book the string quartet",
    "Extend the venue hire by two hours",
    "Confirm the children's meal count",
    "Approve the place-card names",
    "Plan the day-before handoff",
    "Send the final rooming list",
    "Add a separate cocktail menu",
    "Confirm supplier arrival windows",
    "Choose the cake table position",
    "Prepare the wet-weather guest note",
    "Set the final reply date",
    "Add individual guest favours",
  ],
  freelance: [
    "Confirm the final launch copy",
    "Review the mobile navigation",
    "Prepare the launch-day checklist",
    "Approve the project archive",
    "Add a second animation concept",
    "Resolve the final accessibility notes",
    "Choose the case-study lead image",
    "Prepare the analytics handoff",
    "Confirm the content model",
    "Add a weekly reporting package",
    "Check the contact-form delivery path",
    "Review the social preview copy",
    "Prepare the domain rollback note",
    "Close the final content comments",
    "Add a custom icon library",
    "Confirm the editor training time",
    "Package the approved source files",
    "Write the first-week review note",
    "Confirm the launch owner",
    "Add an unplanned campaign page",
  ],
  "small-business": [
    "Confirm the Saturday counter plan",
    "Review the celebration cake photographs",
    "Prepare the autumn tasting date",
    "Complete the new-starter food briefing",
    "Add a second wholesale route",
    "Confirm the weekend collection window",
    "Choose the reusable cup supplier",
    "Prepare the local hotel sample box",
    "Publish the revised opening hours",
    "Add a loyalty app before launch",
    "Review the click-and-collect wording",
    "Confirm the flour delivery buffer",
    "Plan the early autumn window display",
    "Complete the recipe-change record",
    "Expand delivery beyond the local area",
    "Confirm the holiday order cut-off",
    "Choose the counter label format",
    "Prepare the customer feedback note",
    "Publish the team contact rota",
    "Add a second online marketplace",
  ],
  "edge-cases": [
    "Keep an empty Now section understandable",
    "Wrap a three-line direction title",
    "Hold an item without timing language",
    "Record two changes at the same time",
    "Refuse an item with a long public reason",
    "Show one Waiting item without colour alone",
    "Wrap a long project name beside timing",
    "Keep a missing description calm",
    "Order equal items deterministically",
    "Refuse an item without a next dependency",
    "Reflow controls at three hundred and twenty pixels",
    "Preserve focus after a bucket move",
    "Print a long decision without clipping",
    "Keep public copy free of owner context",
    "Refuse an item after a backward move",
    "Show a dense Done archive",
    "Keep an unbroken reference inside the page",
    "Explain a plan with no current item",
    "Render a deliberately long next step",
    "Refuse duplicate-looking work clearly",
  ],
};

const SUPPORTING_PROJECTS: Record<LabDataset, readonly string[]> = {
  wedding: ["Guests", "The day", "Suppliers", "Arrival"],
  freelance: ["Launch", "Website", "Content", "Delivery"],
  "small-business": ["Shop", "Team", "Supply", "Customer experience"],
  "edge-cases": ["Absence", "Overflow", "Ordering", "Privacy"],
};

function makeFillerItems(dataset: LabDataset, definition: DatasetDefinition): TimelineItem[] {
  const buckets = definition.fillerBuckets ?? ["now", "soon", "later", "done", "refused"];
  const existingCounts = new Map<TimelineBucket, number>();
  for (const bucket of TIMELINE_BUCKETS) {
    existingCounts.set(bucket, definition.coreItems.filter((entry) => entry.bucket === bucket).length);
  }

  return Array.from({ length: 20 }, (_, index) => {
    const bucket = buckets[index % buckets.length];
    const order = existingCounts.get(bucket) ?? 0;
    existingCounts.set(bucket, order + 1);
    const sequence = index + 1;
    const date = `2026-06-${pad((index % 28) + 1)}`;
    const isRefused = bucket === "refused";

    return item(
      `${dataset}-support-${pad(sequence)}`,
      SUPPORTING_PROJECTS[dataset][index % SUPPORTING_PROJECTS[dataset].length],
      SUPPORTING_TITLES[dataset][index],
      bucket,
      order,
      {
        publicSummary: isRefused
          ? `${SUPPORTING_TITLES[dataset][index]} is not part of the current direction.`
          : bucket === "done"
            ? `${SUPPORTING_TITLES[dataset][index]} is complete and retained as a receipt.`
            : `${SUPPORTING_TITLES[dataset][index]} remains visible in the shared direction.`,
        secondaryState: bucket === "done" ? "done" : bucket === "now" ? "underway" : bucket === "soon" ? "coming-up" : null,
        timing: isRefused ? `Decided ${date}` : bucket === "done" ? `Confirmed ${date}` : bucket === "now" ? "This week" : bucket === "soon" ? "Coming up" : "Timing open",
        confidence: bucket === "later" ? "open" : "directional",
        nextStep: isRefused ? "Keep the decision receipt available." : bucket === "done" ? "Keep the completion receipt available." : "Confirm the next practical step with everyone involved.",
        origin: index % 3 === 0 ? "manual" : "tasks",
        createdAt: `${date}T09:00:00.000Z`,
        updatedAt: `2026-07-${pad((index % 10) + 1)}T10:00:00.000Z`,
        decision: isRefused
          ? {
              date,
              publicReason: "It would add work without strengthening the agreed direction.",
              ownerReason: "Private fixture rationale remains owner-only.",
            }
          : undefined,
      },
    );
  });
}

function cloneItem(source: TimelineItem): TimelineItem {
  return {
    id: source.id,
    project: source.project,
    title: source.title,
    publicSummary: source.publicSummary,
    ownerNote: source.ownerNote,
    bucket: source.bucket,
    secondaryState: source.secondaryState,
    timing: source.timing,
    confidence: source.confidence,
    nextStep: source.nextStep,
    publicVisible: source.publicVisible,
    origin: source.origin,
    order: source.order,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    decision: source.decision
      ? {
          date: source.decision.date,
          publicReason: source.decision.publicReason,
          ownerReason: source.decision.ownerReason,
        }
      : undefined,
  };
}

function cloneChange(source: TimelineChange): TimelineChange {
  return {
    id: source.id,
    itemId: source.itemId,
    kind: source.kind,
    fromBucket: source.fromBucket,
    toBucket: source.toBucket,
    publicReason: source.publicReason,
    ownerNote: source.ownerNote,
    occurredAt: source.occurredAt,
  };
}

function clonePlan(source: PlanSnapshot): PlanSnapshot {
  return {
    slug: source.slug,
    title: source.title,
    purpose: source.purpose,
    author: source.author,
    revision: source.revision,
    updatedAt: source.updatedAt,
    publishedAt: source.publishedAt,
    items: source.items.map(cloneItem),
    changes: source.changes.map(cloneChange),
  };
}

function createFixture(dataset: LabDataset): PlanSnapshot {
  const definition = DATASET_DEFINITIONS[dataset];
  const items = [...definition.coreItems, ...makeFillerItems(dataset, definition)].map(cloneItem);
  const visibleDone = items.find((entry) => entry.publicVisible && entry.bucket === "done");
  const visibleCurrent = items.find(
    (entry) => entry.publicVisible && (entry.bucket === "now" || entry.bucket === "soon"),
  );
  const changes: TimelineChange[] = [];

  if (visibleDone) {
    changes.push({
      id: `${dataset}-change-01`,
      itemId: visibleDone.id,
      kind: "move",
      fromBucket: "now",
      toBucket: "done",
      publicReason: "The work was confirmed complete.",
      ownerNote: "Source completion receipt retained in the fixture.",
      occurredAt: "2026-07-04T11:00:00.000Z",
    });
  }
  if (visibleCurrent) {
    changes.push({
      id: `${dataset}-change-02`,
      itemId: visibleCurrent.id,
      kind: "edit",
      publicReason: "The next step was clarified for everyone reading the plan.",
      ownerNote: "Owner-only source context was not projected.",
      occurredAt: "2026-07-10T15:00:00.000Z",
    });
  }

  return {
    slug: definition.slug,
    title: definition.title,
    purpose: definition.purpose,
    author: definition.author,
    revision: 1,
    updatedAt: BASE_UPDATED_AT,
    publishedAt: BASE_PUBLISHED_AT,
    items,
    changes,
  };
}

export const TIMELINE_FIXTURES: Readonly<Record<LabDataset, PlanSnapshot>> = {
  wedding: createFixture("wedding"),
  freelance: createFixture("freelance"),
  "small-business": createFixture("small-business"),
  "edge-cases": createFixture("edge-cases"),
};

function nextIso(plan: PlanSnapshot): string {
  const parsed = Date.parse(plan.updatedAt);
  const base = Number.isFinite(parsed) ? parsed : Date.parse(BASE_UPDATED_AT);
  return new Date(base + ACTION_STEP_MS).toISOString();
}

function nextChangeId(plan: PlanSnapshot, kind: TimelineChange["kind"]): string {
  return `${plan.slug}-${kind}-${pad(plan.changes.length + 1)}`;
}

function firstSelectableId(plan: PlanSnapshot): string {
  return (
    [...plan.items]
      .filter((entry) => entry.publicVisible)
      .sort(compareTimelineItems)[0]?.id ??
    [...plan.items].sort(compareTimelineItems)[0]?.id ??
    ""
  );
}

export function createInitialLabState(
  dataset: LabDataset,
  scenario: LabScenario = "default",
): TimelineLabState {
  const fixture = clonePlan(TIMELINE_FIXTURES[dataset]);
  const state: TimelineLabState = {
    dataset,
    working: clonePlan(fixture),
    published: clonePlan(fixture),
    selectedItemId: firstSelectableId(fixture),
    announcement: "Fixture plan ready. Reload resets every change.",
  };

  if (scenario === "empty") {
    state.working.items = [];
    state.working.changes = [];
    state.published.items = [];
    state.published.changes = [];
    state.selectedItemId = "";
    return state;
  }

  if (scenario === "unpublished") {
    const selected = state.working.items.find((entry) => entry.id === state.selectedItemId);
    if (selected) {
      return timelineLabReducer(state, {
        type: "edit",
        itemId: selected.id,
        patch: { nextStep: `${selected.nextStep} This working preview has not been published.` },
      });
    }
  }

  if (scenario === "recently-changed") {
    const selected = state.working.items.find(
      (entry) => entry.publicVisible && entry.bucket === "soon",
    );
    if (selected) {
      return timelineLabReducer(state, {
        type: "move",
        itemId: selected.id,
        to: "now",
        reason: "A prerequisite cleared, so this is ready to move now.",
      });
    }
  }

  return state;
}

function compareTimelineItems(
  left: Pick<TimelineItem, "bucket" | "order" | "id">,
  right: Pick<TimelineItem, "bucket" | "order" | "id">,
) {
  const bucketDifference =
    (BUCKET_INDEX.get(left.bucket) ?? Number.MAX_SAFE_INTEGER) -
    (BUCKET_INDEX.get(right.bucket) ?? Number.MAX_SAFE_INTEGER);
  if (bucketDifference !== 0) return bucketDifference;
  if (left.order !== right.order) return left.order - right.order;
  return left.id.localeCompare(right.id);
}

export function groupByBucket<T extends Pick<TimelineItem, "bucket" | "order" | "id">>(
  items: readonly T[],
): Record<TimelineBucket, T[]> {
  const grouped = Object.fromEntries(
    TIMELINE_BUCKETS.map((bucket) => [bucket, [] as T[]]),
  ) as Record<TimelineBucket, T[]>;

  for (const entry of items) grouped[entry.bucket].push(entry);
  for (const bucket of TIMELINE_BUCKETS) {
    grouped[bucket].sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order;
      return left.id.localeCompare(right.id);
    });
  }

  return grouped;
}

export function getSelected(
  state: TimelineLabState,
  source: PreviewSource = "working",
): TimelineItem | undefined {
  const plan = source === "published" ? state.published : state.working;
  return plan.items.find((entry) => entry.id === state.selectedItemId);
}

export function countUnpublished(state: TimelineLabState): number {
  const publishedById = new Map(state.published.items.map((entry) => [entry.id, entry]));
  const workingById = new Map(state.working.items.map((entry) => [entry.id, entry]));
  const ids = new Set([...publishedById.keys(), ...workingById.keys()]);
  let changedItems = 0;
  for (const id of ids) {
    if (JSON.stringify(workingById.get(id)) !== JSON.stringify(publishedById.get(id))) {
      changedItems += 1;
    }
  }

  const newReceipts = Math.max(0, state.working.changes.length - state.published.changes.length);
  const planCopyChanged = state.working.title !== state.published.title ||
    state.working.purpose !== state.published.purpose;
  return Math.max(changedItems + (planCopyChanged ? 1 : 0), newReceipts);
}

export function getRecentChanges(
  plan: Pick<PlanSnapshot, "changes">,
  limit = 5,
): TimelineChange[] {
  const boundedLimit = Math.max(0, Math.min(50, Math.trunc(limit)));
  return [...plan.changes]
    .sort((left, right) => {
      const timeDifference = Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
      return timeDifference || right.id.localeCompare(left.id);
    })
    .slice(0, boundedLimit)
    .map(cloneChange);
}

const DENSITY_QUOTAS: Record<Exclude<LabDensity, "dense">, Record<TimelineBucket, number>> = {
  sparse: { now: 1, soon: 1, later: 1, done: 1, refused: 1 },
  normal: { now: 3, soon: 3, later: 2, done: 1, refused: 1 },
};

export function selectPlanForDensity(plan: PlanSnapshot, density: LabDensity): PlanSnapshot {
  if (density === "dense") return clonePlan(plan);

  const grouped = groupByBucket(plan.items.filter((entry) => entry.publicVisible));
  const included = new Set<string>();
  for (const bucket of TIMELINE_BUCKETS) {
    for (const entry of grouped[bucket].slice(0, DENSITY_QUOTAS[density][bucket])) {
      included.add(entry.id);
    }
  }
  for (const entry of plan.items) {
    if (!entry.publicVisible) included.add(entry.id);
  }

  const items = plan.items.filter((entry) => included.has(entry.id)).map(cloneItem);
  const itemIds = new Set(items.map((entry) => entry.id));
  return {
    ...clonePlan(plan),
    items,
    changes: plan.changes.filter((change) => itemIds.has(change.itemId)).map(cloneChange),
  };
}

export function toPublicPlan(plan: PlanSnapshot): PublicPlanDto {
  const visibleItems = plan.items.filter((entry) => entry.publicVisible).sort(compareTimelineItems);
  const visibleIds = new Set(visibleItems.map((entry) => entry.id));

  return {
    slug: plan.slug,
    title: plan.title,
    purpose: plan.purpose,
    author: plan.author,
    revision: plan.revision,
    updatedAt: plan.updatedAt,
    publishedAt: plan.publishedAt,
    items: visibleItems.map(
      (entry): PublicTimelineItem => ({
        id: entry.id,
        project: entry.project,
        title: entry.title,
        summary: entry.publicSummary,
        bucket: entry.bucket,
        secondaryState: entry.secondaryState,
        timing: entry.timing,
        confidence: entry.confidence,
        nextStep: entry.nextStep,
        order: entry.order,
        updatedAt: entry.updatedAt,
        decision: entry.decision
          ? {
              date: entry.decision.date,
              reason: entry.decision.publicReason,
            }
          : undefined,
      }),
    ),
    changes: plan.changes
      .filter((change) => visibleIds.has(change.itemId))
      .map((change) => ({
        id: change.id,
        itemId: change.itemId,
        kind: change.kind,
        fromBucket: change.fromBucket,
        toBucket: change.toBucket,
        reason: change.publicReason,
        occurredAt: change.occurredAt,
      })),
  };
}

function withWorkingMutation(
  state: TimelineLabState,
  items: TimelineItem[],
  change: TimelineChange,
  announcement: string,
  selectedItemId = state.selectedItemId,
): TimelineLabState {
  return {
    ...state,
    working: {
      ...state.working,
      updatedAt: change.occurredAt,
      items,
      changes: [...state.working.changes.map(cloneChange), change],
    },
    selectedItemId,
    announcement,
    deleted: undefined,
  };
}

function cleanPatch(
  current: TimelineItem,
  patch: Extract<TimelineLabAction, { type: "edit" }>["patch"],
): TimelineItem {
  const next = cloneItem(current);
  if (typeof patch.title === "string" && patch.title.trim()) next.title = patch.title.trim();
  if (typeof patch.publicSummary === "string") next.publicSummary = patch.publicSummary.trim();
  if (typeof patch.ownerNote === "string") next.ownerNote = patch.ownerNote;
  if (typeof patch.timing === "string") next.timing = patch.timing.trim();
  if (patch.confidence === "clear" || patch.confidence === "directional" || patch.confidence === "open") {
    next.confidence = patch.confidence;
  }
  if (typeof patch.nextStep === "string") next.nextStep = patch.nextStep.trim();
  return next;
}

function editableFieldsMatch(left: TimelineItem, right: TimelineItem) {
  return (
    left.title === right.title &&
    left.publicSummary === right.publicSummary &&
    left.ownerNote === right.ownerNote &&
    left.timing === right.timing &&
    left.confidence === right.confidence &&
    left.nextStep === right.nextStep
  );
}

function secondaryForMove(itemToMove: TimelineItem, bucket: TimelineBucket) {
  if (bucket === "done") return "done" as const;
  if (bucket === "refused") return null;
  if (itemToMove.secondaryState === "waiting-on-you") return "waiting-on-you" as const;
  if (bucket === "now") return "underway" as const;
  if (bucket === "soon") return "coming-up" as const;
  return null;
}

function validDecisionDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

export function timelineLabReducer(
  state: TimelineLabState,
  action: TimelineLabAction,
): TimelineLabState {
  if (action.type === "reset") {
    return createInitialLabState(action.dataset, action.scenario ?? "default");
  }

  if (action.type === "select") {
    if (!state.working.items.some((entry) => entry.id === action.itemId)) return state;
    return {
      ...state,
      selectedItemId: action.itemId,
      announcement: "Item selected.",
    };
  }

  if (action.type === "publish") {
    const unpublished = countUnpublished(state);
    if (unpublished === 0) {
      return { ...state, announcement: "There are no unpublished changes." };
    }
    const timestamp = nextIso(state.working);
    const revision = Math.max(state.working.revision, state.published.revision) + 1;
    const published: PlanSnapshot = {
      ...clonePlan(state.working),
      revision,
      updatedAt: timestamp,
      publishedAt: timestamp,
    };
    return {
      ...state,
      working: clonePlan(published),
      published: clonePlan(published),
      announcement: `Published version ${revision} with ${unpublished} change${unpublished === 1 ? "" : "s"}.`,
      deleted: undefined,
    };
  }

  if (action.type === "undo-delete") {
    if (!state.deleted) return { ...state, announcement: "There is no deletion to undo." };
    const timestamp = nextIso(state.working);
    const items = state.working.items.map(cloneItem);
    items.splice(state.deleted.index, 0, {
      ...cloneItem(state.deleted.item),
      updatedAt: timestamp,
    });
    const change: TimelineChange = {
      id: nextChangeId(state.working, "restore"),
      itemId: state.deleted.item.id,
      kind: "restore",
      publicReason: "The manual item was restored.",
      ownerNote: "Deletion undone in the fixture session.",
      occurredAt: timestamp,
    };
    return {
      ...withWorkingMutation(
        state,
        items,
        change,
        `${state.deleted.item.title} restored.`,
        state.deleted.item.id,
      ),
      deleted: undefined,
    };
  }

  if (action.type === "add") {
    const timestamp = nextIso(state.working);
    const sequence = state.working.items.filter((entry) => entry.origin === "manual").length +
      state.working.changes.length +
      1;
    const grouped = groupByBucket(state.working.items);
    const created = item(
      `manual-${state.dataset}-${pad(sequence)}`,
      "Owner plan",
      action.title?.trim() || "Untitled direction item",
      "now",
      grouped.now.length,
      {
        publicSummary: "A new manual item awaiting a clear public summary.",
        ownerNote: "Created inside the fixture-only design lab.",
        secondaryState: "underway",
        timing: "Timing to be confirmed",
        confidence: "open",
        nextStep: "Add the next practical step.",
        origin: "manual",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    );
    const change: TimelineChange = {
      id: nextChangeId(state.working, "create"),
      itemId: created.id,
      kind: "create",
      toBucket: "now",
      publicReason: "A new direction item was added.",
      ownerNote: "Fixture-only manual item.",
      occurredAt: timestamp,
    };
    return withWorkingMutation(
      state,
      [...state.working.items.map(cloneItem), created],
      change,
      `${created.title} added to Now.`,
      created.id,
    );
  }

  const itemIndex = state.working.items.findIndex((entry) => entry.id === action.itemId);
  if (itemIndex < 0) return { ...state, announcement: "That item is not available." };
  const current = state.working.items[itemIndex];

  if (action.type === "edit") {
    const cleaned = cleanPatch(current, action.patch);
    if (editableFieldsMatch(cleaned, current)) return state;

    const timestamp = nextIso(state.working);
    const publicFieldChanged =
      cleaned.title !== current.title ||
      cleaned.publicSummary !== current.publicSummary ||
      cleaned.timing !== current.timing ||
      cleaned.confidence !== current.confidence ||
      cleaned.nextStep !== current.nextStep;
    const updated = {
      ...cleaned,
      updatedAt: publicFieldChanged ? timestamp : current.updatedAt,
    };
    const items = state.working.items.map((entry, index) =>
      index === itemIndex ? updated : cloneItem(entry),
    );
    if (!publicFieldChanged) {
      return {
        ...state,
        working: {
          ...state.working,
          items,
        },
        announcement: `${updated.title} owner note updated.`,
        deleted: undefined,
      };
    }
    const change: TimelineChange = {
      id: nextChangeId(state.working, "edit"),
      itemId: current.id,
      kind: "edit",
      publicReason: "Public details were clarified.",
      ownerNote: "The private edit payload is deliberately not copied into the change record.",
      occurredAt: timestamp,
    };
    return withWorkingMutation(state, items, change, `${updated.title} updated.`);
  }

  if (action.type === "move") {
    if (action.to === current.bucket) {
      return { ...state, announcement: `${current.title} is already in ${action.to}.` };
    }
    const suppliedReason = action.reason.trim();
    const fromIndex = BUCKET_INDEX.get(current.bucket) ?? 0;
    const toIndex = BUCKET_INDEX.get(action.to) ?? 0;
    const isBackwardActiveMove = toIndex > fromIndex && (action.to === "soon" || action.to === "later");
    const leavesSettledState = current.bucket === "done" || current.bucket === "refused";
    const reasonRequired = action.to === "refused" || isBackwardActiveMove || leavesSettledState;
    if (reasonRequired && !suppliedReason) {
      return { ...state, announcement: "Add a public reason before moving this item." };
    }
    if (action.to === "refused" && !validDecisionDate(action.date)) {
      return { ...state, announcement: "Add a valid decision date before refusing this item." };
    }

    const timestamp = nextIso(state.working);
    const reason = suppliedReason || (action.to === "done"
      ? "The work was confirmed complete."
      : `The direction became clear enough to move this item to ${action.to}.`);
    const moved: TimelineItem = {
      ...cloneItem(current),
      bucket: action.to,
      secondaryState: secondaryForMove(current, action.to),
      order: 0,
      updatedAt: timestamp,
      decision:
        action.to === "refused"
          ? {
              date: action.date as string,
              publicReason: reason,
              ownerReason: current.decision?.ownerReason,
            }
          : undefined,
    };
    const items = state.working.items.map((entry, index) => {
      if (index === itemIndex) return moved;
      if (entry.bucket === action.to) return { ...cloneItem(entry), order: entry.order + 1 };
      return cloneItem(entry);
    });
    const change: TimelineChange = {
      id: nextChangeId(state.working, action.to === "refused" ? "refuse" : "move"),
      itemId: current.id,
      kind: action.to === "refused" ? "refuse" : "move",
      fromBucket: current.bucket,
      toBucket: action.to,
      publicReason: reason,
      ownerNote: `Owner moved the item from ${current.bucket} to ${action.to}.`,
      occurredAt: timestamp,
    };
    return withWorkingMutation(
      state,
      items,
      change,
      `${current.title} moved to ${action.to}.`,
    );
  }

  if (action.type === "reorder") {
    const bucketItems = groupByBucket(state.working.items)[current.bucket];
    const currentPosition = bucketItems.findIndex((entry) => entry.id === current.id);
    const targetPosition = action.direction === "up" ? currentPosition - 1 : currentPosition + 1;
    if (currentPosition < 0 || targetPosition < 0 || targetPosition >= bucketItems.length) {
      return { ...state, announcement: `${current.title} cannot move ${action.direction} in this section.` };
    }
    const reordered = [...bucketItems];
    const [moving] = reordered.splice(currentPosition, 1);
    reordered.splice(targetPosition, 0, moving);
    const orders = new Map(reordered.map((entry, index) => [entry.id, index]));
    const timestamp = nextIso(state.working);
    const items = state.working.items.map((entry) =>
      entry.bucket === current.bucket
        ? { ...cloneItem(entry), order: orders.get(entry.id) ?? entry.order, updatedAt: entry.id === current.id ? timestamp : entry.updatedAt }
        : cloneItem(entry),
    );
    return {
      ...state,
      working: {
        ...state.working,
        updatedAt: timestamp,
        items,
      },
      selectedItemId: current.id,
      announcement: `${current.title} is position ${targetPosition + 1} of ${reordered.length} in ${current.bucket}.`,
      deleted: undefined,
    };
  }

  if (action.type === "hide" || action.type === "restore") {
    const shouldShow = action.type === "restore";
    if (current.publicVisible === shouldShow) {
      return {
        ...state,
        announcement: `${current.title} is already ${shouldShow ? "visible" : "hidden"}.`,
      };
    }
    const timestamp = nextIso(state.working);
    const items = state.working.items.map((entry, index) =>
      index === itemIndex
        ? { ...cloneItem(entry), publicVisible: shouldShow, updatedAt: timestamp }
        : cloneItem(entry),
    );
    const change: TimelineChange = {
      id: nextChangeId(state.working, action.type),
      itemId: current.id,
      kind: action.type,
      publicReason: shouldShow
        ? "The item returned to the public plan."
        : "The item was removed from the public plan.",
      ownerNote: shouldShow ? "Owner restored public visibility." : "Owner retained the item privately.",
      occurredAt: timestamp,
    };
    return withWorkingMutation(
      state,
      items,
      change,
      `${current.title} ${shouldShow ? "restored" : "hidden from the public plan"}.`,
    );
  }

  if (action.type === "delete") {
    if (current.origin !== "manual") {
      return {
        ...state,
        announcement: "Synced items cannot be deleted here. Hide the item or open it in Signal Tasks.",
      };
    }
    const timestamp = nextIso(state.working);
    const change: TimelineChange = {
      id: nextChangeId(state.working, "delete"),
      itemId: current.id,
      kind: "delete",
      publicReason: "The manual item was removed from the plan.",
      ownerNote: "Fixture deletion can be undone during this session.",
      occurredAt: timestamp,
    };
    const items = state.working.items
      .filter((entry) => entry.id !== current.id)
      .map(cloneItem);
    const nextSelected = firstSelectableId({ ...state.working, items });
    return {
      ...withWorkingMutation(
        state,
        items,
        change,
        `${current.title} deleted. Undo is available.`,
        nextSelected,
      ),
      deleted: { item: cloneItem(current), index: itemIndex },
    };
  }

  return state;
}
