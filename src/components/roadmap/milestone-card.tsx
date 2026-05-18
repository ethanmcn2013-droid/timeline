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
 * StatusCircle — 8px outlined status indicator.
 * CREATIVE_SPEC §1.2: milestones use indigo border; regular nodes use ghost border.
 * Mirrors the StatusCircle in curation-surface.tsx so the public card and the
 * authoring surface share the same visual grammar ("one artifact, two zoom levels").
 *
 * Milestone (isMilestone=true): indigo border, no fill (except In flight = 50%).
 * Shipped: solid ghost fill + ghost border.
 * In flight: 50% opacity ghost fill + indigo or ghost border per isMilestone.
 * Later: dashed ghost border, transparent fill.
 * Next (default): empty, ghost or indigo border.
 */
export function StatusCircle({
  status,
  isMilestone,
}: {
  status: Task["status"];
  isMilestone: boolean;
}) {
  const accentBorder = `1.5px solid var(--accent, #4f46e5)`;
  const ghostBorder = `1.5px solid var(--ink-ghost, #d4d4d8)`;

  const base: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-block",
    marginTop: 3,
  };

  if (status === "shipped") {
    // Filled solid ghost — paired with the strikethrough title (§1.2).
    return (
      <span
        aria-hidden
        style={{
          ...base,
          background: "var(--ink-ghost, #d4d4d8)",
          border: ghostBorder,
        }}
      />
    );
  }

  if (status === "in-flight") {
    // Half-filled — 50% opacity ghost fill. Border is indigo for milestones.
    return (
      <span
        aria-hidden
        style={{
          ...base,
          background: "color-mix(in srgb, var(--ink-ghost, #d4d4d8) 50%, transparent)",
          border: isMilestone ? accentBorder : ghostBorder,
        }}
      />
    );
  }

  // Next (default) — empty outline. Indigo for milestones, ghost for regular.
  return (
    <span
      aria-hidden
      style={{
        ...base,
        background: "transparent",
        border: isMilestone ? accentBorder : ghostBorder,
      }}
    />
  );
}

/**
 * One milestone card for the public Overview view.
 *
 * CREATIVE_SPEC §1.2 milestone elevation:
 *   1. Indigo-bordered StatusCircle (outlined, not filled accent dot).
 *   2. Title font-weight: 600.
 *   3. Quiet accent-soft left border on the row container.
 *   No "Reached" / status-coloured label — typographic hierarchy, not colour.
 *
 * Progress is the share of eligible items (non-refused) due on or
 * before this milestone that have shipped. When no items are dated,
 * progress falls back to the overall workspace ratio so the dial is
 * never empty for early-stage roadmaps.
 */
export function MilestoneCard({
  milestone,
  workspaceSlug,
  progress,
  itemsInScope,
  itemsShipped,
}: {
  milestone: Task;
  workspaceSlug: string;
  /** projectAccent removed — §1.2 bans colour-coded status dots on public view */
  progress: number;
  itemsInScope: number;
  itemsShipped: number;
}) {
  const isShipped = milestone.status === "shipped";
  const d = milestone.targetDate ? daysUntil(milestone.targetDate) : null;
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <article
      style={{
        // CREATIVE_SPEC §1.2: milestone row gets a quiet accent-soft left border.
        // No card shadow, no background colour — presence through weight and the
        // single indigo line, not decoration.
        borderLeft: "2px solid var(--accent-soft, rgba(79,70,229,0.12))",
        borderTop: "1px solid var(--hairline, #e4e4e7)",
        borderRight: "1px solid var(--hairline, #e4e4e7)",
        borderBottom: "1px solid var(--hairline, #e4e4e7)",
        borderRadius: 10,
        padding: "16px",
        transition: "border-color 160ms ease-out",
        opacity: isShipped ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* CREATIVE_SPEC §1.2: 8px outlined status circle, not a filled accent dot */}
        <StatusCircle status={milestone.status} isMilestone />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0 8px" }}>
            <Link
              href={`/${workspaceSlug}/${milestone.projectSlug}/${milestone.id}`}
              style={{
                // CREATIVE_SPEC §1.2: title font-weight 600 for milestone (elevation #2).
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
                color: isShipped
                  ? "color-mix(in srgb, var(--ink) 70%, transparent)"
                  : "var(--ink)",
                textDecoration: isShipped ? "line-through" : "none",
              }}
            >
              {milestone.title}
            </Link>
            {milestone.targetDate ? (
              <span
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 11,
                  color: "var(--ink-quiet)",
                  letterSpacing: "0.02em",
                  tabularNums: true,
                } as React.CSSProperties}
              >
                {formatShort(milestone.targetDate)}
              </span>
            ) : null}
          </div>

          {milestone.description ? (
            <p
              style={{
                marginTop: 4,
                fontSize: 11.5,
                lineHeight: 1.45,
                color: "var(--ink-soft)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}
            >
              {milestone.description}
            </p>
          ) : null}

          {/* Progress strip */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                height: 4,
                flex: 1,
                overflow: "hidden",
                borderRadius: 9999,
                background: "var(--line-soft, #f0f0f0)",
              }}
              aria-hidden
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 9999,
                  width: `${pct}%`,
                  // CREATIVE_SPEC §1.7: indigo budget — accent NOT used on progress bars.
                  // Shipped uses status-shipped token; active uses ink-quiet (typographic).
                  background: isShipped
                    ? "var(--status-shipped)"
                    : "var(--ink-quiet)",
                  transition: "width 400ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono-stack)",
                fontSize: 10.5,
                color: "var(--ink-quiet)",
                tabularNums: true,
                flexShrink: 0,
              } as React.CSSProperties}
            >
              {itemsShipped}/{itemsInScope}
            </span>
          </div>

          {/* Countdown — CREATIVE_SPEC §1.3: T-N relative indicator on milestone only */}
          {d !== null && !isShipped ? (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <CountdownChip days={d} />
              {pct < 100 ? (
                <span
                  style={{
                    fontFamily: "var(--font-mono-stack)",
                    fontSize: 10.5,
                    color: "var(--ink-quiet)",
                  }}
                >
                  {pct}% done
                </span>
              ) : null}
            </div>
          ) : null}
          {/* CREATIVE_SPEC §1.2: no "Reached"/status-coloured label on public view.
              Shipped is communicated via strikethrough title + filled ghost circle. */}
        </div>
      </div>
    </article>
  );
}

/**
 * Compact countdown.
 * CREATIVE_SPEC §1.4: only T-N uses var(--accent) colour.
 * Overdue uses −Nd in var(--ink-quiet) — no status-red on a content surface.
 */
function CountdownChip({ days }: { days: number }) {
  if (days === 0) {
    return (
      <span
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 10.5,
          fontWeight: 600,
          // CREATIVE_SPEC §1.7: T-N countdown uses var(--accent) — one of six named uses.
          color: "var(--accent, #4f46e5)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Today
      </span>
    );
  }
  if (days < 0) {
    return (
      <span
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 10.5,
          color: "var(--ink-quiet)",
          letterSpacing: "0.02em",
        }}
      >
        {"−"}{Math.abs(days)}d
      </span>
    );
  }
  return (
    <span
      style={{
        fontFamily: "var(--font-mono-stack)",
        fontSize: 10.5,
        fontWeight: 600,
        // CREATIVE_SPEC §1.4 + §1.7: T-N is the one place var(--accent) appears in node list.
        color: "var(--accent, #4f46e5)",
        letterSpacing: "0.02em",
      }}
    >
      T-{days}
    </span>
  );
}
