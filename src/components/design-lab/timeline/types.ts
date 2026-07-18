export const TIMELINE_BUCKETS = ["now", "soon", "later", "done", "refused"] as const;

export type TimelineBucket = (typeof TIMELINE_BUCKETS)[number];
export type SecondaryState = "waiting-on-you" | "underway" | "coming-up" | "done" | null;
export type ItemOrigin = "tasks" | "manual";
export type LabOption = "a" | "b" | "c";
export type LabSurface = "owner" | "public" | "update" | "detail";
export type LabDataset = "wedding" | "freelance" | "small-business" | "edge-cases";
export type LabDensity = "sparse" | "normal" | "dense";
export type LabScenario =
  | "default"
  | "empty"
  | "loading"
  | "error"
  | "read-only"
  | "unpublished"
  | "recently-changed";
export type LabViewport = "responsive" | "mobile" | "tablet" | "desktop" | "wide";
export type PreviewSource = "working" | "published";

export interface LabConfig {
  option: LabOption;
  surface: LabSurface;
  dataset: LabDataset;
  density: LabDensity;
  scenario: LabScenario;
  viewport: LabViewport;
  preview: PreviewSource;
  item?: string;
}

export interface TimelineDecision {
  date: string;
  publicReason: string;
  ownerReason?: string;
}

export interface TimelineItem {
  id: string;
  project: string;
  title: string;
  publicSummary: string;
  ownerNote: string;
  bucket: TimelineBucket;
  secondaryState: SecondaryState;
  timing: string;
  confidence: "clear" | "directional" | "open";
  nextStep: string;
  publicVisible: boolean;
  origin: ItemOrigin;
  order: number;
  createdAt: string;
  updatedAt: string;
  decision?: TimelineDecision;
}

export type ChangeKind = "create" | "edit" | "move" | "refuse" | "hide" | "restore" | "delete";

export interface TimelineChange {
  id: string;
  itemId: string;
  kind: ChangeKind;
  fromBucket?: TimelineBucket;
  toBucket?: TimelineBucket;
  publicReason: string;
  ownerNote?: string;
  occurredAt: string;
}

export interface PlanSnapshot {
  slug: string;
  title: string;
  purpose: string;
  author: string;
  revision: number;
  updatedAt: string;
  publishedAt: string | null;
  items: TimelineItem[];
  changes: TimelineChange[];
}

export interface PublicTimelineItem {
  id: string;
  project: string;
  title: string;
  summary: string;
  bucket: TimelineBucket;
  secondaryState: SecondaryState;
  timing: string;
  confidence: "clear" | "directional" | "open";
  nextStep: string;
  order: number;
  updatedAt: string;
  decision?: {
    date: string;
    reason: string;
  };
}

export interface PublicTimelineChange {
  id: string;
  itemId: string;
  kind: ChangeKind;
  fromBucket?: TimelineBucket;
  toBucket?: TimelineBucket;
  reason: string;
  occurredAt: string;
}

export interface PublicPlanDto {
  slug: string;
  title: string;
  purpose: string;
  author: string;
  revision: number;
  updatedAt: string;
  publishedAt: string | null;
  items: PublicTimelineItem[];
  changes: PublicTimelineChange[];
}

export interface DeletedItemReceipt {
  item: TimelineItem;
  index: number;
}

export interface TimelineLabState {
  dataset: LabDataset;
  working: PlanSnapshot;
  published: PlanSnapshot;
  selectedItemId: string;
  announcement: string;
  deleted?: DeletedItemReceipt;
}

export type TimelineLabAction =
  | { type: "reset"; dataset: LabDataset; scenario?: LabScenario }
  | { type: "select"; itemId: string }
  | { type: "add"; title?: string }
  | { type: "edit"; itemId: string; patch: Partial<Pick<TimelineItem, "title" | "publicSummary" | "ownerNote" | "timing" | "confidence" | "nextStep">> }
  | { type: "move"; itemId: string; to: TimelineBucket; reason: string; date?: string }
  | { type: "reorder"; itemId: string; direction: "up" | "down" }
  | { type: "hide"; itemId: string }
  | { type: "restore"; itemId: string }
  | { type: "delete"; itemId: string }
  | { type: "undo-delete" }
  | { type: "publish" };

export const BUCKET_LABELS: Record<TimelineBucket, string> = {
  now: "Now",
  soon: "Soon",
  later: "Later",
  done: "Done",
  refused: "Refused",
};

export const SECONDARY_LABELS: Record<Exclude<SecondaryState, null>, string> = {
  "waiting-on-you": "Waiting on you",
  underway: "Underway",
  "coming-up": "Coming up",
  done: "Done",
};
