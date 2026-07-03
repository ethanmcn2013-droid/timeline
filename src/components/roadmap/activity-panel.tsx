import type { Activity } from "@/server/db/schema";

const ACTION_LABEL: Record<string, string> = {
  "status-change": "moved",
  "assignee-change": "reassigned",
  "subtask-toggle": "subtask updated",
  "description-edit": "note updated",
  created: "added",
  "cycle-logged": "cycle shipped",
};

const STATUS_LABEL: Record<string, string> = {
  shipped: "Done",
  "in-flight": "Doing",
  next: "To do",
  blocked: "Waiting",
  refused: "Dropped",
};

/**
 * Timeline of activity events for a single task.
 * Public surface, read-only display.
 */
export function ActivityPanel({ events }: { events: Activity[] }) {
  if (events.length === 0) {
    return (
      <section className="mt-12">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-quiet">
          History
        </div>
        <p className="text-[13px] text-ink-quiet">No updates recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-quiet">
          History
        </h2>
        <span className="text-[12px] tabular-nums text-ink-quiet">
          {events.length} update{events.length === 1 ? "" : "s"}
        </span>
      </div>
      <ol className="space-y-2.5 border-l border-line-soft pl-5">
        {events.map((e) => {
          let payload: Record<string, unknown> = {};
          try {
            payload = JSON.parse(e.payload || "{}") as Record<string, unknown>;
          } catch {
            // Malformed JSON (legacy row, cross-repo writer drift): treat
            // as empty payload rather than crashing the public render.
          }
          const ts = new Date(e.createdAt);
          const verb = ACTION_LABEL[e.action] ?? e.action.replace(/-/g, " ");
          const fromTo =
            e.action === "status-change" && payload.from && payload.to
              ? ` · ${STATUS_LABEL[String(payload.from)] ?? payload.from} → ${STATUS_LABEL[String(payload.to)] ?? payload.to}`
              : "";

          return (
            <li key={e.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[23px] top-1.5 inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--ink-quiet)" }}
              />
              <div className="text-[11px] text-ink-soft">
                {verb}
                {fromTo}
              </div>
              <div className="text-[10.5px] tabular-nums text-ink-faint">
                {ts.toISOString().slice(0, 16).replace("T", " ")}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
