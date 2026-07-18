import type { ReactNode } from "react";
import styles from "./option-a.module.css";
import {
  BUCKET_LABELS,
  SECONDARY_LABELS,
  TIMELINE_BUCKETS,
  type PublicTimelineChange,
  type PublicTimelineItem,
  type TimelineBucket,
  type TimelineItem,
} from "../types";
import type { TimelineOptionProps } from "./option-contract";

const BUCKET_NOTES: Record<TimelineBucket, string> = {
  now: "The work in focus.",
  soon: "Clear next commitments.",
  later: "Direction held, timing open.",
  done: "What is complete.",
  refused: "Decisions kept visible.",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not yet published";

  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function byOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((left, right) => left.order - right.order);
}

function itemsInBucket<T extends { bucket: TimelineBucket; order: number }>(
  items: T[],
  bucket: TimelineBucket,
) {
  return byOrder(items.filter((item) => item.bucket === bucket));
}

function SecondaryState({ item }: { item: Pick<TimelineItem, "secondaryState"> }) {
  if (!item.secondaryState) return null;

  return (
    <span
      className={styles.secondaryState}
      data-waiting={item.secondaryState === "waiting-on-you" ? "true" : undefined}
    >
      {SECONDARY_LABELS[item.secondaryState]}
    </span>
  );
}

function ScenarioNotice({ scenario }: Pick<TimelineOptionProps, "scenario">) {
  if (scenario === "loading") {
    return (
      <section className={styles.scenario} aria-live="polite" aria-busy="true">
        <span className={styles.loadingMark} aria-hidden="true" />
        <div>
          <h2>Loading this direction</h2>
          <p>The latest published view is being prepared.</p>
        </div>
      </section>
    );
  }

  if (scenario === "error") {
    return (
      <section className={styles.scenario} role="alert">
        <div>
          <h2>This direction could not be loaded</h2>
          <p>Reload the review or choose another state from the lab controls.</p>
        </div>
      </section>
    );
  }

  return null;
}

