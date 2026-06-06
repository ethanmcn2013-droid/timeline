import Link from "next/link";
import type { Task } from "@/server/db/schema";

/** Days between a past Date and today, floored at 0. */
function dwellDaysSince(since: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((Date.now() - since.getTime()) / msPerDay));
}

/**
 * Read-only blocker card for the public roadmap surface.
 * Project accent comes from the project row — no hardcoded map.
 */
export function BlockerCard({
  blocker,
  workspaceSlug,
  projectAccent,
}: {
  blocker: Task;
  workspaceSlug: string;
  projectAccent: string;
}) {
  const isResolved = blocker.status === "shipped";
  const dwell = dwellDaysSince(new Date(blocker.createdAt));
  const dwellLabel =
    dwell === 1 ? "blocked for 1 day" : `blocked for ${dwell} days`;
  const isOverdue = dwell > 14;

  return (
    <article
      className={
        "rounded-xl border p-4 " +
        (isResolved
          ? "border-line-soft bg-bg-elevated/40 opacity-55"
          : "border-line bg-bg-elevated")
      }
    >
      <div className="flex items-start gap-3">
        {/* Resolved indicator */}
        <span
          aria-label={isResolved ? "Resolved" : "Blocked"}
          className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border"
          style={{
            background: isResolved ? "var(--status-shipped)" : "transparent",
            borderColor: isResolved
              ? "var(--status-shipped)"
              : "var(--alarm)",
          }}
        >
          {isResolved ? (
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
          ) : null}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: projectAccent }}
              title={blocker.projectSlug}
            />
            <Link
              href={`/${workspaceSlug}/${blocker.projectSlug}/${blocker.id}`}
              className={
                "text-[12.5px] font-semibold tracking-[-0.005em] transition-colors hover:underline " +
                (isResolved ? "text-ink-quiet line-through" : "text-ink")
              }
            >
              {blocker.title}
            </Link>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px]">
            {blocker.targetDate ? (
              <span className="tabular-nums text-ink-quiet">
                {blocker.targetDate}
              </span>
            ) : null}
            {blocker.unblocks ? (
              <span className="tabular-nums text-ink-quiet">
                · affects {blocker.unblocks} item
                {blocker.unblocks === 1 ? "" : "s"}
              </span>
            ) : null}
            {!isResolved ? (
              isOverdue ? (
                <span
                  className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-px font-semibold uppercase tracking-[0.08em]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--alarm) 12%, transparent)",
                    color: "var(--alarm)",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: "var(--alarm)" }}
                  />
                  two weeks
                </span>
              ) : (
                <span className="ml-auto tabular-nums text-ink-quiet">
                  {dwellLabel}
                </span>
              )
            ) : null}
          </div>

          {blocker.description ? (
            <p className="mt-2 text-[11.5px] leading-[1.55] text-ink-soft">
              {blocker.description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
