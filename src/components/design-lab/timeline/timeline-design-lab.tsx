"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  countUnpublished,
  createInitialLabState,
  selectPlanForDensity,
  timelineLabReducer,
  toPublicPlan,
} from "./model";
import { serializeLabConfig } from "./query";
import { OptionA } from "./options/option-a";
import { OptionB } from "./options/option-b";
import { OptionC } from "./options/option-c";
import type { TimelineOptionProps } from "./options/option-contract";
import {
  BUCKET_LABELS,
  TIMELINE_BUCKETS,
  type LabConfig,
  type LabDataset,
  type LabDensity,
  type LabOption,
  type LabScenario,
  type LabSurface,
  type LabViewport,
  type PreviewSource,
  type PublicTimelineItem,
  type TimelineBucket,
  type TimelineItem,
} from "./types";
import styles from "./timeline-design-lab.module.css";

const OPTION_LABELS: Record<LabOption, string> = {
  a: "A · Quiet Direction Ledger",
  b: "B · Editorial Plan Room",
  c: "C · Signal Horizon",
};

const SURFACE_LABELS: Record<LabSurface, string> = {
  owner: "Owner Plan",
  public: "Public Timeline",
  update: "Shared Update",
  detail: "Item Detail",
};

const DATASET_LABELS: Record<LabDataset, string> = {
  wedding: "Wedding",
  freelance: "Freelance launch",
  "small-business": "Small business",
  "edge-cases": "Edge cases",
};

const SCENARIO_LABELS: Record<LabScenario, string> = {
  default: "Default",
  empty: "Empty",
  loading: "Loading",
  error: "Error",
  "read-only": "Read-only",
  unpublished: "Unpublished changes",
  "recently-changed": "Recently changed",
};

const VIEWPORT_LABELS: Record<LabViewport, string> = {
  responsive: "Browser width",
  mobile: "Mobile frame",
  tablet: "Tablet frame",
  desktop: "Desktop frame",
  wide: "Wide frame",
};

const CONTROL_KEYS = ["option", "surface", "dataset", "density", "scenario", "viewport", "preview", "item"];

