import { Fragment } from "react";

/**
 * MetaStrip — the small uppercase rhythm strip that anchors every
 * Roadmap hero. Same shape across workspace, project, and refusals
 * surfaces; different content. Reads as the brand's steady pulse: a
 * line of facts (identity · timeline · counts), separated by middle
 * dots, set in the smallest legible uppercase tracking.
 *
 * The `anchor` slot renders slightly bolder than the rest — it
 * carries the identity token (workspace name, "REFUSALS", etc).
 * The `items` array renders in the quiet register. Both filter out
 * null/empty so callers can pass conditional items without ternary
 * spaghetti.
 */
export function MetaStrip({
  anchor,
  items,
}: {
  anchor?: string | null;
  items: Array<string | null | false | undefined>;
}) {
  const visible = items.filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );

  if (!anchor && visible.length === 0) return null;

  const segments: { key: string; node: React.ReactNode }[] = [];
  if (anchor) {
    segments.push({
      key: "anchor",
      node: <span className="font-semibold text-ink-soft">{anchor}</span>,
    });
  }
  for (let i = 0; i < visible.length; i++) {
    segments.push({
      key: `item-${i}`,
      node: <span className="tabular-nums">{visible[i]}</span>,
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-ink-quiet">
      {segments.map((seg, i) => (
        <Fragment key={seg.key}>
          {i > 0 ? <span aria-hidden>·</span> : null}
          {seg.node}
        </Fragment>
      ))}
    </div>
  );
}
