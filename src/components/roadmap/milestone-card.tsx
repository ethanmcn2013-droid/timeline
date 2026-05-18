import Link from "next/link";
import type { Task } from "@/server/db/schema";

/**
 * Format an ISO date string as "Jun 12" (month abbrev + day).
 * Year appended only when it differs from the current calendar year.
 * CREATIVE_SPEC §1.3 — "always ISO-derived but displayed human."
 */
function formatShort(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month, day);
  const currentYear = new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(year !== currentYear ? { year: "numeric" } : {}),
  });
}

/** Days-until in calendar days, signed. Negative = in the past. */
function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00Z");
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((target.getTime() - todayUTC) / msPerDay);
}

/**
 * One milestone card. Mirrors the Tasks GTM "launch beat" rhythm:
 * date, T-N countdown, progress-toward-milestone, name.
 *
 * Progress is the share of *eligible* items (non-refused) due on or
 * before this milestone that have shipped. When no items are dated,
 * progress falls back to the overall workspace ratio so the dial is
 * never empty for early-stage roadmaps.
 */
export function MilestoneCard({
  milestone,
  workspaceSlug,
  projectAccent,
  progress,
  itemsInScope,
  itemsShipped,
}: {
  milestone: Task;
  workspaceSlug: string;
  projectAccent: string;
  progress: number;
  itemsInScope: number;
  itemsShipped: number;
}) {
  const isShipped = milestone.status === "shipped";
  const d = milestone.targetDate ? daysUntil(milestone.targetDate) : null;
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <article
      className={
        "rounded-xl border p-4 transition-colors " +
        (isShipped
          ? "border-line-soft bg-bg-elevated/40 opacity-70"
          : "border-line bg-bg-elevated hover:border-ink-quiet")
      }
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ background: projectAccent }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/${workspaceSlug}/${milestone.projectSlug}/${milestone.id}`}
              className={
                "text-[13.5px] font-semibold tracking-[-0.005em] transition-colors hover:underline " +
                (isShipped ? "text-ink-quiet line-through" : "text-ink")
              }
            >
              {milestone.title}
            </Link>
            {milestone.targetDate ? (
              <span className="text-[10.5px] tabular-nums text-ink-quiet">
                {formatShort(milestone.targetDate)}
              </span>
            ) : null}
          </div>

          {milestone.description ? (
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-[1.45] text-ink-soft">
              {milestone.description}
            </p>
          ) : null}

          {/* Progress strip */}
          <div className="mt-3 flex items-center gap-2.5">
            <div
              className="h-1 flex-1 overflow-hidden rounded-full"
              style={{ background: "var(--line-soft)" }}
              aria-hidden
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: isShipped
                    ? "var(--status-shipped)"
                    : projectAccent,
                }}
              />
            </div>
            <span className="text-[10.5px] tabular-nums text-ink-quiet">
              {itemsShipped}/{itemsInScope}
            </span>
          </div>

          {/* Countdown row */}
          {d !== null && !isShipped ? (
            <div className="mt-2 flex items-center gap-2 text-[10.5px]">
              <CountdownChip days={d} />
              {pct < 100 ? (
                <span className="tabular-nums text-ink-quiet">
                  {pct}% done
                </span>
              ) : null}
            </div>
          ) : isShipped ? (
            <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-status-shipped">
              <span style={{ color: "var(--status-shipped)" }}>Reached</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Compact T-N pill. Negative days → "OVERDUE". 0 → "TODAY". */
function CountdownChip({ days }: { days: number }) {
  if (days === 0) {
    return (
      <span
        className="inline-flex items-center rounded px-1.5 py-px font-semibold uppercase tracking-[0.08em]"
        style={{
          background: "color-mix(in srgb, var(--status-flight) 14%, transparent)",
          color: "var(--status-flight)",
        }}
      >
        Today
      </span>
    );
  }
  if (days < 0) {
    return (
      <span
        className="inline-flex items-center rounded px-1.5 py-px font-semibold uppercase tracking-[0.08em]"
        style={{
          background: "color-mix(in srgb, var(--status-blocked) 14%, transparent)",
          color: "var(--status-blocked)",
        }}
      >
        Overdue · {Math.abs(days)}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded bg-bg-deep px-1.5 py-px font-semibold uppercase tracking-[0.08em] text-ink-soft">
      T-{days}
    </span>
  );
}