function LedgerHeading({
  eyebrow,
  title,
  purpose,
  updatedAt,
  revision,
}: {
  eyebrow: string;
  title: string;
  purpose: string;
  updatedAt: string;
  revision: number;
}) {
  return (
    <header className={styles.planHeader}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <div className={styles.titleLine}>
        <div>
          <h1>{title}</h1>
          <p className={styles.purpose}>{purpose}</p>
        </div>
        <dl className={styles.revision}>
          <div>
            <dt>Revision</dt>
            <dd>{revision}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>
              <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function EmptyLine({ bucket }: { bucket: TimelineBucket }) {
  return (
    <li className={styles.emptyLine}>
      {bucket === "refused" ? "No decisions recorded." : "Nothing here yet."}
    </li>
  );
}

function OwnerBucket({
  bucket,
  items,
  selectedItemId,
  onSelect,
  renderOwnerTools,
}: {
  bucket: TimelineBucket;
  items: TimelineItem[];
  selectedItemId: string;
  onSelect: TimelineOptionProps["onSelect"];
  renderOwnerTools: TimelineOptionProps["renderOwnerTools"];
}) {
  const bucketItems = itemsInBucket(items, bucket);
  const headingId = `option-a-owner-${bucket}`;

  return (
    <section className={styles.bucket} aria-labelledby={headingId} data-bucket={bucket}>
      <div className={styles.bucketHeading}>
        <span className={styles.bucketMarker} aria-hidden="true" />
        <div>
          <h2 id={headingId}>{BUCKET_LABELS[bucket]}</h2>
          <p>{BUCKET_NOTES[bucket]}</p>
        </div>
        <span className={styles.count} aria-label={`${bucketItems.length} items`}>
          {bucketItems.length}
        </span>
      </div>
      <ol className={styles.rows}>
        {bucketItems.length === 0 ? <EmptyLine bucket={bucket} /> : null}
        {bucketItems.map((item) => {
          const selected = item.id === selectedItemId;
          return (
            <li
              className={styles.ownerRow}
              data-selected={selected ? "true" : undefined}
              data-hidden={item.publicVisible ? undefined : "true"}
              key={item.id}
            >
              <button
                className={styles.rowAction}
                type="button"
                data-timeline-item-id={item.id}
                onClick={() => onSelect(item.id)}
                aria-current={selected ? "true" : undefined}
                aria-expanded={selected}
              >
                <span className={styles.rowTitle}>{item.title}</span>
                <span className={styles.rowSummary}>{item.publicSummary}</span>
                <span className={styles.rowMeta}>
                  <span>{item.timing}</span>
                  <SecondaryState item={item} />
                  {!item.publicVisible ? <span>Hidden from public</span> : null}
                  <span>{item.origin === "tasks" ? "From Tasks" : "Added here"}</span>
                </span>
              </button>
              {selected ? (
                <div className={styles.ownerTools} aria-label={`Edit ${item.title}`}>
                  {renderOwnerTools(item)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function OwnerLedger(props: TimelineOptionProps) {
  const {
    ownerPlan,
    previewSource,
    publishedPlan,
    unpublishedCount,
    readOnly,
    onPreviewSourceChange,
    onPublish,
  } = props;

  return (
    <article className={styles.document} aria-label="Owner direction ledger">
      <LedgerHeading
        eyebrow="Quiet direction ledger · owner view"
        title={ownerPlan.title}
        purpose={ownerPlan.purpose}
        updatedAt={ownerPlan.updatedAt}
        revision={ownerPlan.revision}
      />

      <section className={styles.ownerControls} aria-labelledby="option-a-publication-heading">
        <div className={styles.publicationCopy}>
          <h2 id="option-a-publication-heading">Publication</h2>
          <p aria-live="polite">
            {unpublishedCount > 0
              ? `${unpublishedCount} unpublished ${unpublishedCount === 1 ? "change" : "changes"}.`
              : "The working plan matches the published plan."}
          </p>
          <p>
            Last published <time dateTime={publishedPlan.publishedAt ?? undefined}>{formatDate(publishedPlan.publishedAt)}</time>
          </p>
        </div>
        <fieldset className={styles.previewChoice}>
          <legend>Preview source</legend>
          <div>
            <button
              type="button"
              aria-pressed={previewSource === "working"}
              onClick={() => onPreviewSourceChange("working")}
            >
              Working plan
            </button>
            <button
              type="button"
              aria-pressed={previewSource === "published"}
              onClick={() => onPreviewSourceChange("published")}
            >
              Published plan
            </button>
          </div>
        </fieldset>
        <button
          className={styles.publishButton}
          type="button"
          onClick={onPublish}
          disabled={readOnly || unpublishedCount === 0}
        >
          {readOnly ? "Read only" : "Publish this revision"}
        </button>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </section>

      <div className={styles.ledger} data-density={props.density} data-owner="true">
        {TIMELINE_BUCKETS.map((bucket) => (
          <OwnerBucket
            bucket={bucket}
            items={ownerPlan.items}
            selectedItemId={props.selectedItemId}
            onSelect={props.onSelect}
            renderOwnerTools={props.renderOwnerTools}
            key={bucket}
          />
        ))}
      </div>
    </article>
  );
}

function PublicRow({
  item,
  renderPublicItemLink,
}: {
  item: PublicTimelineItem;
  renderPublicItemLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <li className={styles.publicRow} data-waiting={item.secondaryState === "waiting-on-you" ? "true" : undefined}>
      <div className={styles.publicTitle}>
        {renderPublicItemLink(item, <span>{item.title}</span>)}
      </div>
      <p>{item.summary}</p>
      <div className={styles.publicMeta}>
        <span>{item.timing}</span>
        <SecondaryState item={item} />
        {item.bucket === "refused" && item.decision ? (
          <span>
            Decided <time dateTime={item.decision.date}>{formatDate(item.decision.date)}</time>
          </span>
        ) : null}
      </div>
      {item.bucket === "refused" && item.decision ? (
        <p className={styles.decisionReason}>{item.decision.reason}</p>
      ) : null}
    </li>
  );
}

function ActivePublicBucket({
  bucket,
  items,
  renderPublicItemLink,
}: {
  bucket: "now" | "soon" | "later";
  items: PublicTimelineItem[];
  renderPublicItemLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  const bucketItems = itemsInBucket(items, bucket);
  const headingId = `option-a-public-${bucket}`;

  return (
    <section className={styles.bucket} aria-labelledby={headingId} data-bucket={bucket}>
      <div className={styles.bucketHeading}>
        <span className={styles.bucketMarker} aria-hidden="true" />
        <div>
          <h2 id={headingId}>{BUCKET_LABELS[bucket]}</h2>
          <p>{BUCKET_NOTES[bucket]}</p>
        </div>
        <span className={styles.count} aria-label={`${bucketItems.length} items`}>
          {bucketItems.length}
        </span>
      </div>
      <ol className={styles.rows}>
        {bucketItems.length === 0 ? <EmptyLine bucket={bucket} /> : null}
        {bucketItems.map((item) => (
          <PublicRow item={item} renderPublicItemLink={renderPublicItemLink} key={item.id} />
        ))}
      </ol>
    </section>
  );
}

function ArchivePublicBucket({
  bucket,
  items,
  renderPublicItemLink,
}: {
  bucket: "done" | "refused";
  items: PublicTimelineItem[];
  renderPublicItemLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  const bucketItems = itemsInBucket(items, bucket);

  return (
    <details className={styles.archive} data-bucket={bucket} open>
      <summary>
        <span className={styles.archiveHeading} role="heading" aria-level={2}>
          {BUCKET_LABELS[bucket]}
        </span>
        <span>{BUCKET_NOTES[bucket]}</span>
        <span className={styles.count} aria-label={`${bucketItems.length} items`}>
          {bucketItems.length}
        </span>
        <span className={styles.disclosure} aria-hidden="true">+</span>
      </summary>
      <ol className={styles.rows}>
        {bucketItems.length === 0 ? <EmptyLine bucket={bucket} /> : null}
        {bucketItems.map((item) => (
          <PublicRow item={item} renderPublicItemLink={renderPublicItemLink} key={item.id} />
        ))}
      </ol>
    </details>
  );
}

function PublicLedger(props: TimelineOptionProps) {
  const { plan } = props;
  const isWorkingPreview = props.previewSource === "working" && props.unpublishedCount > 0;

  return (
    <article className={styles.document} aria-label="Public direction ledger">
      {isWorkingPreview ? (
        <div className={styles.previewNotice} role="status">
          Working preview · these changes are not public yet
        </div>
      ) : null}
      <LedgerHeading
        eyebrow="Quiet direction ledger · public view"
        title={plan.title}
        purpose={plan.purpose}
        updatedAt={plan.updatedAt}
        revision={plan.revision}
      />
      <div className={styles.ledger} data-density={props.density}>
        <ActivePublicBucket bucket="now" items={plan.items} renderPublicItemLink={props.renderPublicItemLink} />
        <ActivePublicBucket bucket="soon" items={plan.items} renderPublicItemLink={props.renderPublicItemLink} />
        <ActivePublicBucket bucket="later" items={plan.items} renderPublicItemLink={props.renderPublicItemLink} />
        <ArchivePublicBucket bucket="done" items={plan.items} renderPublicItemLink={props.renderPublicItemLink} />
        <ArchivePublicBucket bucket="refused" items={plan.items} renderPublicItemLink={props.renderPublicItemLink} />
      </div>
      <footer className={styles.publicFooter}>
        <p>
          Published by {plan.author} · revision {plan.revision}
        </p>
        <p>
          <time dateTime={plan.publishedAt ?? plan.updatedAt}>{formatDate(plan.publishedAt ?? plan.updatedAt)}</time>
        </p>
        <p>Timeline by Signal Studio</p>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </footer>
    </article>
  );
}

function changeLabel(change: PublicTimelineChange) {
  if (change.kind === "move" && change.fromBucket && change.toBucket) {
    return `Moved from ${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`;
  }
  if (change.kind === "refuse") return "Recorded as refused";
  if (change.kind === "create") return "Added to the direction";
  if (change.kind === "hide") return "Removed from the public direction";
  if (change.kind === "restore") return "Restored to the public direction";
  if (change.kind === "delete") return "Removed from the direction";
  return "Updated in the direction";
}

function LinkedTitle({
  item,
  children,
  renderPublicItemLink,
}: {
  item: PublicTimelineItem | undefined;
  children: ReactNode;
  renderPublicItemLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  if (!item) return <>{children}</>;
  return <>{renderPublicItemLink(item, children)}</>;
}

function UpdateMemo(props: TimelineOptionProps) {
  const { plan } = props;
  const limit = props.density === "sparse" ? 3 : props.density === "dense" ? 10 : 6;
  const changes = [...plan.changes]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, limit);
  const itemById = new Map(plan.items.map((item) => [item.id, item]));
  const attention = [
    { title: "Now", items: itemsInBucket(plan.items, "now") },
    {
      title: "Waiting on you",
      items: plan.items.filter((item) => item.secondaryState === "waiting-on-you"),
    },
    { title: "Coming up", items: itemsInBucket(plan.items, "soon") },
  ];

  return (
    <article className={styles.memo} aria-label="Shared direction update">
      <LedgerHeading
        eyebrow="Direction update · ready to forward"
        title={plan.title}
        purpose="What changed, why it changed, and what happens next."
        updatedAt={plan.updatedAt}
        revision={plan.revision}
      />
      {props.previewSource === "working" && props.unpublishedCount > 0 ? (
        <div className={styles.previewNotice} role="status">
          Working preview · these changes are not public yet
        </div>
      ) : null}
      <section className={styles.memoBody} aria-labelledby="option-a-update-heading">
        <div className={styles.memoIntro}>
          <h2 id="option-a-update-heading">Since the last direction</h2>
          <p>{changes.length === 0 ? "No public changes have been recorded." : `${changes.length} recent changes, in plain English.`}</p>
        </div>
        <ol className={styles.changeList}>
          {changes.map((change, index) => {
            const item = itemById.get(change.itemId);
            return (
              <li className={styles.change} key={change.id}>
                {index === 0 ? <span className={styles.latestMarker} aria-hidden="true" /> : null}
                <p className={styles.changeLabel}>{index === 0 ? "Latest change" : "Changed"}</p>
                <h3>
                  <LinkedTitle item={item} renderPublicItemLink={props.renderPublicItemLink}>
                    {item?.title ?? changeLabel(change)}
                  </LinkedTitle>
                </h3>
                <p className={styles.changedFact}>{changeLabel(change)}.</p>
                <dl className={styles.changeReason}>
                  <div>
                    <dt>Why</dt>
                    <dd>{change.reason}</dd>
                  </div>
                  <div>
                    <dt>Next practical step</dt>
                    <dd>{item?.nextStep ?? "No next step is published."}</dd>
                  </div>
                </dl>
                <p className={styles.changeDate}>
                  <time dateTime={change.occurredAt}>{formatDate(change.occurredAt)}</time>
                </p>
              </li>
            );
          })}
        </ol>
      </section>
      <section className={styles.memoBrief} aria-labelledby="option-a-attention-heading">
        <div className={styles.memoIntro}>
          <h2 id="option-a-attention-heading">Where attention sits</h2>
          <p>Current commitments, requested input and the next clear work.</p>
        </div>
        <div className={styles.attentionGrid}>
          {attention.map((group) => (
            <section key={group.title} aria-labelledby={`option-a-attention-${group.title.toLowerCase().replaceAll(" ", "-")}`}>
              <h3 id={`option-a-attention-${group.title.toLowerCase().replaceAll(" ", "-")}`}>
                {group.title} <span>{group.items.length}</span>
              </h3>
              {group.items.length ? (
                <ol>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {props.renderPublicItemLink(item, item.title)}
                      <span>{item.nextStep}</span>
                    </li>
                  ))}
                </ol>
              ) : <p>Nothing to report.</p>}
            </section>
          ))}
        </div>
      </section>
      <footer className={styles.memoFooter}>
        <p>Shared by {plan.author}.</p>
        <p>This update contains published direction only.</p>
        <p>Timeline by Signal Studio</p>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </footer>
    </article>
  );
}

function DetailIndex({
  items,
  selectedItemId,
  renderPublicItemLink,
}: {
  items: PublicTimelineItem[];
  selectedItemId: string;
  renderPublicItemLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <nav className={styles.detailIndex} aria-label="Timeline items">
      <p className={styles.eyebrow}>Direction index</p>
      {TIMELINE_BUCKETS.map((bucket) => {
        const bucketItems = itemsInBucket(items, bucket);
        return (
          <section aria-labelledby={`option-a-detail-index-${bucket}`} key={bucket}>
            <h2 id={`option-a-detail-index-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
            {bucketItems.length === 0 ? <p className={styles.indexEmpty}>Nothing here.</p> : null}
            <ol>
              {bucketItems.map((item) => (
                <li data-current={item.id === selectedItemId ? "true" : undefined} key={item.id}>
                  {renderPublicItemLink(item, <span>{item.title}</span>)}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </nav>
  );
}

function ItemDetail(props: TimelineOptionProps) {
  const { plan } = props;
  const item = plan.items.find((candidate) => candidate.id === props.selectedItemId);
  const history = item
    ? plan.changes.filter((change) => change.itemId === item.id).slice(-4).reverse()
    : [];

  return (
    <article className={styles.detailDocument} aria-label="Direction item detail">
      <LedgerHeading
        eyebrow="Quiet direction ledger · item detail"
        title={plan.title}
        purpose={plan.purpose}
        updatedAt={plan.updatedAt}
        revision={plan.revision}
      />
      {props.previewSource === "working" && props.unpublishedCount > 0 ? (
        <div className={styles.previewNotice} role="status">
          Working preview · this working copy includes unpublished changes
        </div>
      ) : null}
      <button className={styles.returnAction} type="button" onClick={() => props.onSurfaceChange("public")}>
        ← Back to public plan
      </button>
      <div className={styles.detailLayout}>
        <section className={styles.detailSheet} aria-labelledby="option-a-detail-title">
          <span className={styles.detailAccent} aria-hidden="true" />
          {item ? (
            <>
              <p className={styles.detailBucket}>{BUCKET_LABELS[item.bucket]}</p>
              <h2 id="option-a-detail-title" data-detail-focus tabIndex={-1}>{item.title}</h2>
              <p className={styles.detailSummary}>{item.summary}</p>
              <dl className={styles.factList}>
                <div>
                  <dt>Timing</dt>
                  <dd>{item.timing}</dd>
                </div>
                <div>
                  <dt>State</dt>
                  <dd>{item.secondaryState ? SECONDARY_LABELS[item.secondaryState] : BUCKET_LABELS[item.bucket]}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{item.confidence}</dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>
                    <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
                  </dd>
                </div>
              </dl>
              <section className={styles.nextStep} aria-labelledby="option-a-detail-next">
                <h3 id="option-a-detail-next">What happens next</h3>
                <p>{item.nextStep}</p>
              </section>
              <section className={styles.detailHistory} aria-labelledby="option-a-detail-history">
                <h3 id="option-a-detail-history">What changed and why</h3>
                {history.length ? (
                  <ol>
                    {history.map((change) => (
                      <li key={change.id}>
                        <p>{change.reason}</p>
                        <span>
                          {change.fromBucket && change.toBucket
                            ? `${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`
                            : "Details clarified"}
                          {" · "}
                          <time dateTime={change.occurredAt}>{formatDate(change.occurredAt)}</time>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : <p>No published direction changes yet.</p>}
              </section>
              {item.decision ? (
                <section className={styles.decision} aria-labelledby="option-a-detail-decision">
                  <h3 id="option-a-detail-decision">Decision record</h3>
                  <p>{item.decision.reason}</p>
                  <p>
                    Recorded <time dateTime={item.decision.date}>{formatDate(item.decision.date)}</time>
                  </p>
                </section>
              ) : null}
            </>
          ) : (
            <div className={styles.noDetail}>
              <h2 id="option-a-detail-title" data-detail-focus tabIndex={-1}>This item is not on the public plan.</h2>
              <p>Return to the public plan to choose an available item.</p>
            </div>
          )}
        </section>
        <DetailIndex
          items={plan.items}
          selectedItemId={item?.id ?? ""}
          renderPublicItemLink={props.renderPublicItemLink}
        />
      </div>
    </article>
  );
}

export function OptionA(props: TimelineOptionProps) {
  const scenarioNotice = <ScenarioNotice scenario={props.scenario} />;

  if (props.scenario === "loading" || props.scenario === "error") {
    return (
      <div className={styles.root} data-density={props.density}>
        {scenarioNotice}
      </div>
    );
  }

  return (
    <div className={styles.root} data-density={props.density}>
      {props.surface === "owner" ? <OwnerLedger {...props} /> : null}
      {props.surface === "public" ? <PublicLedger {...props} /> : null}
      {props.surface === "update" ? <UpdateMemo {...props} /> : null}
      {props.surface === "detail" ? <ItemDetail {...props} /> : null}
    </div>
  );
}
