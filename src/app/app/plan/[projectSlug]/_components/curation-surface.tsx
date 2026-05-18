"use client";

/**
 * CurationSurface — owner-only authoring view for a roadmap project.
 *
 * One artifact, two zoom levels (CREATIVE_SPEC §1 governing principle):
 * this view and the public viewer share the same visual DNA. Curation
 * handles appear here; the lane structure and type are identical.
 *
 * Direct-manipulation, no markdown, no modals (UX_SPEC RW-4).
 * D5 structured manual add at the bottom.
 * D6 two-gate: editing/curating here stays PRIVATE. Publish is
 * a separate explicit action from the /app dashboard.
 */

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { EffectiveNode } from "@/server/db/queries";
import { upsertNodeOverlayAction, syncMilestonesAction, reorderNodesAction } from "@/server/actions/workspaces";

const LANE_LABELS = ["Next", "In flight", "Shipped", "Later"] as const;
type LaneLabel = typeof LANE_LABELS[number];

// ── Lane helpers ──────────────────────────────────────────────────────────────

/** Human-readable eyebrow for a lane separator. Matches CREATIVE_SPEC §1.1. */
function LaneSeparator({ lane }: { lane: LaneLabel }) {
  return (
    <div
      style={{
        paddingTop: 32,
        borderTop: "1px solid var(--hairline)",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-quiet)",
        }}
      >
        {lane}
      </span>
    </div>
  );
}

// ── Status circle ─────────────────────────────────────────────────────────────

function StatusCircle({ lane, isMilestone }: { lane: LaneLabel; isMilestone: boolean }) {
  const accentBorder = `1.5px solid var(--indigo, #4f46e5)`;
  const ghostBorder = `1.5px solid var(--ink-ghost, #d4d4d8)`;

  const style: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-block",
    marginTop: 2,
  };

  if (lane === "Shipped") {
    return (
      <span
        style={{
          ...style,
          background: "var(--ink-ghost, #d4d4d8)",
          border: ghostBorder,
        }}
      />
    );
  }
  if (lane === "In flight") {
    return (
      <span
        style={{
          ...style,
          background: "color-mix(in srgb, var(--ink-ghost, #d4d4d8) 50%, transparent)",
          border: isMilestone ? accentBorder : ghostBorder,
        }}
      />
    );
  }
  if (lane === "Later") {
    return (
      <span
        style={{
          ...style,
          background: "transparent",
          border: "1.5px dashed var(--ink-ghost, #d4d4d8)",
        }}
      />
    );
  }
  // Next
  return (
    <span
      style={{
        ...style,
        background: "transparent",
        border: isMilestone ? accentBorder : ghostBorder,
      }}
    />
  );
}

