import type { DemoRowStatus, DomainId } from "@/lib/domains";

export type RowStatus = DemoRowStatus;

export type Row = {
  id: string;
  title: string;
  status: RowStatus;
  date: string;
  /** Set when an item just transitioned, drives the mono "moved at" pip */
  movedAt?: string;
};

export type ViewerId = "a" | "b" | "c";

export type Viewer = {
  id: ViewerId;
  /** Lane index (0..3) the viewer is reading from, drives vertical position */
  laneIndex: number;
  visible: boolean;
};

export type Scene =
  | "boot"
  | "viewers-arrive"
  | "first-move"
  | "tick-up-1"
  | "second-move"
  | "tick-up-2"
  | "third-move"
  | "viewers-leave"
  | "reset";

export type DemoState = {
  rows: Row[];
  viewers: Viewer[];
  viewCount: number;
  scene: Scene;
  /** Active domain pack — when this changes the demo resets. */
  domain: DomainId;
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
