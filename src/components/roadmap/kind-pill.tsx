import type { Kind } from "@/server/db/schema";

const KIND_META: Record<Kind, { label: string; bg: string; fg: string }> = {
  cycle: {
    label: "Update",
    bg: "var(--bg-sunken)",
    fg: "var(--ink-quiet)",
  },
  post: {
    label: "Post",
    bg: "var(--roadmap-indigo-bg)",
    fg: "var(--roadmap-indigo-fg)",
  },
  asset: {
    label: "Asset",
    bg: "var(--roadmap-stone-bg)",
    fg: "var(--roadmap-stone-fg)",
  },
  press: {
    label: "Press",
    bg: "var(--roadmap-rose-bg)",
    fg: "var(--roadmap-rose-fg)",
  },
  paid: {
    label: "Paid",
    bg: "var(--roadmap-amber-bg)",
    fg: "var(--roadmap-amber-fg)",
  },
  launch: {
    label: "Launch",
    bg: "var(--roadmap-violet-bg)",
    fg: "var(--roadmap-violet-fg)",
  },
  kpi: {
    label: "KPI",
    bg: "var(--roadmap-emerald-bg)",
    fg: "var(--roadmap-emerald-fg)",
  },
  milestone: {
    label: "Milestone",
    bg: "var(--bg-sunken)",
    fg: "var(--ink-quiet)",
  },
  action: {
    label: "Action",
    bg: "var(--bg-sunken)",
    fg: "var(--ink-quiet)",
  },
  blocker: {
    label: "Blocker",
    bg: "var(--roadmap-red-bg)",
    fg: "var(--roadmap-red-fg)",
  },
  refusal: {
    label: "Won't do",
    bg: "var(--status-refused-bg)",
    fg: "var(--status-refused)",
  },
};

/** Only render a pill for non-default kinds. "action" and "cycle" are ambient, no pill needed. */
const SILENT_KINDS: Kind[] = ["action", "cycle"];

export function KindPill({
  kind,
  size = "md",
  forceShow = false,
}: {
  kind: Kind;
  size?: "sm" | "md";
  forceShow?: boolean;
}) {
  if (!forceShow && SILENT_KINDS.includes(kind)) return null;

  const meta = KIND_META[kind];
  const cls =
    size === "sm"
      ? "text-[9.5px] px-1.5 py-0.5"
      : "text-[10px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-[0.08em] ${cls}`}
      style={{ background: meta.bg, color: meta.fg }}
    >
      {meta.label}
    </span>
  );
}

export const KIND_DISPLAY = KIND_META;
