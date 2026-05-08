import Link from "next/link";
import type { Task } from "@/server/db/schema";
import { KindPill } from "./kind-pill";

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
}: {
  task: Task;
  workspaceSlug: string;
  projectAccent: string;
  projectName: string;
  showProject?: boolean;
}) {
  const isDone = task.status === "shipped";
  const isDoing = task.status === "in-flight";
  const isStuck = task.status === "blocked";

  const rowBg =
    task.isLaunch && !isDone
      ? "color-mix(in srgb, var(--roadmap-violet-bg) 60%, var(--bg-elevated))"
      : "var(--bg-elevated)";

  const checkBg = isDone
    ? "var(--status-shipped)"
    : isDoing
      ? "var(--status-flight)"
      : isStuck
        ? "var(--status-blocked)"
        : "transparent";

  const checkBorder = isDone
    ? "var(--status-shipped)"
    : isDoing
      ? "var(--status-flight)"
      : isStuck
        ? "var(--status-blocked)"
        : "var(--ink-quiet)";

  return (
    <li
      className={
        "grid grid-cols-[20px_1fr] grid-rows-[auto_auto] items-start gap-x-3 gap-y-1 border-b border-line-faint px-3 py-2.5 last:border-b-0 hover:bg-bg-tinted/40 transition-colors sm:grid-cols-[20px_72px_56px_1fr_auto] sm:grid-rows-1 sm:gap-y-0 sm:py-2 " +
        (isDone ? "opacity-60" : "")
      }
      style={{ background: rowBg }}
    >
      {/* Status indicator — read-only dot */}
      <span
        aria-label={`Status: ${task.status}`}
        className="row-start-1 mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border"
        style={{ background: checkBg, borderColor: checkBorder }}
      >
        {isDone ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : isDoing ? (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "white" }}
          />
        ) : null}
      </span>

      {/* Date — desktop only */}
      <div className="hidden text-[10.5px] tabular-nums leading-[1.4] text-ink-quiet sm:block">
        {task.targetDate ? (
          <div>{task.targetDate.slice(5)}</div>
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </div>

      {/* Kind badge — desktop only */}
      <div className="hidden flex-wrap gap-1 sm:flex">
        <KindPill kind={task.kind} size="sm" />
      </div>

      {/* Title + meta */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {showProject ? (
            <Link
              href={`/${workspaceSlug}/${task.projectSlug}`}
              className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ink-quiet transition-colors hover:text-ink"
            >
              <span
                aria-hidden
                className="inline-block h-1 w-1 rounded-full"
                style={{ background: projectAccent }}
              />
              {projectName}
            </Link>
          ) : null}
          {task.isLaunch ? (
            <span
              className="rounded px-1 py-px text-[9.5px] font-semibold uppercase tracking-[0.08em]"
              style={{
                background: "var(--roadmap-violet-bg)",
                color: "var(--roadmap-violet-fg)",
              }}
            >
              Launch
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <Link
            href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
            className={
              "text-[13px] font-medium leading-[1.4] tracking-[-0.005em] transition-colors hover:underline " +
              (isDone ? "text-ink-quiet line-through" : "text-ink")
            }
          >
            {task.title}
          </Link>
        </div>
        {task.description && task.kind !== "cycle" ? (
          <p className="mt-1 truncate text-[11px] leading-[1.4] text-ink-quiet">
            {task.description}
          </p>
        ) : null}
      </div>

      {/* Right: date + kind inline (mobile), open link (desktop) */}
      <div className="row-start-2 col-start-2 flex flex-wrap items-center gap-2 text-[10.5px] text-ink-quiet sm:row-start-1 sm:col-start-5 sm:self-center">
        <span className="sm:hidden tabular-nums">
          {task.targetDate ? task.targetDate.slice(5) : "—"}
        </span>
        <span className="sm:hidden">
          <KindPill kind={task.kind} size="sm" />
        </span>
        <Link
          href={`/${workspaceSlug}/${task.projectSlug}/${task.id}`}
          className="ml-auto transition-colors hover:text-ink sm:ml-0"
          aria-label="Open item"
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
