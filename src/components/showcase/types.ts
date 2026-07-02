import type { DemoRowStatus, DomainId } from "@/lib/domains";

export type RowStatus = DemoRowStatus;
// Demo view modes (showcase). "gantt" = duration bars on a month axis;
// "timeline" = a straight line with milestone points. (2026-06-20: the demo
// dropped its old "list" mode to mirror the product's two views.)
export type ViewMode = "gantt" | "timeline";

// ── Public workspace view switcher ──────────────────────────────────────────
// Two public views (2026-06-20 — replaced Overview/Roadmap/Milestones/Schedule):
//   · "gantt"    — one bar per item across a month axis, grouped by project.
//                  The default view (bare URL, no ?view= param).
//   · "timeline" — a straight line with milestones plotted as points by date.
// Keep this union in sync with the VIEWS array in workspace-view-switcher.tsx,
// the rawView guards in workspace-view-client.tsx, and the pre-paint script +
// CSS in [workspaceSlug]/page.tsx.
export type WorkspaceView = "gantt" | "timeline";

export type Row = {
  id: string;
  title: string;
  status: RowStatus;
  date: string;
  startMonth: number;
  endMonth: number;
  /** Set when an item just transitioned, drives the mono "moved at" pip */
  movedAt?: string;
};

export type CursorId = "alpha" | "beta" | "gamma";

export type Cursor = {
  id: CursorId;
  /** Hex/CSS color used for the arrow + label chip. */
  color: string;
  /** Short location/recency chip shown when reading. */
  label: string;
  /** Pixel x relative to surface. */
  x: number;
  /** Pixel y relative to surface. */
  y: number;
  visible: boolean;
  /** True when paused on a row — drives the chip render. */
  reading: boolean;
  /** Row id being targeted; null when in transit / idle. */
  targetRowId: string | null;
};

export type Scene =
  | "boot"
  | "cursors-arrive"
  | "first-move"
  | "tick-up-1"
  | "second-move"
  | "tick-up-2"
  | "third-move"
  | "share-copy"
  | "view-morph-timeline"
  | "timeline-hold"
  | "rss-arrival"
  | "view-morph-gantt"
  | "cursor-lingers"
  | "cursors-leave"
  | "reset";

export type DemoState = {
  rows: Row[];
  cursors: Cursor[];
  viewCount: number;
  scene: Scene;
  view: ViewMode;
  domain: DomainId;
  /** Toast variant currently visible, or null. */
  toast: "copied" | "subscribed" | null;
  /** RSS follower count — folded into DemoState so buildInitialState resets it. */
  followers: number;
  /** Whether the Share button is in its pressed animation state. */
  sharePressed: boolean;
};

// Canonical plain-English labels — must match the real product's Status type.
// DB schema: next | in-flight | shipped | waiting | refused
// Demo vocab: next | doing (=in-flight) | shipped | held (=waiting)
// Map: doing→"Doing", held→"Waiting", retired aliases removed.
export const STATUS_LABEL: Record<RowStatus, string> = {
  shipped: "Done",
  doing: "Doing",
  held: "Waiting",
  next: "Next",
};

export const STATUS_ORDER: RowStatus[] = ["shipped", "doing", "held", "next"];

export const STATUS_TOKEN: Record<RowStatus, string> = {
  shipped: "var(--status-shipped)",
  doing: "var(--status-flight)",
  held: "var(--status-waiting)",
  next: "var(--status-next)",
};

export const MORPH_DURATION_S = 0.72;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Cursor identities — public-visitor framing, anonymous indigo tones.
export const CURSOR_SEED: Cursor[] = [
  {
    id: "alpha",
    color: "var(--accent)",
    label: "Dublin · 14m ago",
    x: -30,
    y: 60,
    visible: false,
    reading: false,
    targetRowId: null,
  },
  {
    id: "beta",
    color: "var(--indigo-500)",
    label: "London · just now",
    x: -30,
    y: 180,
    visible: false,
    reading: false,
    targetRowId: null,
  },
  {
    id: "gamma",
    color: "var(--indigo-400)",
    label: "Cork · 2h ago",
    x: -30,
    y: 320,
    visible: false,
    reading: false,
    targetRowId: null,
  },
];
