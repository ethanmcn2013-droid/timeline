import type { ReactNode } from "react";
import styles from "./option-c.module.css";
import type { TimelineOptionProps } from "./option-contract";
import {
  BUCKET_LABELS,
  SECONDARY_LABELS,
  TIMELINE_BUCKETS,
  type PublicTimelineChange,
  type PublicTimelineItem,
  type TimelineBucket,
  type TimelineItem,
} from "../types";

const HORIZON_BUCKETS = TIMELINE_BUCKETS.slice(0, 3);
const ARCHIVE_BUCKETS = TIMELINE_BUCKETS.slice(3);

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string | null | undefined) {
  if (!value) return "Not published";
  return DATE_FORMATTER.format(new Date(value));
}

function changeLabel(kind: PublicTimelineChange["kind"]) {
  if (kind === "edit") return "Details updated";
  if (kind === "create") return "Item added";
  if (kind === "hide") return "Hidden from public copy";
  if (kind === "restore") return "Restored to public copy";
  if (kind === "delete") return "Item removed";
  if (kind === "refuse") return "Decision recorded";
  return "Direction changed";
}

function itemsInBucket<T extends { bucket: TimelineBucket; order: number }>(
  items: T[],
  bucket: TimelineBucket,
) {
  return items
    .filter((item) => item.bucket === bucket)
    .sort((left, right) => left.order - right.order);
}

function bucketClass(bucket: TimelineBucket) {
  if (bucket === "now") return styles.bucketNow;
  if (bucket === "soon") return styles.bucketSoon;
  if (bucket === "later") return styles.bucketLater;
  return "";
}

function SecondaryState({ item }: { item: Pick<PublicTimelineItem, "secondaryState"> }) {
  if (!item.secondaryState) return null;

  const waiting = item.secondaryState === "waiting-on-you";
  return (
    <span className={waiting ? styles.waitingState : styles.secondaryState}>
      {SECONDARY_LABELS[item.secondaryState]}
    </span>
  );
}

function SurfaceState({
  scenario,
  children,
}: {
  scenario: TimelineOptionProps["scenario"];
  children: ReactNode;
}) {
  if (scenario === "loading") {
    return (
      <section className={styles.statePanel} aria-busy="true" aria-live="polite">
        <p className={styles.eyebrow}>Loading timeline</p>
        <div className={styles.loadingTitle} />
        <div className={styles.loadingLine} />
        <div className={styles.loadingLineShort} />
        <span className={styles.srOnly}>Timeline content is loading.</span>
      </section>
    );
  }

  if (scenario === "error") {
    return (
      <section className={styles.statePanel} role="alert">
        <p className={styles.eyebrow}>Timeline unavailable</p>
        <h2 className={styles.stateTitle}>We could not load this plan.</h2>
        <p className={styles.stateCopy}>
          The last published version is safe. Reload this review to try again.
        </p>
      </section>
    );
  }

  return children;
}

function EmptyBucket({ bucket }: { bucket: TimelineBucket }) {
  return (
    <p className={styles.emptyBucket}>
      {bucket === "refused" ? "No decisions recorded." : "Nothing here yet."}
    </p>
  );
}

function PreviewControls({
  previewSource,
  unpublishedCount,
  readOnly,
  copySurfaceLinkLabel,
  onCopySurfaceLink,
  onPreviewSourceChange,
  onPublish,
}: Pick<
  TimelineOptionProps,
  | "previewSource"
  | "unpublishedCount"
  | "readOnly"
  | "copySurfaceLinkLabel"
  | "onCopySurfaceLink"
  | "onPreviewSourceChange"
  | "onPublish"
>) {
  const dirty = unpublishedCount > 0;

  return (
    <div className={styles.previewControls} aria-label="Plan preview and publishing">
      <div className={styles.previewSwitch} role="group" aria-label="Preview version">
        <button
          className={previewSource === "working" ? styles.switchActive : styles.switchButton}
          type="button"
          aria-pressed={previewSource === "working"}
          onClick={() => onPreviewSourceChange("working")}
        >
          Working
        </button>
        <button
          className={previewSource === "published" ? styles.switchActive : styles.switchButton}
          type="button"
          aria-pressed={previewSource === "published"}
          onClick={() => onPreviewSourceChange("published")}
        >
          Published
        </button>
      </div>
      <p className={styles.publishStatus} aria-live="polite">
        {dirty
          ? `${unpublishedCount} unpublished ${unpublishedCount === 1 ? "change" : "changes"}`
          : "Published version is current"}
      </p>
      <button
        className={styles.publishButton}
        type="button"
        onClick={onPublish}
        disabled={!dirty || readOnly}
      >
        {readOnly ? "Read only" : "Publish changes"}
      </button>
      <button className={styles.artifactAction} type="button" onClick={onCopySurfaceLink}>
        {copySurfaceLinkLabel}
      </button>
    </div>
  );
}

