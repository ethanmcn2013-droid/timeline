/**
 * LaneNodeList, the RW-4 public roadmap artifact node view.
 *
 * Renders synced milestone nodes grouped by lane (Next / In flight / Shipped / Later).
 * One artifact, two zoom levels: authoring and public views share the same
 * visual DNA (CREATIVE_SPEC §1 governing principle).
 *
 * Visual grammar per CREATIVE_SPEC §1.1–§1.3:
 *   - Lane identity is typographic + positional, never colour-coded pills
 *   - Status circle: 8px, outline only, indigo border on milestones only
 *   - Shipped: line-through title at 70% opacity
 *   - Later: dashed circle border, no date
 *   - Node: hairline separator, no card border-radius on individual rows
 *   - Container: border-radius: 10px (--r-3), border: 1px solid var(--hairline)
 *
 * Single-indigo rule (CREATIVE_SPEC §1.7):
 *   - Status circle border on milestone nodes only (1.5px)
 *   - Left border on milestone rows (2px solid --accent-soft / indigo-soft)
 *   - Nothing else in this component touches indigo
 *
 * Public viewer: BigStat tones removed (CREATIVE_SPEC §1.6, content surface,
 * not functional UI).
 */

import type { EffectiveNode } from "@/server/db/queries";

// ── Date formatting (CREATIVE_SPEC §1.3) ──────────────────────────────────────

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatNodeDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  const month = MONTH_ABBR[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  return year !== currentYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
}

function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00Z").getTime();
  const today = new Date();
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target - todayUTC) / (1000 * 60 * 60 * 24));
}

// ── Lane separator (CREATIVE_SPEC §1.5) ──────────────────────────────────────

function LaneSeparator({ lane }: { lane: string }) {
  return (
    <div
      style={{
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
        paddingBottom: 4,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 11,
          textTransform: "uppercase" as const,
          letterSpacing: "0.14em",
          color: "var(--ink-quiet, #71717a)",
        }}
      >
        {lane}
      </span>
    </div>
  );
}

// ── Status circle (CREATIVE_SPEC §1.2) ───────────────────────────────────────

function NodeCircle({ lane }: { lane: string }) {
  // Single indigo rule: border only on milestone nodes (every node here IS a milestone)
  const base: React.CSSProperties = {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: 3,
  };

  if (lane === "Shipped") {
    return (
      <span
        style={{
          ...base,
          background: "var(--ink-ghost, #d4d4d8)",
          border: "1.5px solid var(--ink-ghost, #d4d4d8)",
        }}
      />
    );
  }
  if (lane === "In flight") {
    return (
      <span
        style={{
          ...base,
          background: "color-mix(in srgb, var(--ink-ghost, #d4d4d8) 50%, transparent)",
          border: "1.5px solid var(--indigo, #4f46e5)",
        }}
      />
    );
  }
  if (lane === "Later") {
    return (
      <span
        style={{
          ...base,
          background: "transparent",
          border: "1.5px dashed var(--ink-ghost, #d4d4d8)",
        }}
      />
    );
  }
  // Next, indigo border, no fill
  return (
    <span
      style={{
        ...base,
        background: "transparent",
        border: "1.5px solid var(--indigo, #4f46e5)",
      }}
    />
  );
}

// ── Single node row (CREATIVE_SPEC §1.2) ──────────────────────────────────────

function NodeRow({
  node,
  showProject,
}: {
  node: EffectiveNode;
  showProject: boolean;
}) {
  const isShipped = node.lane === "Shipped";
  const isLater = node.lane === "Later";
  const dateStr = formatNodeDate(node.targetDate);
  const days = node.targetDate && !isShipped ? daysUntil(node.targetDate) : null;
  const showCountdown =
    days !== null && Math.abs(days) <= 30 && !isShipped;

  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "12px 1fr auto",
        alignItems: "flex-start",
        gap: "0 10px",
        paddingBlock: 12,
        paddingInline: 16,
        borderBottom: "1px solid var(--hairline)",
        // Milestone elevation: indigo-soft left border (CREATIVE_SPEC §1.2)
        borderLeft: "2px solid var(--indigo-soft, rgba(79,70,229,0.12))",
        background: "var(--paper, #ffffff)",
        listStyle: "none",
      }}
    >
      {/* Circle */}
      <span style={{ paddingTop: 1 }}>
        <NodeCircle lane={node.lane} />
      </span>

      {/* Title + project meta */}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            // Milestone title weight: 600 (CREATIVE_SPEC §1.2)
            fontWeight: 600,
            color: isShipped
              ? "color-mix(in srgb, var(--ink, #111111) 70%, transparent)"
              : "var(--ink, #111111)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            textDecoration: isShipped ? "line-through" : "none",
            margin: 0,
          }}
        >
          {node.title}
        </p>
        {showProject && node.projectSlug && (
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono-stack)",
              color: "var(--ink-quiet, #71717a)",
              letterSpacing: "0.02em",
              marginTop: 2,
            }}
          >
            {node.projectSlug}
          </p>
        )}
      </div>

      {/* Date + countdown (CREATIVE_SPEC §1.3) */}
      <div
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 11,
          color: "var(--ink-quiet, #71717a)",
          letterSpacing: "0.02em",
          textAlign: "right",
          whiteSpace: "nowrap",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        {!isLater && dateStr && (
          <span>{dateStr}</span>
        )}
        {showCountdown && days !== null && (
          <span
            style={{
              // T-N indigo only on milestone countdown (CREATIVE_SPEC §1.4, §1.7 item 3)
              color:
                days >= 0
                  ? "var(--indigo, #4f46e5)"
                  : "var(--ink-quiet, #71717a)",
            }}
          >
            {days >= 0 ? `T-${days}` : `−${Math.abs(days)}d`}
          </span>
        )}
      </div>
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const LANE_ORDER = ["Next", "In flight", "Shipped", "Later"] as const;

export function LaneNodeList({
  nodes,
  showProject = false,
}: {
  /** EffectiveNodes from getEffectiveNodesForWorkspace, hidden=true already filtered. */
  nodes: EffectiveNode[];
  showProject?: boolean;
}) {
  if (nodes.length === 0) return null;

  // Group nodes by lane in display order
  const laneGroups: { lane: string; nodes: EffectiveNode[] }[] = [];
  for (const lane of LANE_ORDER) {
    const laneNodes = nodes.filter((n) => n.lane === lane);
    if (laneNodes.length > 0) {
      laneGroups.push({ lane, nodes: laneNodes });
    }
  }

  if (laneGroups.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {laneGroups.map((group, gi) => (
        <div key={group.lane}>
          {/* First lane: top padding only; subsequent lanes: separator + top space */}
          <div style={{ paddingInline: 16 }}>
            {gi === 0 ? (
              <div style={{ paddingTop: 16, paddingBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono-stack)",
                    fontSize: 11,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.14em",
                    color: "var(--ink-quiet, #71717a)",
                  }}
                >
                  {group.lane}
                </span>
              </div>
            ) : (
              <LaneSeparator lane={group.lane} />
            )}
          </div>
          <ul style={{ margin: 0, padding: 0 }}>
            {group.nodes.map((node) => (
              <NodeRow
                key={node.id}
                node={node}
                showProject={showProject}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