// ── Node card ─────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  workspaceSlug,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  onPointerDragStart,
  onPointerDragOver,
  onPointerDrop,
  isDraggingOver,
}: {
  node: EffectiveNode;
  workspaceSlug: string;
  onUpdate: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (targetId: string) => void;
  onPointerDragStart: (id: string) => void;
  onPointerDragOver: (id: string) => void;
  onPointerDrop: (targetId: string) => void;
  isDraggingOver: boolean;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(node.title);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function commitTitle() {
    if (titleValue.trim() === node.title) {
      setEditingTitle(false);
      return;
    }
    startTransition(async () => {
      await upsertNodeOverlayAction(workspaceSlug, {
        nodeId: node.id,
        labelOverride: titleValue.trim() || null,
      });
      onUpdate();
    });
    setEditingTitle(false);
  }

  function toggleHidden() {
    startTransition(async () => {
      await upsertNodeOverlayAction(workspaceSlug, {
        nodeId: node.id,
        hidden: !node.hidden,
      });
      onUpdate();
    });
  }

  function setLane(lane: LaneLabel) {
    startTransition(async () => {
      await upsertNodeOverlayAction(workspaceSlug, {
        nodeId: node.id,
        laneOverride: lane !== node.lane ? lane : null,
      });
      onUpdate();
    });
  }

  function setDate(dateStr: string) {
    startTransition(async () => {
      await upsertNodeOverlayAction(workspaceSlug, {
        nodeId: node.id,
        dateOverride: dateStr || null,
      });
      onUpdate();
    });
  }

  const isShipped = node.lane === "Shipped";

  return (
    <div
      data-node-id={node.id}
      draggable
      onDragStart={() => onDragStart(node.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(node.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(node.id); }}
      style={{
        paddingBlock: 12,
        paddingInline: 16,
        borderBottom: "1px solid var(--hairline)",
        opacity: node.hidden ? 0.4 : isPending ? 0.7 : 1,
        transition: "opacity 160ms ease-out",
        borderLeft: isDraggingOver
          ? "2px solid var(--indigo, #4f46e5)"
          : "2px solid var(--indigo-soft, rgba(79,70,229,0.12))",
        background: isDraggingOver ? "var(--paper-soft, #fafafa)" : "var(--paper)",
        cursor: "grab",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Drag handle — BV-1: Pointer Events for mouse+touch+pen (iOS Safari) */}
        <span
          aria-hidden
          onPointerDown={(e) => {
            // Only primary button / first touch
            if (e.pointerType === "mouse" && e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            onPointerDragStart(node.id);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0 && e.pointerType === "mouse") return;
            // Find the element under the pointer (excluding the handle itself)
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const card = target?.closest("[data-node-id]");
            const targetId = card?.getAttribute("data-node-id");
            if (targetId && targetId !== node.id) onPointerDragOver(targetId);
          }}
          onPointerUp={(e) => {
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const card = target?.closest("[data-node-id]");
            const targetId = card?.getAttribute("data-node-id");
            if (targetId && targetId !== node.id) onPointerDrop(targetId);
            else onPointerDrop(node.id); // dropped on self — no-op in handler
          }}
          style={{
            flexShrink: 0,
            marginTop: 4,
            color: "var(--ink-faint)",
            cursor: "grab",
            lineHeight: 1,
            fontSize: 10,
            letterSpacing: "0.1em",
            userSelect: "none",
            touchAction: "none", // required for Pointer Events on touch (iOS Safari)
          }}
        >
          ⠿
        </span>
        {/* Status circle */}
        <StatusCircle lane={node.lane} isMilestone />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          {editingTitle ? (
            <input
              ref={inputRef}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setTitleValue(node.title);
                  setEditingTitle(false);
                }
              }}
              autoFocus
              maxLength={120}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--indigo, #4f46e5)",
                outline: "none",
                width: "100%",
                padding: "0 0 2px",
                textDecoration: isShipped ? "line-through" : "none",
                opacity: isShipped ? 0.7 : 1,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "text",
                textAlign: "left",
                textDecoration: isShipped
                  ? "line-through"
                  : "none",
                opacity: isShipped ? 0.7 : 1,
                color: isShipped
                  ? "color-mix(in srgb, var(--ink) 70%, transparent)"
                  : "var(--ink)",
              }}
            >
              {node.title}
              {node.labelOverride && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: "var(--ink-quiet)",
                    fontWeight: 400,
                    verticalAlign: "middle",
                  }}
                  title="Label overridden from Tasks"
                >
                  ✎
                </span>
              )}
            </button>
          )}

          {/* Drift affordance (D10 / ARCH_SPEC §1.5(2)) */}
          {node.driftDetected && (
            <p
              style={{
                fontSize: 10,
                color: "var(--ink-quiet)",
                marginTop: 2,
                fontFamily: "var(--font-mono-stack)",
              }}
            >
              Source changed in Tasks. Your edits are shown.
            </p>
          )}

          {/* Meta row: lane selector + date */}
          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            {/* Lane segmented control */}
            <div
              style={{
                display: "flex",
                gap: 0,
                border: "1px solid var(--hairline)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {LANE_LABELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLane(l)}
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    border: "none",
                    background:
                      node.lane === l
                        ? "var(--ink)"
                        : "transparent",
                    color:
                      node.lane === l
                        ? "var(--paper)"
                        : "var(--ink-quiet)",
                    cursor: "pointer",
                    fontWeight: node.lane === l ? 500 : 400,
                    transition: "background 120ms, color 120ms",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Date input */}
            <input
              type="date"
              value={node.targetDate ?? ""}
              onChange={(e) => setDate(e.target.value)}
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono-stack)",
                color: "var(--ink-quiet)",
                border: "1px solid var(--hairline)",
                borderRadius: 4,
                padding: "2px 6px",
                background: "transparent",
                cursor: "pointer",
              }}
            />

            {/* Source indicator — chain-link icon per CREATIVE_SPEC (DRAG: replace ⇄ glyph) */}
            {node.source === "synced" && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 9,
                  color: "var(--ink-faint)",
                  fontFamily: "var(--font-mono-stack)",
                  letterSpacing: "0.05em",
                }}
                title="Synced from Signal Tasks"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Tasks
              </span>
            )}
          </div>
        </div>

        {/* Right: hide toggle */}
        <button
          type="button"
          onClick={toggleHidden}
          aria-label={node.hidden ? "Show this milestone" : "Hide this milestone"}
          title={node.hidden ? "Show" : "Hide from public roadmap"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: node.hidden ? "var(--indigo, #4f46e5)" : "var(--ink-ghost)",
            padding: 4,
            borderRadius: 4,
            flexShrink: 0,
            fontSize: 13,
            lineHeight: 1,
            transition: "color 120ms",
          }}
        >
          {node.hidden ? (
            // Eye-slash
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            // Eye
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── D5 manual add form ────────────────────────────────────────────────────────

function ManualAddForm({
  workspaceSlug,
  onAdd,
}: {
  workspaceSlug: string;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [lane, setLane] = useState<"Next" | "In flight" | "Shipped">("Next");
  const [date, setDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!title.trim()) {
      setError("What's the milestone?");
      return;
    }
    const laneToStatus: Record<string, "next" | "in-flight" | "shipped"> = {
      "Next": "next",
      "In flight": "in-flight",
      "Shipped": "shipped",
    };
    const nodeId = `ms-manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    startTransition(async () => {
      await upsertNodeOverlayAction(workspaceSlug, {
        nodeId,
        source: "manual",
        manualTitle: title.trim(),
        manualStatus: laneToStatus[lane],
        manualTargetDate: date || null,
      });
      setTitle("");
      setDate("");
      setLane("Next");
      setOpen(false);
      setError(null);
      onAdd();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          fontSize: 12,
          color: "var(--indigo, #4f46e5)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px 0",
          display: "block",
        }}
      >
        + Add a milestone
      </button>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        padding: 16,
        background: "var(--paper-soft, #fafafa)",
        marginTop: 8,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Title */}
        <div>
          <label
            style={{ fontSize: 11, color: "var(--ink-quiet)", display: "block", marginBottom: 4 }}
          >
            What&apos;s the milestone?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tasting menu confirmed"
            maxLength={80}
            autoFocus
            style={{
              width: "100%",
              fontSize: 13,
              padding: "6px 10px",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              background: "var(--paper)",
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </div>

        {/* Lane */}
        <div>
          <label
            style={{ fontSize: 11, color: "var(--ink-quiet)", display: "block", marginBottom: 4 }}
          >
            Which lane?
          </label>
          <div style={{ display: "flex", gap: 0, border: "1px solid var(--hairline)", borderRadius: 6, overflow: "hidden", width: "fit-content" }}>
            {(["Next", "In flight", "Shipped"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLane(l)}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  border: "none",
                  background: lane === l ? "var(--ink)" : "transparent",
                  color: lane === l ? "var(--paper)" : "var(--ink-quiet)",
                  cursor: "pointer",
                  transition: "background 120ms, color 120ms",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label
            style={{ fontSize: 11, color: "var(--ink-quiet)", display: "block", marginBottom: 4 }}
          >
            Date (optional)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono-stack)",
              padding: "4px 8px",
              border: "1px solid var(--hairline)",
              borderRadius: 6,
              background: "var(--paper)",
              color: "var(--ink-quiet)",
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 11, color: "var(--status-blocked)", margin: 0 }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 999,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setTitle("");
              setDate("");
              setError(null);
            }}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 999,
              background: "transparent",
              color: "var(--ink-quiet)",
              border: "1px solid var(--hairline)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sync button ───────────────────────────────────────────────────────────────

function SyncButton({
  workspaceSlug,
  onSync,
}: {
  workspaceSlug: string;
  onSync: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleSync() {
    startTransition(async () => {
      const res = await syncMilestonesAction(workspaceSlug);
      if ("error" in res) {
        setResult(res.error);
      } else {
        setResult(res.count === 0 ? "No milestones found in Tasks." : `${res.count} milestone${res.count === 1 ? "" : "s"} synced.`);
        onSync();
      }
      setTimeout(() => setResult(null), 3000);
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "6px 14px",
          borderRadius: 999,
          background: "transparent",
          color: "var(--ink-soft)",
          border: "1px solid var(--hairline)",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "opacity 160ms",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 .49-3.37"/>
        </svg>
        {isPending ? "Syncing…" : "Sync from Tasks"}
      </button>
      {result && (
        <span style={{ fontSize: 11, color: "var(--ink-quiet)" }}>{result}</span>
      )}
    </div>
  );
}

// ── Main surface ──────────────────────────────────────────────────────────────

export function CurationSurface({
  initialNodes,
  workspaceSlug,
  projectSlug,
  isPublished,
  publicUrl,
}: {
  initialNodes: EffectiveNode[];
  workspaceSlug: string;
  projectSlug: string;
  isPublished: boolean;
  publicUrl: string;
}) {
  const router = useRouter();
  const [nodes, setNodes] = useState(initialNodes);
  const [, startTransition] = useTransition();
  // D11 auto-sync: fires once on mount (pull-on-visit). Does NOT publish.
  const [autoSyncing, setAutoSyncing] = useState(false);
  const didAutoSync = useRef(false);
  // "Saved" tick DRAG: shows for 1.5s after any successful overlay upsert
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Drag-to-reorder state (UX-1)
  // HTML5 drag (mouse/desktop) and Pointer Events drag (touch/iOS Safari) share
  // the same reorder logic; pointer state kept in a separate ref so the two
  // paths don't interfere when a non-touch device fires both event sequences.
  const dragNodeId = useRef<string | null>(null);
  const pointerDragNodeId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // UX-2: router.refresh() instead of window.location.reload()
  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  // "Saved" tick helper
  const flashSaved = useCallback(() => {
    setSavedAt(Date.now());
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedAt(null), 1500);
  }, []);

  // D11 auto-sync on load: pulls Tasks milestones into the private draft.
  // D6 two-gate is preserved — syncMilestonesAction only revalidates /app and
  // /app/plan/[slug], never the public /{workspaceSlug} path.
  useEffect(() => {
    if (didAutoSync.current) return;
    didAutoSync.current = true;
    setAutoSyncing(true);
    syncMilestonesAction(workspaceSlug).then(() => {
      setAutoSyncing(false);
      router.refresh();
    }).catch(() => {
      setAutoSyncing(false);
    });
  }, [workspaceSlug, router]);

  // DRAG: justPublished localStorage persistence
  // Initialise from localStorage so the chip animation fires on first load
  // after a publish, even if the page was reloaded.
  const lsKey = `roadmap-publish-celebrated-${workspaceSlug}`;

  // ── Shared reorder logic ────────────────────────────────────────────────────
  // Used by both HTML5 drag and Pointer Events paths. Computes the new order,
  // updates optimistic state, then batch-writes ALL sortOverride values (BV-2).

  function applyReorder(sourceId: string, targetId: string) {
    if (!sourceId || sourceId === targetId) return;

    const ordered = [...nodes];
    const srcIdx = ordered.findIndex((n) => n.id === sourceId);
    const tgtIdx = ordered.findIndex((n) => n.id === targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;

    const [moved] = ordered.splice(srcIdx, 1);
    const insertAt = ordered.findIndex((n) => n.id === targetId);
    ordered.splice(insertAt, 0, moved);

    // Assign sortOverride 0..n for the full list
    const updated = ordered.map((n, i) => ({ ...n, sortOrder: i }));
    setNodes(updated);

    // BV-2: batch-write ALL sibling sortOverrides so reload order is deterministic.
    // reorderNodesAction writes every node in the ordered list, not just the moved one.
    startTransition(async () => {
      await reorderNodesAction(
        workspaceSlug,
        projectSlug,
        updated.map((n) => n.id),
      );
      flashSaved();
    });
  }

  // ── HTML5 drag handlers (mouse / desktop) ───────────────────────────────────

  function handleDragStart(id: string) {
    dragNodeId.current = id;
  }

  function handleDragOver(id: string) {
    if (id !== dragNodeId.current) setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    const sourceId = dragNodeId.current;
    dragNodeId.current = null;
    setDragOverId(null);
    if (!sourceId) return;
    applyReorder(sourceId, targetId);
  }

  // ── Pointer Events handlers (touch / iOS Safari / pen) ─────────────────────
  // BV-1: touch-action:none on the handle stops the browser scroll chain,
  // enabling setPointerCapture to route all pointer events to the handle.

  function handlePointerDragStart(id: string) {
    pointerDragNodeId.current = id;
  }

  function handlePointerDragOver(id: string) {
    if (id !== pointerDragNodeId.current) setDragOverId(id);
  }

  function handlePointerDrop(targetId: string) {
    const sourceId = pointerDragNodeId.current;
    pointerDragNodeId.current = null;
    setDragOverId(null);
    if (!sourceId) return;
    applyReorder(sourceId, targetId);
  }

  // Group by lane for display
  const lanes = LANE_LABELS.filter((l) =>
    nodes.some((n) => n.lane === l && !n.hidden),
  );
  const hiddenNodes = nodes.filter((n) => n.hidden);

  const isEmpty = nodes.length === 0;

  const isSaved = savedAt !== null;

  return (
    <div>
      {/* Published banner */}
      {isPublished && (
        <div
          style={{
            marginBottom: 24,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--hairline)",
            background: "var(--paper-soft, #fafafa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            Published — anyone with the link can read this.
          </span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "var(--ink-quiet)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View public roadmap
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ink-quiet)",
              margin: 0,
            }}
          >
            Milestones
          </h2>
          {/* DRAG: "Saved" 1.5s tick */}
          {isSaved && (
            <span
              style={{
                fontSize: 10,
                color: "var(--ink-quiet)",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                transition: "opacity 160ms",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </span>
          )}
          {autoSyncing && (
            <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>
              Syncing…
            </span>
          )}
        </div>
        <SyncButton workspaceSlug={workspaceSlug} onSync={refresh} />
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--ink-quiet)",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 16, opacity: 0.4 }}>◇</div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--ink-soft)",
              marginBottom: 8,
            }}
          >
            Your plan fills itself in.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-quiet)",
              lineHeight: 1.55,
              maxWidth: 320,
              margin: "0 auto 20px",
            }}
          >
            Mark tasks as milestones in Signal Tasks and they&apos;ll appear here automatically.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={process.env.NEXT_PUBLIC_TASKS_URL ?? "https://tasks.signalstudio.ie"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: "8px 18px",
                borderRadius: 999,
                background: "var(--ink)",
                color: "var(--paper)",
                textDecoration: "none",
              }}
            >
              Open Tasks
            </a>
            <button
              type="button"
              onClick={() => {
                // Scroll to manual add form (it's at the bottom)
                document.getElementById("manual-add")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontSize: 13,
                color: "var(--ink-quiet)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              or add one manually
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Lane-grouped node list with drag-to-reorder (UX-1) */}
          <div
            style={{
              border: "1px solid var(--hairline)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {lanes.map((lane, li) => {
              const laneNodes = nodes.filter((n) => n.lane === lane && !n.hidden);
              return (
                <div key={lane}>
                  {li > 0 && (
                    <div style={{ paddingInline: 16 }}>
                      <LaneSeparator lane={lane} />
                    </div>
                  )}
                  {li === 0 && (
                    <div style={{ paddingInline: 16, paddingTop: 16, marginBottom: -4 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-stack)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "var(--ink-quiet)",
                        }}
                      >
                        {lane}
                      </span>
                    </div>
                  )}
                  {laneNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      workspaceSlug={workspaceSlug}
                      onUpdate={() => { flashSaved(); refresh(); }}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onPointerDragStart={handlePointerDragStart}
                      onPointerDragOver={handlePointerDragOver}
                      onPointerDrop={handlePointerDrop}
                      isDraggingOver={dragOverId === node.id}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Hidden nodes count */}
          {hiddenNodes.length > 0 && (
            <p
              style={{
                fontSize: 11,
                color: "var(--ink-quiet)",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {hiddenNodes.length} hidden
            </p>
          )}
        </>
      )}

      {/* D5 manual add */}
      <div id="manual-add" style={{ marginTop: 24 }}>
        <ManualAddForm workspaceSlug={workspaceSlug} onAdd={() => { flashSaved(); refresh(); }} />
      </div>
    </div>
  );
}