function OwnerItem({
  item,
  selected,
  onSelect,
}: {
  item: TimelineItem;
  selected: boolean;
  onSelect: (itemId: string) => void;
}) {
  return (
    <article className={selected ? styles.ownerItemSelected : styles.ownerItem}>
      <button
        className={styles.ownerItemButton}
        type="button"
        data-timeline-item-id={item.id}
        aria-pressed={selected}
        onClick={() => onSelect(item.id)}
      >
        <span className={styles.itemProject}>{item.project}</span>
        <span className={styles.ownerItemTitle}>{item.title}</span>
        <span className={styles.ownerItemMeta}>
          {item.timing} · {item.publicVisible ? "Public" : "Hidden"}
        </span>
      </button>
    </article>
  );
}

function OwnerBucket({
  bucket,
  items,
  selectedItemId,
  onSelect,
}: {
  bucket: TimelineBucket;
  items: TimelineItem[];
  selectedItemId: string;
  onSelect: (itemId: string) => void;
}) {
  return (
    <section className={`${styles.ownerBucket} ${bucketClass(bucket)}`} aria-labelledby={`c-owner-${bucket}`}>
      <header className={styles.bucketHeader}>
        <h2 id={`c-owner-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
        <span className={styles.bucketCount}>{items.length}</span>
      </header>
      <div className={styles.ownerItemList}>
        {items.length ? (
          items.map((item) => (
            <OwnerItem
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              onSelect={onSelect}
            />
          ))
        ) : (
          <EmptyBucket bucket={bucket} />
        )}
      </div>
    </section>
  );
}

function PlanningRail({
  selectedItem,
  props,
}: {
  selectedItem: TimelineItem | undefined;
  props: TimelineOptionProps;
}) {
  return (
    <aside className={styles.planningRail} aria-labelledby="c-planning-rail-title">
      <div className={styles.railHeading}>
        <p className={styles.eyebrow}>Planning rail</p>
        <h2 id="c-planning-rail-title" tabIndex={-1}>
          {selectedItem ? selectedItem.title : "Select an item"}
        </h2>
      </div>
      {selectedItem ? (
        <>
          <dl className={styles.factList}>
            <div>
              <dt>Direction</dt>
              <dd>{BUCKET_LABELS[selectedItem.bucket]}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{selectedItem.timing}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>{selectedItem.publicVisible ? "Public" : "Hidden"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{selectedItem.origin === "tasks" ? "Tasks" : "Timeline"}</dd>
            </div>
          </dl>
          <div className={styles.ownerTools}>{props.renderOwnerTools(selectedItem)}</div>
        </>
      ) : (
        <p className={styles.railEmpty}>Add an item to begin shaping the plan.</p>
      )}
      {props.readOnly ? (
        <p className={styles.readOnlyNotice}>This review is read only. The published plan is unchanged.</p>
      ) : null}
    </aside>
  );
}

function OwnerSurface(props: TimelineOptionProps) {
  const selectedItem =
    props.ownerPlan.items.find((item) => item.id === props.selectedItemId) ??
    props.ownerPlan.items[0];
  const selectFromHorizon = (itemId: string) => {
    props.onSelect(itemId);
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("#c-planning-rail-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <article className={`${styles.option} ${styles[props.density]}`} data-option="signal-horizon">
      <header className={styles.ownerHeader}>
        <div className={styles.ownerHeading}>
          <p className={styles.eyebrow}>Signal Horizon · owner plan</p>
          <h1 className={styles.surfaceTitle}>{props.ownerPlan.title}</h1>
          <p className={styles.surfacePurpose}>{props.ownerPlan.purpose}</p>
        </div>
        <PreviewControls {...props} />
      </header>

      <div className={styles.ownerLayout}>
        <PlanningRail selectedItem={selectedItem} props={props} />
        <div className={styles.ownerPlan}>
          <div className={styles.horizonIntro}>
            <p>Current direction</p>
            <span>Near work carries more room. Later work stays deliberately lighter.</span>
          </div>
          <div className={styles.ownerHorizon}>
            {HORIZON_BUCKETS.map((bucket) => (
              <OwnerBucket
                key={bucket}
                bucket={bucket}
                items={itemsInBucket(props.ownerPlan.items, bucket)}
                selectedItemId={props.selectedItemId}
                onSelect={selectFromHorizon}
              />
            ))}
          </div>
          <div className={styles.archiveBands} aria-label="Plan archive">
            {ARCHIVE_BUCKETS.map((bucket) => (
              <OwnerBucket
                key={bucket}
                bucket={bucket}
                items={itemsInBucket(props.ownerPlan.items, bucket)}
                selectedItemId={props.selectedItemId}
                onSelect={selectFromHorizon}
              />
            ))}
          </div>
        </div>

      </div>
    </article>
  );
}

function PublicItemLink({
  item,
  renderLink,
}: {
  item: PublicTimelineItem;
  renderLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return renderLink(
    item,
    <span className={styles.publicLinkContent}>
      <span className={styles.itemProject}>{item.project}</span>
      <span className={styles.publicItemTitle}>{item.title}</span>
      <span className={styles.publicSummary}>{item.summary}</span>
      <span className={styles.publicMeta}>
        {item.timing} · {item.confidence === "open"
          ? "Timing open"
          : item.confidence === "clear"
            ? "Direction clear"
            : "Direction forming"}
      </span>
      {item.decision ? (
        <span className={styles.decisionReason}>
          Decided {formatDate(item.decision.date)} · {item.decision.reason}
        </span>
      ) : null}
      <SecondaryState item={item} />
    </span>,
  );
}

function PublicBucket({
  bucket,
  items,
  renderLink,
}: {
  bucket: TimelineBucket;
  items: PublicTimelineItem[];
  renderLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <section className={`${styles.publicBucket} ${bucketClass(bucket)}`} aria-labelledby={`c-public-${bucket}`}>
      <header className={styles.publicBucketHeader}>
        <div className={styles.publicBucketTitle}>
          {bucket === "now" ? <span className={styles.currentMark} aria-hidden="true" /> : null}
          <h2 id={`c-public-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
        </div>
        <span className={styles.bucketCount}>{items.length}</span>
      </header>
      <div className={styles.publicItemList}>
        {items.length ? (
          items.map((item) => (
            <article className={styles.publicItem} key={item.id}>
              <PublicItemLink item={item} renderLink={renderLink} />
            </article>
          ))
        ) : (
          <EmptyBucket bucket={bucket} />
        )}
      </div>
    </section>
  );
}

function PublicSurface(props: TimelineOptionProps) {
  return (
    <article className={`${styles.option} ${styles.publicOption} ${styles[props.density]}`} data-option="signal-horizon">
      <header className={styles.publicHeader}>
        <div>
          <p className={styles.eyebrow}>Public timeline</p>
          <h1 className={styles.publicTitle}>{props.plan.title}</h1>
        </div>
        <p className={styles.publicPurpose}>{props.plan.purpose}</p>
        <p className={styles.publicByline}>
          Maintained by {props.plan.author} · updated {formatDate(props.plan.updatedAt)}
        </p>
      </header>

      <div className={styles.publicHorizon} aria-label="Current direction">
        {HORIZON_BUCKETS.map((bucket) => (
          <PublicBucket
            key={bucket}
            bucket={bucket}
            items={itemsInBucket(props.plan.items, bucket)}
            renderLink={props.renderPublicItemLink}
          />
        ))}
      </div>
      <div className={styles.publicArchive} aria-label="Completed work and recorded decisions">
        {ARCHIVE_BUCKETS.map((bucket) => (
          <PublicBucket
            key={bucket}
            bucket={bucket}
            items={itemsInBucket(props.plan.items, bucket)}
            renderLink={props.renderPublicItemLink}
          />
        ))}
      </div>
      <footer className={styles.publicFooter}>
        <p>Direction, timing and decisions in one maintained plan.</p>
        <p>Revision {props.plan.revision} · published {formatDate(props.plan.publishedAt)}</p>
        <p>Timeline by Signal Studio</p>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </footer>
    </article>
  );
}

function findChangedItem(
  change: PublicTimelineChange,
  items: PublicTimelineItem[],
) {
  return items.find((item) => item.id === change.itemId);
}

function UpdateSurface(props: TimelineOptionProps) {
  const changes = [...props.plan.changes]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 8);
  const attention = [
    { title: "Now", items: itemsInBucket(props.plan.items, "now") },
    {
      title: "Waiting on you",
      items: props.plan.items.filter((item) => item.secondaryState === "waiting-on-you"),
    },
    { title: "Coming up", items: itemsInBucket(props.plan.items, "soon") },
  ];

  return (
    <article className={`${styles.option} ${styles.updateOption} ${styles[props.density]}`} data-option="signal-horizon">
      <header className={styles.updateHeader}>
        <p className={styles.eyebrow}>Shared update</p>
        <h1 className={styles.publicTitle}>What changed in {props.plan.title}</h1>
        <p className={styles.publicPurpose}>
          A concise record of movement, the reason behind it and what happens next.
        </p>
        <p className={styles.publicByline}>
          Revision {props.plan.revision} · {formatDate(props.plan.updatedAt)}
        </p>
      </header>

      <section className={styles.shiftSection} aria-labelledby="c-shift-title">
        <div className={styles.shiftHeading}>
          <h2 id="c-shift-title">What changed, and why</h2>
          <span>{changes.length}</span>
        </div>
        {changes.length ? (
          <div className={styles.shiftList}>
            {changes.map((change) => {
              const item = findChangedItem(change, props.plan.items);
              const moved = change.fromBucket && change.toBucket && change.fromBucket !== change.toBucket;
              return (
                <article className={styles.shiftItem} key={change.id}>
                  <div className={styles.shiftLead}>
                    <p className={styles.itemProject}>{item?.project ?? "Timeline"}</p>
                    <h3>
                      {item
                        ? props.renderPublicItemLink(item, item.title)
                        : "A private item changed direction"}
                    </h3>
                    <p>{change.reason}</p>
                  </div>
                  {moved ? (
                    <div className={styles.beforeAfter} aria-label="Direction before and after">
                      <div>
                        <span>Before</span>
                        <strong>{BUCKET_LABELS[change.fromBucket!]}</strong>
                      </div>
                      <div>
                        <span>Now</span>
                        <strong>{BUCKET_LABELS[change.toBucket!]}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.changeType}>
                      <span>Recorded</span>
                      <strong>{changeLabel(change.kind)}</strong>
                    </div>
                  )}
                  <time dateTime={change.occurredAt}>{formatDate(change.occurredAt)}</time>
                </article>
              );
            })}
          </div>
        ) : (
          <p className={styles.updateEmpty}>No public changes in this revision.</p>
        )}
      </section>

      <section className={styles.nextSection} aria-labelledby="c-next-title">
        <div className={styles.shiftHeading}>
          <h2 id="c-next-title">Where attention sits</h2>
          <span>{attention.reduce((total, group) => total + group.items.length, 0)}</span>
        </div>
        <div className={styles.attentionGrid}>
          {attention.map((group) => (
            <section key={group.title} aria-labelledby={`c-attention-${group.title.toLowerCase().replaceAll(" ", "-")}`}>
              <h3 id={`c-attention-${group.title.toLowerCase().replaceAll(" ", "-")}`}>
                {group.title} <span>{group.items.length}</span>
              </h3>
              {group.items.length ? (
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {props.renderPublicItemLink(item, item.title)}
                      <span>{item.nextStep}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>Nothing to report.</p>}
            </section>
          ))}
        </div>
      </section>
      <footer className={`${styles.publicFooter} ${styles.updateFooter}`}>
        <p>Timeline by Signal Studio</p>
        <p>Revision {props.plan.revision} · shared {formatDate(props.plan.updatedAt)}</p>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </footer>
    </article>
  );
}

