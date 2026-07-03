import Link from "next/link";
import type { Task } from "@/server/db/schema";
import { KindPill } from "./kind-pill";
import { StatusCircle, MilestoneGlyph, isMilestoneItem } from "./milestone-card";
import type { AttentionReason } from "@/lib/roadmap/needs-attention";

/**
 * Compact read-only item row for the dense public roadmap list.
 * De-Ethanized: no hardcoded project maps, no agent assignees, no
 * cycle status action. Project identity comes from the accent prop
 * derived from the project row.
 */
export function ItemRow({
  task,
  workspaceSlug,
  projectAccent,
  projectName,
  showProject = true,
  milestoneLabel,
  attentionReason,
  isOwner = false,
}: {
  task: Task;
  workspaceSlug: string;
  projectAccent: string;
  projectName: string;
  showProject?: boolean;
  /** When set, renders a soft "→ <milestoneLabel>" line under the
   *  title. Owner: the page computes which milestone this item rolls
   *  up to based on date; the row just renders the string. */
  milestoneLabel?: string | null;
  /** Owner-only Tier 3 attention indicator. The page passes the value
   *  only when the current user is the workspace owner, public
   *  stakeholders never receive it, so the indicator can never leak. */
  attentionReason?: AttentionReason | null;
  /** Threaded from the page so the KIND pill (PAID/POST/KPI/etc.) only
   *  renders for the workspace owner. The eleven-kind taxonomy is
   *  internal vocabulary, a stakeholder reading the public plan should
   *  see the work, not the marketing-team categories it lives under. */
  isOwner?: boolean;
}) {
  const isDone = task.status === "shipped";
  const isDoing = task.status === "in-flight";
  const isStuck = task.status === "waiting";
  const isMilestone = isMilestoneItem(task);

  const rowBg =
    task.isLaunch && !isDone
      ? "color-mix(in srgb, var(--roadmap-violet-bg) 60%, var(--bg-elevated))"
      : "var(--bg-elevated)";

  return (
    <li
      className={
        "grid grid-cols-[20px_1fr] grid-rows-[auto_auto] items-start gap-x-3 gap-y-1 border-b border-line-faint px-3 py-2.5 last:border-b-0 hover:bg-bg-tinted/40 sm:grid-cols-[20px_72px_56px_1fr_auto] sm:grid-rows-1 sm:gap-y-0 sm:py-2 " +
        (isDone ? "opacity-60" : "")
      }
      style={{
        background: rowBg,
        transition: "background var(--motion-fast) var(--ease-standard)",
      }}
    >
      {/* Status indicator, §1.2 outlined grammar, no status-palette colours.
          Milestones swap the round circle for the indigo diamond so a dated
          moment is legible at a glance without a second accent colour. */}
      <span
        aria-label={
          isMilestone ? `Milestone · ${task.status}` : `Status: ${task.status}`
        }
        className="row-start-1 inline-flex flex-shrink-0 items-start pt-[3px]"
      >
        {isMilestone ? (
          <MilestoneGlyph status={task.status} />
        ) : (
          <StatusCircle status={task.status} isMilestone={false} />
        )}
      </span>

      {/* Date, desktop only */}
      <div className="hidden text-[10.5px] tabular-nums leading-[1.4] text-ink-quiet sm:block">
        {task.targetDate ? (
          <div>{task.targetDate.slice(5)}</div>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </div>

      {/* Kind badge, desktop only. Owner-only: the eleven-kind taxonomy
          (POST / ASSET / PRESS / PAID / KPI / etc.) reads as marketing-team
          vocabulary on the public surface, a stakeholder seeing "PAID" next
          to a deposit item reads it as "paid for". Hidden for non-owners. */}
      {isOwner ? (
        <div className="hidden flex-wrap gap-1 sm:flex">
          <KindPill kind={task.kind} size="sm" />
        </div>
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}

      {/* Title + meta */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {showProject ? (
            <Link
              href={`/${workspaceSlug}/${task.projectSlug}`}
              className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-quiet hover:text-ink"
              style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
            >
              <span
                aria-hidden
                className="inline-block h-1 w-1 rounded-full"
                style={{ background: projectAccent }}
              />
              {projectName}
            </Link>
          ) : null}
          {isMilestone ? (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[0.08em]"
              style={{
                background: "var(--accent-soft, #eef2ff)",
                color: "var(--accent-deep, #4338ca)",
              }}
            >
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5"
                style={{
                  transform: "rotate(45deg)",
                  borderRadius: 1,
                  border: "1.25px solid currentColor",
                }}
              />
              Milestone
            </span>
          ) : null}
          {attentionReason ? (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[0.08em]"
              style={{
                background:
                  "color-mix(in srgb, var(--status-flight) 12%, transparent)",
                color: "var(--status-flight)",
              }}
              aria-label={
                attentionReason === "overdue"
                  ? "Needs attention: overdue"
                  : "Needs attention: idle"
              }
              title={
                attentionReason === "overdue"
                  ? "Past its target date"
                  : "Idle for 14+ days"
              }
            >
              <span
                aria-hidden
                className="inline-block h-1 w-1 rounded-full"
                style={{ background: "var(--status-flight)" }}
              />
              {attentionReason === "overdue" ? "Overdue" : "Idle"}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <Link
            href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
            className={
              "text-[13px] font-medium leading-[1.4] tracking-[-0.005em] hover:underline " +
              (isDone ? "text-ink-quiet line-through" : "text-ink")
            }
            style={{ transition: "color var(--motion-fast) var(--ease-standard), opacity var(--motion-fast) var(--ease-standard)" }}
          >
            {task.title}
          </Link>
        </div>
        {task.description && task.kind !== "cycle" ? (
          <p className="mt-1 truncate text-[11px] leading-[1.4] text-ink-quiet">
            {task.description}
          </p>
        ) : null}
        {milestoneLabel ? (
          <p className="mt-1 flex items-center gap-1 truncate text-[10.5px] leading-[1.4] text-ink-quiet">
            <svg
              className="shrink-0"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
            for{" "}
            <span className="font-medium text-ink-soft">{milestoneLabel}</span>
          </p>
        ) : null}
      </div>

      {/* Right: date + kind inline (mobile), open link (desktop) */}
      <div className="row-start-2 col-start-2 flex flex-wrap items-center gap-2 text-[10.5px] text-ink-quiet sm:row-start-1 sm:col-start-5 sm:self-center">
        <span className="sm:hidden tabular-nums">
          {task.targetDate ? task.targetDate.slice(5) : "—"}
        </span>
        {isOwner ? (
          <span className="sm:hidden">
            <KindPill kind={task.kind} size="sm" />
          </span>
        ) : null}
        <Link
          href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
          className="ml-auto hover:text-ink sm:ml-0"
          aria-label="Open item"
          style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </li>
  );
}
