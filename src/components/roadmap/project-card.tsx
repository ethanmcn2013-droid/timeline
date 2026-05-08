import Link from "next/link";
import type { Project } from "@/server/db/schema";

export type ProjectWithCounts = Project & {
  total: number;
  counts: {
    shipped: number;
    "in-flight": number;
    blocked: number;
    next: number;
    refused: number;
  };
};

/**
 * Project overview card for the master workspace roadmap.
 * Accent + name come from the project row — no hardcoded maps.
 */
export function ProjectCard({
  project,
  workspaceSlug,
}: {
  project: ProjectWithCounts;
  workspaceSlug: string;
}) {
  const accent = project.accent;
  const pctShipped =
    project.total > 0
      ? Math.round((project.counts.shipped / project.total) * 100)
      : 0;

  return (
    <Link
      href={`/${workspaceSlug}/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated p-6 transition-all hover:border-ink-quiet/40 hover:shadow-[0_24px_56px_-32px_rgba(20,21,26,0.18)]"
    >
      {/* Top accent bar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {/* Accent glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 right-[-20%] h-[200px] w-[260px] rounded-full opacity-25 blur-3xl"
        style={{
          background: `radial-gradient(closest-side, ${accent}, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-quiet">
            Project
          </div>
          <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-0.025em] text-ink">
            {project.name}
          </h2>
        </div>
        <ProgressRing pct={pctShipped} accent={accent} />
      </div>

      {project.oneLiner ? (
        <p className="relative mt-3 text-[14px] leading-[1.55] text-ink-soft">
          {project.oneLiner}
        </p>
      ) : null}

      {/* Stat strip */}
      <div className="relative mt-6 grid grid-cols-4 gap-2">
        <Stat label="Doing" value={project.counts["in-flight"]} tone="flight" />
        <Stat label="Blocked" value={project.counts.blocked} tone="blocked" />
        <Stat label="Next" value={project.counts.next} tone="next" />
        <Stat label="Done" value={project.counts.shipped} tone="shipped" />
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-center justify-between border-t border-line-soft pt-4">
        <div className="text-[11.5px] tabular-nums text-ink-quiet">
          <span className="text-ink">{project.total}</span> items total
          {project.counts.refused > 0 ? (
            <>
              {" "}
              · <span className="text-ink">{project.counts.refused}</span>{" "}
              refused
            </>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink transition-transform group-hover:translate-x-0.5">
          Open
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "shipped" | "flight" | "blocked" | "next";
}) {
  const tokens = {
    shipped: { fg: "var(--status-shipped)", bg: "var(--status-shipped-bg)" },
    flight: { fg: "var(--status-flight)", bg: "var(--status-flight-bg)" },
    blocked: { fg: "var(--status-blocked)", bg: "var(--status-blocked-bg)" },
    next: { fg: "var(--status-next)", bg: "var(--status-next-bg)" },
  }[tone];

  const isEmpty = value === 0;
  return (
    <div
      className={`flex flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 ${isEmpty ? "opacity-50" : ""}`}
      style={{ background: tokens.bg }}
    >
      <span
        className="text-[18px] font-semibold tabular-nums"
        style={{ color: tokens.fg }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: tokens.fg, opacity: 0.85 }}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressRing({ pct, accent }: { pct: number; accent: string }) {
  return (
    <div
      className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${accent} ${pct}%, var(--line-soft) 0)`,
      }}
      aria-label={`${pct}% shipped`}
    >
      <div
        className="absolute inset-1 rounded-full"
        style={{ background: "var(--bg-elevated)" }}
      />
      <span className="relative text-[11.5px] font-semibold tabular-nums text-ink">
        {pct}
      </span>
    </div>
  );
}