export function TimelineDesignLab({
  initialConfig,
  initialAttribution,
}: {
  initialConfig: LabConfig;
  initialAttribution: string;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [state, dispatch] = useReducer(
    timelineLabReducer,
    initialConfig,
    (seed) => {
      const initial = createInitialLabState(seed.dataset, seed.scenario);
      return seed.item && initial.working.items.some((item) => item.id === seed.item)
        ? { ...initial, selectedItemId: seed.item }
        : initial;
    },
  );
  const [copyReceipt, setCopyReceipt] = useState("Copy review link");
  const [surfaceCopyReceipt, setSurfaceCopyReceipt] = useState("Copy link");
  const pendingFocusItem = useRef<string | null>(null);
  const pendingSurfaceFocus = useRef<{
    surface: "public" | "detail";
    itemId: string;
  } | null>(null);

  useEffect(() => {
    const itemId = pendingFocusItem.current;
    if (!itemId) return;
    pendingFocusItem.current = null;
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-timeline-item-id="${CSS.escape(itemId)}"]`);
      target?.focus();
    });
  }, [config.surface, state.announcement, state.working]);

  useEffect(() => {
    const pending = pendingSurfaceFocus.current;
    if (!pending || pending.surface !== config.surface) return;
    pendingSurfaceFocus.current = null;
    requestAnimationFrame(() => {
      const itemSelector = `[data-public-item-id="${CSS.escape(pending.itemId)}"]`;
      const target = pending.surface === "detail"
        ? document.querySelector<HTMLElement>("[data-detail-focus]")
        : document.querySelector<HTMLElement>(itemSelector);
      (target ?? document.querySelector<HTMLElement>("#timeline-prototype h1"))?.focus();
    });
  }, [config.surface, state.announcement, state.working]);

  const buildLabQuery = useCallback(
    (next: LabConfig) => {
      const query = new URLSearchParams(initialAttribution);
      const controls = new URLSearchParams(serializeLabConfig(next));
      controls.forEach((value, key) => query.set(key, value));
      return query.toString();
    },
    [initialAttribution],
  );

  const updateConfig = useCallback(
    (patch: Partial<LabConfig>) => {
      const next = { ...config, ...patch };
      if (patch.dataset || patch.scenario) {
        dispatch({
          type: "reset",
          dataset: (patch.dataset ?? config.dataset) as LabDataset,
          scenario: (patch.scenario ?? config.scenario) as LabScenario,
        });
      }
      if (patch.item) dispatch({ type: "select", itemId: patch.item });
      setConfig(next);

      const url = new URL(window.location.href);
      for (const key of CONTROL_KEYS) url.searchParams.delete(key);
      const query = new URLSearchParams(serializeLabConfig(next));
      query.forEach((value, key) => url.searchParams.set(key, value));
      window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
    },
    [config],
  );

  const working = useMemo(
    () => selectPlanForDensity(state.working, config.density),
    [config.density, state.working],
  );
  const published = useMemo(
    () => selectPlanForDensity(state.published, config.density),
    [config.density, state.published],
  );
  const projectedWorking = useMemo(() => toPublicPlan(working), [working]);
  const projectedPublished = useMemo(() => toPublicPlan(published), [published]);
  const projected = config.preview === "working" ? projectedWorking : projectedPublished;
  const unpublishedCount = countUnpublished(state);
  const readOnly = config.scenario === "read-only";

  const mutate = useCallback(
    (action: Parameters<typeof timelineLabReducer>[1]) => {
      if (readOnly) return;
      if (action.type === "move" || action.type === "reorder") {
        pendingFocusItem.current = action.itemId;
      }
      dispatch(action);
      if (action.type !== "publish" && action.type !== "select") {
        updateConfig({ preview: "working" });
      }
    },
    [readOnly, updateConfig],
  );

  const renderOwnerTools = useCallback(
    (item: TimelineItem) => (
      <OwnerItemTools
        key={item.id}
        item={item}
        readOnly={readOnly}
        onEdit={(patch) => mutate({ type: "edit", itemId: item.id, patch })}
        onMove={(to, reason, date) => mutate({ type: "move", itemId: item.id, to, reason, date })}
        onReorder={(direction) => mutate({ type: "reorder", itemId: item.id, direction })}
        onHide={() => mutate({ type: "hide", itemId: item.id })}
        onDelete={() => mutate({ type: "delete", itemId: item.id })}
      />
    ),
    [mutate, readOnly],
  );

  const renderPublicItemLink = useCallback(
    (item: PublicTimelineItem, children: ReactNode) => {
      const next = { ...config, surface: "detail" as const, item: item.id };
      return (
        <a
          className={styles.itemLink}
          data-public-item-id={item.id}
          href={`?${buildLabQuery(next)}`}
          onClick={(event) => {
            event.preventDefault();
            pendingSurfaceFocus.current = { surface: "detail", itemId: item.id };
            updateConfig({ surface: "detail", item: item.id });
          }}
        >
          {children}
        </a>
      );
    },
    [buildLabQuery, config, updateConfig],
  );

  const optionProps: TimelineOptionProps = {
    surface: config.surface,
    density: config.density,
    scenario: config.scenario,
    ownerPlan: working,
    plan: projected,
    publishedPlan: projectedPublished,
    previewSource: config.preview,
    selectedItemId: state.selectedItemId,
    unpublishedCount,
    readOnly,
    copySurfaceLinkLabel: surfaceCopyReceipt,
    onSelect: (itemId) => {
      dispatch({ type: "select", itemId });
      updateConfig({ item: itemId });
    },
    onSurfaceChange: (surface: LabSurface) => {
      if (config.surface === "detail" && surface === "public") {
        pendingSurfaceFocus.current = {
          surface: "public",
          itemId: state.selectedItemId,
        };
      }
      updateConfig({ surface });
    },
    onCopySurfaceLink: () => {
      void navigator.clipboard.writeText(window.location.href).then(
        () => setSurfaceCopyReceipt("Link copied"),
        () => setSurfaceCopyReceipt("Copy the address bar"),
      );
    },
    onPreviewSourceChange: (preview: PreviewSource) => updateConfig({ preview }),
    onPublish: () => {
      if (readOnly) return;
      dispatch({ type: "publish" });
      updateConfig({ preview: "published" });
    },
    renderOwnerTools,
    renderPublicItemLink,
  };

  const hiddenItems = working.items.filter((item) => !item.publicVisible);

  return (
    <main className={styles.lab}>
      <a className={styles.skipLink} href="#timeline-prototype">Skip to prototype</a>
      <header className={styles.labHeader}>
        <div>
          <p className={styles.wordmark}>Timeline<span aria-hidden="true">.</span></p>
          <p className={styles.labTitle}>Four-surface review lab</p>
        </div>
        <div className={styles.proofBoundary}>
          <strong>Review fixture</strong>
          <span>Reload resets · no production data changed</span>
        </div>
        <button
          className={styles.copyButton}
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setCopyReceipt("Link copied");
            } catch {
              setCopyReceipt("Copy the address bar");
            }
          }}
        >
          {copyReceipt}
        </button>
      </header>

      <section className={styles.controlDeck} aria-label="Design lab controls">
        <SegmentedControl
          legend="Direction"
          value={config.option}
          options={OPTION_LABELS}
          onChange={(option) => updateConfig({ option: option as LabOption })}
        />
        <SegmentedControl
          legend="Surface"
          value={config.surface}
          options={SURFACE_LABELS}
          onChange={(surface) => updateConfig({ surface: surface as LabSurface })}
        />
        <div className={styles.selectGrid}>
          <SelectControl
            label="Dataset"
            value={config.dataset}
            options={DATASET_LABELS}
            onChange={(dataset) => updateConfig({ dataset: dataset as LabDataset, item: undefined })}
          />
          <SelectControl
            label="Density"
            value={config.density}
            options={{ sparse: "Sparse", normal: "Normal", dense: "Dense" }}
            onChange={(density) => updateConfig({ density: density as LabDensity })}
          />
          <SelectControl
            label="State"
            value={config.scenario}
            options={SCENARIO_LABELS}
            onChange={(scenario) => updateConfig({ scenario: scenario as LabScenario, item: undefined })}
          />
          <SelectControl
            label="Frame"
            value={config.viewport}
            options={VIEWPORT_LABELS}
            onChange={(viewport) => updateConfig({ viewport: viewport as LabViewport })}
          />
        </div>
      </section>

      <section className={styles.reviewReadout} aria-label="Current review configuration">
        <span>{OPTION_LABELS[config.option]}</span>
        <span>{SURFACE_LABELS[config.surface]}</span>
        <span>{DATASET_LABELS[config.dataset]}</span>
        <span>{unpublishedCount} unpublished {unpublishedCount === 1 ? "change" : "changes"}</span>
      </section>

      <div className={styles.frameStage} data-viewport={config.viewport}>
        <section className={styles.prototypeFrame} id="timeline-prototype" tabIndex={-1}>
          {config.surface === "owner" ? (
            <OwnerCommandBar
              readOnly={readOnly}
              deleted={Boolean(state.deleted)}
              hiddenItems={hiddenItems}
              onAdd={() => mutate({ type: "add" })}
              onUndoDelete={() => mutate({ type: "undo-delete" })}
              onRestore={(itemId) => mutate({ type: "restore", itemId })}
            />
          ) : config.preview === "working" && unpublishedCount > 0 ? (
            <div className={styles.previewNotice} role="status">
              Working preview · not public yet · {unpublishedCount} unpublished {unpublishedCount === 1 ? "change" : "changes"}
              <button type="button" onClick={() => updateConfig({ preview: "published" })}>View published copy</button>
            </div>
          ) : null}

          {config.scenario === "loading" ? (
            <LoadingState />
          ) : config.scenario === "error" ? (
            <ErrorState onRetry={() => updateConfig({ scenario: "default" })} />
          ) : (
            <SelectedOption option={config.option} props={optionProps} />
          )}

          <p className={styles.announcement} aria-live="polite" aria-atomic="true">
            {state.announcement}
          </p>
        </section>
      </div>
    </main>
  );
}

function SelectedOption({ option, props }: { option: LabOption; props: TimelineOptionProps }) {
  if (option === "a") return <OptionA {...props} />;
  if (option === "b") return <OptionB {...props} />;
  return <OptionC {...props} />;
}

function SegmentedControl({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className={styles.segmented}>
      <legend>{legend}</legend>
      <div className={styles.segmentedRow}>
        {Object.entries(options).map(([key, label]) => (
          <button
            type="button"
            aria-pressed={value === key}
            data-active={value === key ? "true" : undefined}
            key={key}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.selectControl}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([key, optionLabel]) => (
          <option key={key} value={key}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function OwnerCommandBar({
  readOnly,
  deleted,
  hiddenItems,
  onAdd,
  onUndoDelete,
  onRestore,
}: {
  readOnly: boolean;
  deleted: boolean;
  hiddenItems: TimelineItem[];
  onAdd: () => void;
  onUndoDelete: () => void;
  onRestore: (itemId: string) => void;
}) {
  return (
    <div className={styles.ownerCommandBar}>
      <div>
        <strong>Working plan</strong>
        <span>{readOnly ? "Read-only review state" : "Fixture edits reset on reload"}</span>
      </div>
      <div className={styles.ownerCommandActions}>
        <button type="button" disabled={readOnly} onClick={onAdd}>Add item</button>
        {deleted ? <button type="button" disabled={readOnly} onClick={onUndoDelete}>Undo delete</button> : null}
        <details>
          <summary>Hidden items · {hiddenItems.length}</summary>
          <div className={styles.hiddenList}>
            {hiddenItems.length === 0 ? <p>No hidden items.</p> : hiddenItems.map((item) => (
              <div key={item.id}>
                <span>{item.title}</span>
                <button type="button" disabled={readOnly} onClick={() => onRestore(item.id)}>Restore</button>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

function OwnerItemTools({
  item,
  readOnly,
  onEdit,
  onMove,
  onReorder,
  onHide,
  onDelete,
}: {
  item: TimelineItem;
  readOnly: boolean;
  onEdit: (patch: Partial<Pick<TimelineItem, "title" | "publicSummary" | "ownerNote" | "timing" | "confidence" | "nextStep">>) => void;
  onMove: (to: TimelineBucket, reason: string, date?: string) => void;
  onReorder: (direction: "up" | "down") => void;
  onHide: () => void;
  onDelete: () => void;
}) {
  const [destination, setDestination] = useState<TimelineBucket>(item.bucket);
  const [reason, setReason] = useState("");
  const [decisionDate, setDecisionDate] = useState("2026-07-18");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const activeOrder: TimelineBucket[] = ["now", "soon", "later"];
  const fromIndex = activeOrder.indexOf(item.bucket);
  const toIndex = activeOrder.indexOf(destination);
  const reasonRequired = destination === "refused" ||
    item.bucket === "done" ||
    item.bucket === "refused" ||
    fromIndex >= 0 && toIndex > fromIndex;

  return (
    <section className={styles.ownerTools} aria-label={`Edit ${item.title}`}>
      <div className={styles.editGrid}>
        <label>
          <span>Title</span>
          <input
            disabled={readOnly}
            defaultValue={item.title}
            onBlur={(event) => {
              const nextTitle = event.currentTarget.value.trim();
              if (!nextTitle) {
                event.currentTarget.value = item.title;
                return;
              }
              onEdit({ title: nextTitle });
            }}
          />
        </label>
        <label>
          <span>Public description</span>
          <textarea disabled={readOnly} defaultValue={item.publicSummary} onBlur={(event) => onEdit({ publicSummary: event.target.value })} />
        </label>
        <label>
          <span>Owner-only note</span>
          <textarea disabled={readOnly} defaultValue={item.ownerNote} onBlur={(event) => onEdit({ ownerNote: event.target.value })} />
          <small>Never included in the public projection.</small>
        </label>
        <label>
          <span>Timing language</span>
          <input disabled={readOnly} defaultValue={item.timing} onBlur={(event) => onEdit({ timing: event.target.value })} />
        </label>
        <label>
          <span>Next practical step</span>
          <input disabled={readOnly} defaultValue={item.nextStep} onBlur={(event) => onEdit({ nextStep: event.target.value })} />
        </label>
        <label>
          <span>Confidence</span>
          <select
            disabled={readOnly}
            value={item.confidence}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onEdit({ confidence: event.target.value as TimelineItem["confidence"] })}
          >
            <option value="clear">Clear</option>
            <option value="directional">Directional</option>
            <option value="open">Open</option>
          </select>
        </label>
      </div>

      <div className={styles.moveComposer}>
        <label>
          <span>Move to</span>
          <select disabled={readOnly} value={destination} onChange={(event) => setDestination(event.target.value as TimelineBucket)}>
            {TIMELINE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{BUCKET_LABELS[bucket]}</option>)}
          </select>
        </label>
        <label className={styles.reasonField}>
          <span>{reasonRequired ? "Why · required" : "Why · optional"}</span>
          <input disabled={readOnly} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the change in plain English" />
        </label>
        {destination === "refused" ? (
          <label>
            <span>Decision date</span>
            <input disabled={readOnly} type="date" value={decisionDate} onChange={(event) => setDecisionDate(event.target.value)} />
          </label>
        ) : null}
        <button
          type="button"
          disabled={readOnly || destination === item.bucket || reasonRequired && !reason.trim()}
          onClick={() => {
            onMove(destination, reason.trim(), destination === "refused" ? decisionDate : undefined);
            setReason("");
          }}
        >
          Record move
        </button>
      </div>

      <div className={styles.itemUtilities}>
        <button type="button" disabled={readOnly} onClick={() => onReorder("up")}>Move up</button>
        <button type="button" disabled={readOnly} onClick={() => onReorder("down")}>Move down</button>
        {item.origin === "tasks" ? (
          <>
            <button type="button" disabled={readOnly} onClick={onHide}>Hide from public copy</button>
            <a href="https://tasks.signalstudio.ie" target="_blank" rel="noreferrer">Open in Tasks</a>
          </>
        ) : confirmDelete ? (
          <>
            <span>Delete this manual item?</span>
            <button type="button" disabled={readOnly} onClick={onDelete}>Confirm delete</button>
            <button type="button" onClick={() => setConfirmDelete(false)}>Keep item</button>
          </>
        ) : (
          <button type="button" disabled={readOnly} onClick={() => setConfirmDelete(true)}>Delete manual item</button>
        )}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className={styles.loadingState} role="status" aria-label="Loading Timeline preview">
      <span className={styles.loadingDot} aria-hidden="true" />
      <div><span /><span /><span /></div>
      <p>Loading review fixture</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className={styles.errorState} role="alert">
      <p className={styles.eyebrow}>Preview unavailable</p>
      <h1>The review fixture could not be shown.</h1>
      <p>No production data was touched. Reset this local state and try again.</p>
      <button type="button" onClick={onRetry}>Reset fixture</button>
    </section>
  );
}
