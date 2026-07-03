import Link from "next/link";
import type { Task } from "@/server/db/schema";
import { StatusPill } from "./status-pill";
import { KindPill } from "./kind-pill";

/**
 * Card-style task row for project drill-down pages.
 * De-Ethanized: no hardcoded project map, no assignee pill, no cycle labels.
 * Project identity supplied via props from the project row.
 */
export function TaskRow({
  task,
  workspaceSlug,
  projectAccent,
  projectName,
  showProject = true,
  href,
}: {
  task: Task;
  workspaceSlug: string;
  projectAccent: string;
  projectName: string;
  showProject?: boolean;
  href?: string;
}) {
  const TitleEl = href ? Link : ("span" as const);
  const titleProps = href ? { href } : {};

  return (
    <article className="rounded-xl border border-line-soft bg-bg-elevated p-4 transition-colors hover:border-ink-quiet/30 md:p-5">
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showProject ? (
              <Link
                href={`/${workspaceSlug}/${task.projectSlug}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: projectAccent }}
                />
                {projectName}
              </Link>
            ) : null}
            {task.targetDate ? (
              <span className="text-[10.5px] tabular-nums text-ink-quiet">
                · {task.targetDate}
              </span>
            ) : null}
            <KindPill kind={task.kind} size="sm" />
          </div>
          <h3 className="mt-2 text-[15.5px] font-semibold tracking-[-0.005em] text-ink">
            {/* @ts-expect-error, Link/span polymorphism */}
            <TitleEl
              {...titleProps}
              className={
                href ? "transition-colors hover:text-highlight" : undefined
              }
            >
              {task.title}
            </TitleEl>
          </h3>
          {task.description ? (
            <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-soft">
              {task.description}
            </p>
          ) : null}
        </div>
        <StatusPill status={task.status} />
      </header>

      {href ? (
        <div className="mt-3 border-t border-line-soft pt-3">
          <Link
            href={href}
            className="text-[11.5px] font-medium text-ink-quiet transition-colors hover:text-ink"
          >
            Open detail →
          </Link>
        </div>
      ) : null}
    </article>
  );
}
