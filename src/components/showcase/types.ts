import type { DemoRowStatus, DomainId } from "@/lib/domains";

export type RowStatus = DemoRowStatus;
export type ViewMode = "list" | "timeline";

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
  | "view-morph-list"
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

export const STATUS_LABEL: Record<RowStatus, string> = {
  shipped: "Shipped",
  doing: "Doing",
  held: "Held up",
  next: "Next",
};

export const STATUS_ORDER: RowStatus[] = ["shipped", "doing", "held", "next"];

export const STATUS_TOKEN: Record<RowStatus, string> = {
  shipped: "var(--status-shipped)",
  doing: "var(--status-flight)",
  held: "var(--status-blocked)",
  next: "var(--status-next)",
};

export const MORPH_DURATION_S = 0.72;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Cursor identities — public-visitor framing, anonymous indigo tones.
export const CURSOR_SEED: Cursor[] = [
  {
    id: "alpha",
    color: "#4f46e5",
    label: "Dublin · 14m ago",
    x: -30,
    y: 60,
    visible: false,
    reading: false,
    targetRowId: null,
  },
  {
    id: "beta",
    color: "#7c5cff",
    label: "London · just now",
    x: -30,
    y: 180,
    visible: false,
    reading: false,
    targetRowId: null,
  },
  {
    id: "gamma",
    color: "#5b6cff",
    label: "Cork · 2h ago",
    x: -30,
    y: 320,
    visible: false,
    reading: false,
    targetRowId: null,
  },
];