function DetailSurface(props: TimelineOptionProps) {
  const item = props.plan.items.find((candidate) => candidate.id === props.selectedItemId);

  if (!item) {
    return (
      <article className={`${styles.option} ${styles.detailOption}`} data-option="signal-horizon">
        <section className={styles.statePanel}>
          <p className={styles.eyebrow}>Item detail</p>
          <h1 className={styles.stateTitle} data-detail-focus tabIndex={-1}>This item is not on the public plan.</h1>
          <p className={styles.stateCopy}>Return to the public plan to choose an available item.</p>
          <button className={styles.returnAction} type="button" onClick={() => props.onSurfaceChange("public")}>
            ← Back to public plan
          </button>
        </section>
      </article>
    );
  }

  const history = props.plan.changes
    .filter((change) => change.itemId === item.id)
    .slice(-6)
    .reverse();

  return (
    <article className={`${styles.option} ${styles.detailOption} ${styles[props.density]}`} data-option="signal-horizon">
      <div className={styles.detailLayout}>
        <div className={styles.detailMain}>
          <header className={styles.detailHeader}>
            <p className={styles.eyebrow}>{item.project}</p>
            <h1 className={styles.detailTitle} data-detail-focus tabIndex={-1}>{item.title}</h1>
            <p className={styles.detailSummary}>{item.summary}</p>
            <button className={styles.returnAction} type="button" onClick={() => props.onSurfaceChange("public")}>
              ← Back to public plan
            </button>
          </header>

          <section className={styles.detailSection} aria-labelledby="c-next-step-title">
            <h2 id="c-next-step-title">Next step</h2>
            <p>{item.nextStep}</p>
          </section>

          {item.decision ? (
            <section className={styles.decisionSection} aria-labelledby="c-decision-title">
              <p className={styles.eyebrow}>Decision record · {formatDate(item.decision.date)}</p>
              <h2 id="c-decision-title">Why this was refused</h2>
              <p>{item.decision.reason}</p>
            </section>
          ) : null}

          <section className={styles.detailSection} aria-labelledby="c-history-title">
            <h2 id="c-history-title">Direction history</h2>
            {history.length ? (
              <ol className={styles.historyList}>
                {history.map((change) => (
                  <li key={change.id}>
                    <time dateTime={change.occurredAt}>{formatDate(change.occurredAt)}</time>
                    <p>
                      {change.fromBucket && change.toBucket
                        ? `${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`
                        : changeLabel(change.kind)}
                    </p>
                    <span>{change.reason}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.historyEmpty}>No direction changes have been published.</p>
            )}
          </section>
        </div>

        <aside className={styles.inspectorRail} aria-labelledby="c-inspector-title">
          <p className={styles.eyebrow}>Public facts</p>
          <h2 id="c-inspector-title">Where this sits</h2>
          <dl className={styles.factList}>
            <div>
              <dt>Direction</dt>
              <dd>{BUCKET_LABELS[item.bucket]}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {item.secondaryState ? SECONDARY_LABELS[item.secondaryState] : "No secondary status"}
              </dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{item.timing}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>
                {item.confidence === "open"
                  ? "Open"
                  : item.confidence === "clear"
                    ? "Clear"
                    : "Directional"}
              </dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(item.updatedAt)}</dd>
            </div>
          </dl>
          <SecondaryState item={item} />
          <p className={styles.inspectorNote}>
            Public detail contains only published direction, timing and decision context.
          </p>
        </aside>
      </div>
    </article>
  );
}

export function OptionC(props: TimelineOptionProps) {
  return (
    <SurfaceState scenario={props.scenario}>
      {props.surface === "owner" ? <OwnerSurface {...props} /> : null}
      {props.surface === "public" ? <PublicSurface {...props} /> : null}
      {props.surface === "update" ? <UpdateSurface {...props} /> : null}
      {props.surface === "detail" ? <DetailSurface {...props} /> : null}
    </SurfaceState>
  );
}

export const SignalHorizonOption = OptionC;
