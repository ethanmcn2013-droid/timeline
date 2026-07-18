import {
  BUCKET_LABELS,
  SECONDARY_LABELS,
  TIMELINE_BUCKETS,
  type PlanSnapshot,
  type PublicPlanDto,
  type PublicTimelineItem,
  type TimelineBucket,
  type TimelineChange,
  type TimelineItem,
} from "../types";
import type { TimelineOptionProps } from "./option-contract";
import styles from "./option-b.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

function formatDate(value: string | null | undefined, short = false) {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date open";
  return (short ? SHORT_DATE_FORMAT : DATE_FORMAT).format(date);
}

function bucketItems<T extends { bucket: TimelineBucket; order: number }>(
  items: T[],
  bucket: TimelineBucket,
) {
  return items
    .filter((item) => item.bucket === bucket)
    .sort((left, right) => left.order - right.order);
}

function latestChangeForItem(plan: PlanSnapshot, itemId: string) {
  return [...plan.changes]
    .filter((change) => change.itemId === itemId)
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    )[0];
}

function changeLabel(change: TimelineChange) {
  if (change.kind === "move" && change.fromBucket && change.toBucket) {
    return `${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`;
  }
  if (change.kind === "refuse") return "Moved to Refused";
  if (change.kind === "restore") return "Restored to the public plan";
  if (change.kind === "hide") return "Removed from the public plan";
  if (change.kind === "create") return "Added to the plan";
  if (change.kind === "delete") return "Removed from the plan";
  return "Plan details updated";
}

function confidenceLabel(value: PublicTimelineItem["confidence"]) {
  if (value === "clear") return "Clear";
  if (value === "directional") return "Direction set";
  return "Still open";
}

function ScenarioPanel({
  scenario,
  surface,
}: Pick<TimelineOptionProps, "scenario" | "surface">) {
  if (scenario === "loading") {
    return (
      <section className={styles.statePanel} aria-busy="true" aria-live="polite">
        <p className={styles.eyebrow}>Option B · Editorial Plan Room</p>
        <h1>Preparing the plan</h1>
        <p>The {surface} view is being assembled from the shared plan.</p>
        <div className={styles.loadingLines} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (scenario === "error") {
    return (
      <section className={styles.statePanel} role="alert">
        <p className={styles.eyebrow}>Option B · Editorial Plan Room</p>
        <h1>This plan could not be shown</h1>
        <p>The saved plan is unchanged. Reload the review lab to try again.</p>
      </section>
    );
  }

  return null;
}

function EmptyBucket({ bucket }: { bucket: TimelineBucket }) {
  return (
    <p className={styles.emptyBucket}>
      Nothing is in {BUCKET_LABELS[bucket].toLocaleLowerCase()} yet.
    </p>
  );
}

function DirectionMark({ state }: { state: PublicTimelineItem["secondaryState"] }) {
  if (!state) return null;
  return (
    <span
      className={state === "waiting-on-you" ? styles.waitingMark : styles.directionMark}
    >
      {SECONDARY_LABELS[state]}
    </span>
  );
}

function OwnerPublicationBar({
  previewSource,
  unpublishedCount,
  readOnly,
  publishedAt,
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
> & { publishedAt: string | null }) {
  return (
    <section className={styles.publicationBar} aria-label="Publication controls">
      <div className={styles.publicationStatus}>
        <span className={styles.label}>Public view</span>
        <strong>
          {unpublishedCount === 0
            ? "Published view is current"
            : `${unpublishedCount} unpublished ${unpublishedCount === 1 ? "change" : "changes"}`}
        </strong>
        <span>Last published {formatDate(publishedAt)}</span>
      </div>
      <div className={styles.publicationActions}>
        <div className={styles.segmented} aria-label="Preview source">
          <button
            type="button"
            aria-pressed={previewSource === "working"}
            onClick={() => onPreviewSourceChange("working")}
          >
            Working preview
          </button>
          <button
            type="button"
            aria-pressed={previewSource === "published"}
            onClick={() => onPreviewSourceChange("published")}
          >
            Published view
          </button>
        </div>
        <button
          className={styles.publishButton}
          type="button"
          disabled={readOnly || unpublishedCount === 0}
          onClick={onPublish}
        >
          {readOnly ? "Read only" : "Publish changes"}
        </button>
        <button className={styles.artifactAction} type="button" onClick={onCopySurfaceLink}>
          {copySurfaceLinkLabel}
        </button>
      </div>
    </section>
  );
}

function OwnerItemRow({
  item,
  selected,
  latestChange,
  onSelect,
  tools,
}: {
  item: TimelineItem;
  selected: boolean;
  latestChange?: TimelineChange;
  onSelect: () => void;
  tools?: React.ReactNode;
}) {
  return (
    <li className={styles.ownerItem} data-selected={selected || undefined}>
      <div className={styles.ownerItemMain}>
        <button
          className={styles.ownerItemTitle}
          type="button"
          data-timeline-item-id={item.id}
          aria-pressed={selected}
          onClick={onSelect}
        >
          <span>{item.title}</span>
          <span className={styles.itemTiming}>{item.timing}</span>
        </button>
        <p>{item.publicSummary}</p>
        <div className={styles.itemMeta}>
          <DirectionMark state={item.secondaryState} />
          <span>{item.project}</span>
          {!item.publicVisible ? <span>Not on public view</span> : null}
        </div>
        {selected && item.ownerNote ? (
          <div className={styles.ownerNote}>
            <span className={styles.label}>Owner note</span>
            <p>{item.ownerNote}</p>
          </div>
        ) : null}
        {selected && tools ? (
          <div className={styles.ownerTools} aria-label={`Edit ${item.title}`}>
            {tools}
          </div>
        ) : null}
      </div>
      <aside
        className={styles.changeMargin}
        data-receipt={item.decision ? "decision" : latestChange ? "change" : "current"}
        aria-label={`Change note for ${item.title}`}
      >
        {item.decision ? (
          <>
            <span className={styles.label}>Decision · {formatDate(item.decision.date, true)}</span>
            <strong>Refused with a reason</strong>
            <p>{item.decision.publicReason}</p>
          </>
        ) : latestChange ? (
          <>
            <span className={styles.label}>{formatDate(latestChange.occurredAt, true)}</span>
            <strong>{changeLabel(latestChange)}</strong>
            <p>{latestChange.publicReason}</p>
          </>
        ) : (
          <>
            <span className={styles.label}>Current note</span>
            <strong>{item.nextStep}</strong>
            <p>{confidenceLabel(item.confidence)}</p>
          </>
        )}
      </aside>
    </li>
  );
}

function OwnerSurface(props: TimelineOptionProps) {
  const visibleItems = props.ownerPlan.items.filter((item) => item.publicVisible);
  const hiddenItems = props.ownerPlan.items.filter((item) => !item.publicVisible);

  return (
    <article className={styles.surface} data-density={props.density}>
      <header className={styles.planHeader}>
        <div>
          <p className={styles.eyebrow}>Option B · Owner plan</p>
          <h1>{props.ownerPlan.title}</h1>
          <p className={styles.purpose}>{props.ownerPlan.purpose}</p>
        </div>
        <dl className={styles.headerFacts}>
          <div>
            <dt>Edited by</dt>
            <dd>{props.ownerPlan.author}</dd>
          </div>
          <div>
            <dt>Working revision</dt>
            <dd>{props.ownerPlan.revision}</dd>
          </div>
          <div>
            <dt>Last changed</dt>
            <dd>{formatDate(props.ownerPlan.updatedAt)}</dd>
          </div>
        </dl>
      </header>

      <OwnerPublicationBar
        previewSource={props.previewSource}
        unpublishedCount={props.unpublishedCount}
        readOnly={props.readOnly}
        publishedAt={props.publishedPlan.publishedAt}
        copySurfaceLinkLabel={props.copySurfaceLinkLabel}
        onCopySurfaceLink={props.onCopySurfaceLink}
        onPreviewSourceChange={props.onPreviewSourceChange}
        onPublish={props.onPublish}
      />

      <div className={styles.ownerPlan}>
        {TIMELINE_BUCKETS.map((bucket) => {
          const items = bucketItems(visibleItems, bucket);
          return (
            <section className={styles.ownerChapter} key={bucket} aria-labelledby={`b-owner-${bucket}`}>
              <header className={styles.chapterHeading}>
                <div>
                  <span className={styles.chapterNumber} aria-hidden="true">
                    {String(TIMELINE_BUCKETS.indexOf(bucket) + 1).padStart(2, "0")}
                  </span>
                  <h2 id={`b-owner-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
                </div>
                <p>{items.length} {items.length === 1 ? "item" : "items"}</p>
              </header>
              {items.length ? (
                <ol className={styles.ownerList}>
                  {items.map((item) => {
                    const selected = item.id === props.selectedItemId;
                    return (
                      <OwnerItemRow
                        key={item.id}
                        item={item}
                        selected={selected}
                        latestChange={latestChangeForItem(props.ownerPlan, item.id)}
                        onSelect={() => props.onSelect(item.id)}
                        tools={selected ? props.renderOwnerTools(item) : undefined}
                      />
                    );
                  })}
                </ol>
              ) : (
                <EmptyBucket bucket={bucket} />
              )}
            </section>
          );
        })}
      </div>

      <section className={styles.hiddenSection} aria-labelledby="b-hidden-heading">
        <div>
          <p className={styles.eyebrow}>Owner only</p>
          <h2 id="b-hidden-heading">Not on the public view</h2>
          <p>Restore an item when it is ready to appear in the plan again.</p>
        </div>
        {hiddenItems.length ? (
          <ul>
            {hiddenItems.map((item) => {
              const selected = item.id === props.selectedItemId;
              return (
                <li key={item.id} data-selected={selected || undefined}>
                  <button type="button" data-timeline-item-id={item.id} aria-pressed={selected} onClick={() => props.onSelect(item.id)}>
                    <span>{item.title}</span>
                    <span>{BUCKET_LABELS[item.bucket]}</span>
                  </button>
                  {selected ? props.renderOwnerTools(item) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptyBucket}>No items are hidden.</p>
        )}
      </section>
    </article>
  );
}

function PublicTitleLink({
  item,
  renderLink,
  className,
}: {
  item: PublicTimelineItem;
  renderLink: TimelineOptionProps["renderPublicItemLink"];
  className?: string;
}) {
  return renderLink(
    item,
    <span className={className}>{item.title}</span>,
  );
}

function PublicIndexSection({
  bucket,
  items,
  renderLink,
}: {
  bucket: TimelineBucket;
  items: PublicTimelineItem[];
  renderLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <section className={styles.publicIndexSection} aria-labelledby={`b-public-${bucket}`}>
      <header>
        <h2 id={`b-public-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
        <span>{String(items.length).padStart(2, "0")}</span>
      </header>
      {items.length ? (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <PublicTitleLink item={item} renderLink={renderLink} />
                <p>{item.summary}</p>
                {item.decision ? (
                  <p className={styles.publicDecision}>
                    Decided {formatDate(item.decision.date, true)} · {item.decision.reason}
                  </p>
                ) : null}
              </div>
              <div className={styles.indexMeta}>
                <DirectionMark state={item.secondaryState} />
                <span>{item.timing}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyBucket bucket={bucket} />
      )}
    </section>
  );
}

function PublicSurface(props: TimelineOptionProps) {
  const nowItems = bucketItems(props.plan.items, "now");
  const lead = nowItems[0];
  const remainingNow = nowItems.slice(1);

  return (
    <article className={styles.surface} data-density={props.density}>
      <header className={styles.publicHeader}>
        <p className={styles.eyebrow}>Option B · Public timeline</p>
        <h1>{props.plan.title}</h1>
        <p className={styles.purpose}>{props.plan.purpose}</p>
        <p className={styles.dateline}>
          Updated {formatDate(props.plan.updatedAt)} · {props.plan.author} · Revision {props.plan.revision}
        </p>
      </header>

      <section className={styles.nowLead} aria-labelledby="b-public-now">
        <header>
          <p className={styles.eyebrow}>Current direction</p>
          <h2 id="b-public-now">Now</h2>
        </header>
        {lead ? (
          <div className={styles.nowLeadBody}>
            <p className={styles.projectLine}>{lead.project}</p>
            <h3>
              <PublicTitleLink item={lead} renderLink={props.renderPublicItemLink} />
            </h3>
            <p>{lead.summary}</p>
            <dl>
              <div>
                <dt>Timing</dt>
                <dd>{lead.timing}</dd>
              </div>
              <div>
                <dt>Next step</dt>
                <dd>{lead.nextStep}</dd>
              </div>
            </dl>
            <DirectionMark state={lead.secondaryState} />
          </div>
        ) : (
          <EmptyBucket bucket="now" />
        )}
        {remainingNow.length ? (
          <ol className={styles.nowRemainder} aria-label="More in Now">
            {remainingNow.map((item) => (
              <li key={item.id}>
                <PublicTitleLink item={item} renderLink={props.renderPublicItemLink} />
                <span>{item.timing}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <div className={styles.editedIndex}>
        <PublicIndexSection
          bucket="soon"
          items={bucketItems(props.plan.items, "soon")}
          renderLink={props.renderPublicItemLink}
        />
        <PublicIndexSection
          bucket="later"
          items={bucketItems(props.plan.items, "later")}
          renderLink={props.renderPublicItemLink}
        />
      </div>

      <div className={styles.closingIndex}>
        <PublicIndexSection
          bucket="done"
          items={bucketItems(props.plan.items, "done")}
          renderLink={props.renderPublicItemLink}
        />
        <PublicIndexSection
          bucket="refused"
          items={bucketItems(props.plan.items, "refused")}
          renderLink={props.renderPublicItemLink}
        />
      </div>

      <footer className={styles.planFooter}>
        <span>Public plan</span>
        <span>Published {formatDate(props.plan.publishedAt)}</span>
        <span>Timeline by Signal Studio</span>
        <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
          {props.copySurfaceLinkLabel}
        </button>
      </footer>
    </article>
  );
}

function ChangePair({
  change,
  item,
}: {
  change: PublicPlanDto["changes"][number];
  item?: PublicTimelineItem;
}) {
  return (
    <li>
      <div>
        <span className={styles.label}>{formatDate(change.occurredAt, true)}</span>
        <h3>{item?.title ?? "Plan updated"}</h3>
        <p>{
          change.fromBucket && change.toBucket
            ? `${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`
            : change.kind === "refuse"
              ? "Moved to Refused"
              : "Details changed"
        }</p>
      </div>
      <div>
        <span className={styles.label}>Why</span>
        <p>{change.reason}</p>
      </div>
    </li>
  );
}

function UpdateDirectionColumn({
  title,
  items,
  renderLink,
}: {
  title: string;
  items: PublicTimelineItem[];
  renderLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <section className={styles.updateDirection} aria-labelledby={`b-update-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <h3 id={`b-update-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <PublicTitleLink item={item} renderLink={renderLink} />
              <span>{item.nextStep}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nothing to report.</p>
      )}
    </section>
  );
}

function UpdateSurface(props: TimelineOptionProps) {
  const visibleChanges = [...props.plan.changes]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    )
    .slice(0, props.density === "sparse" ? 1 : props.density === "dense" ? 5 : 3);
  const nowItems = bucketItems(props.plan.items, "now");
  const waitingItems = props.plan.items.filter((item) => item.secondaryState === "waiting-on-you");
  const nextItems = bucketItems(props.plan.items, "soon");
  const lead = nowItems[0] ?? nextItems[0];

  return (
    <section className={`${styles.surface} ${styles.updateSurface}`} data-density={props.density}>
      <article>
        <header className={styles.updateHeader}>
          <p className={styles.eyebrow}>Option B · Shared update</p>
          <h1>{props.plan.title}</h1>
          <p className={styles.updateStandfirst}>{props.plan.purpose}</p>
          <p className={styles.dateline}>
            Plan update · {formatDate(props.plan.updatedAt)} · {props.plan.author}
          </p>
        </header>

        <section className={styles.updateLead} aria-labelledby="b-current-direction">
          <p className={styles.eyebrow}>Current direction</p>
          <h2 id="b-current-direction">{lead?.title ?? "The direction is open"}</h2>
          <p>{lead?.summary ?? "There is no current item in the published plan."}</p>
          {lead ? (
            <div className={styles.leadNextStep}>
              <span className={styles.label}>Next step</span>
              <strong>{lead.nextStep}</strong>
            </div>
          ) : null}
        </section>

        <section className={styles.changeSection} aria-labelledby="b-what-changed">
          <header>
            <p className={styles.eyebrow}>Since the last update</p>
            <h2 id="b-what-changed">What changed, and why</h2>
          </header>
          {visibleChanges.length ? (
            <ol>
              {visibleChanges.map((change) => (
                <ChangePair
                  key={change.id}
                  change={change}
                  item={props.plan.items.find((item) => item.id === change.itemId)}
                />
              ))}
            </ol>
          ) : (
            <p className={styles.emptyBucket}>No public changes have been recorded yet.</p>
          )}
        </section>

        <section className={styles.directionBrief} aria-labelledby="b-direction-brief">
          <h2 id="b-direction-brief">Where attention sits</h2>
          <div>
            <UpdateDirectionColumn title="Now" items={nowItems} renderLink={props.renderPublicItemLink} />
            <UpdateDirectionColumn
              title="Waiting on you"
              items={waitingItems}
              renderLink={props.renderPublicItemLink}
            />
            <UpdateDirectionColumn title="Coming up" items={nextItems} renderLink={props.renderPublicItemLink} />
          </div>
        </section>

        <section className={styles.planAtGlance} aria-labelledby="b-plan-glance">
          <header>
            <p className={styles.eyebrow}>Full plan</p>
            <h2 id="b-plan-glance">Plan at a glance</h2>
          </header>
          <div>
            {TIMELINE_BUCKETS.map((bucket) => {
              const items = bucketItems(props.plan.items, bucket);
              return (
                <div className={styles.planAtGlanceBucket} key={bucket}>
                  <h3 id={`b-update-ladder-${bucket}`}>{BUCKET_LABELS[bucket]}</h3>
                  <span>{items.length}</span>
                  {items.length ? (
                    <ul>
                      {items.map((item) => (
                        <li key={item.id}>
                          <PublicTitleLink item={item} renderLink={props.renderPublicItemLink} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nothing here yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className={styles.updateFooter}>
          <span>Timeline by Signal Studio</span>
          <span>Revision {props.plan.revision}</span>
          <button className={styles.artifactAction} type="button" onClick={props.onCopySurfaceLink}>
            {props.copySurfaceLinkLabel}
          </button>
        </footer>
      </article>
    </section>
  );
}

function PlanContext({
  plan,
  selectedItemId,
  renderLink,
}: {
  plan: PublicPlanDto;
  selectedItemId: string;
  renderLink: TimelineOptionProps["renderPublicItemLink"];
}) {
  return (
    <nav className={styles.planContext} aria-label="Plan context">
      <p className={styles.eyebrow}>Plan context</p>
      {TIMELINE_BUCKETS.map((bucket) => {
        const items = bucketItems(plan.items, bucket);
        return (
          <section key={bucket} aria-labelledby={`b-detail-context-${bucket}`}>
            <header>
              <h2 id={`b-detail-context-${bucket}`}>{BUCKET_LABELS[bucket]}</h2>
              <span>{items.length}</span>
            </header>
            {items.length ? (
              <ul>
                {items.map((item) => (
                  <li key={item.id} data-current={item.id === selectedItemId || undefined}>
                    <PublicTitleLink item={item} renderLink={renderLink} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nothing here yet.</p>
            )}
          </section>
        );
      })}
    </nav>
  );
}

function DetailSurface(props: TimelineOptionProps) {
  const item = props.plan.items.find((candidate) => candidate.id === props.selectedItemId);
  const itemChanges = item
    ? [...props.plan.changes]
        .filter((change) => change.itemId === item.id)
        .sort(
          (left, right) =>
            new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
        )
    : [];
  if (!item) {
    return (
      <section className={styles.statePanel}>
        <p className={styles.eyebrow}>Option B · Item detail</p>
        <h1 data-detail-focus tabIndex={-1}>This item is not on the public plan.</h1>
        <p>Return to the public plan to choose an available item.</p>
        <button className={styles.returnAction} type="button" onClick={() => props.onSurfaceChange("public")}>
          ← Back to public plan
        </button>
        <PlanContext
          plan={props.plan}
          selectedItemId={props.selectedItemId}
          renderLink={props.renderPublicItemLink}
        />
      </section>
    );
  }

  return (
    <section className={`${styles.surface} ${styles.detailSurface}`} data-density={props.density}>
      <header className={styles.detailHeader}>
        <p className={styles.eyebrow}>Option B · Item detail · {BUCKET_LABELS[item.bucket]}</p>
        <h1 data-detail-focus tabIndex={-1}>{item.title}</h1>
        <p>{item.summary}</p>
        <button className={styles.returnAction} type="button" onClick={() => props.onSurfaceChange("public")}>
          ← Back to public plan
        </button>
        <div className={styles.detailStatus}>
          <span>{BUCKET_LABELS[item.bucket]}</span>
          <DirectionMark state={item.secondaryState} />
          <span>Updated {formatDate(item.updatedAt)}</span>
        </div>
      </header>

      <div className={styles.detailComposition}>
        <article className={styles.detailNarrative}>
          <section aria-labelledby="b-detail-direction">
            <p className={styles.eyebrow}>Direction</p>
            <h2 id="b-detail-direction">What this means now</h2>
            <p className={styles.detailSummary}>{item.summary}</p>
          </section>

          <section aria-labelledby="b-detail-next-step">
            <p className={styles.eyebrow}>Next step</p>
            <h2 id="b-detail-next-step">{item.nextStep}</h2>
            <p>Timing: {item.timing}. Confidence: {confidenceLabel(item.confidence)}.</p>
          </section>

          {item.decision ? (
            <section className={styles.decisionRecord} aria-labelledby="b-detail-decision">
              <p className={styles.eyebrow}>Decision · {formatDate(item.decision.date)}</p>
              <h2 id="b-detail-decision">Why this was refused</h2>
              <p>{item.decision.reason}</p>
            </section>
          ) : null}

          <section className={styles.detailHistory} aria-labelledby="b-detail-history">
            <p className={styles.eyebrow}>Public record</p>
            <h2 id="b-detail-history">What changed</h2>
            {itemChanges.length ? (
              <ol>
                {itemChanges.map((change) => (
                  <li key={change.id}>
                    <time dateTime={change.occurredAt}>{formatDate(change.occurredAt)}</time>
                    <div>
                      <strong>{
                        change.fromBucket && change.toBucket
                          ? `${BUCKET_LABELS[change.fromBucket]} to ${BUCKET_LABELS[change.toBucket]}`
                          : "Details updated"
                      }</strong>
                      <p>{change.reason}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyBucket}>No public changes have been recorded yet.</p>
            )}
          </section>
        </article>

        <aside className={styles.detailFacts} aria-label="Item facts">
          <p className={styles.eyebrow}>At a glance</p>
          <dl>
            <div>
              <dt>Project</dt>
              <dd>{item.project}</dd>
            </div>
            <div>
              <dt>Direction</dt>
              <dd>{BUCKET_LABELS[item.bucket]}</dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>{item.timing}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{confidenceLabel(item.confidence)}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{formatDate(props.plan.publishedAt)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <PlanContext
        plan={props.plan}
        selectedItemId={item.id}
        renderLink={props.renderPublicItemLink}
      />
    </section>
  );
}

export function OptionB(props: TimelineOptionProps) {
  const scenarioPanel = <ScenarioPanel scenario={props.scenario} surface={props.surface} />;
  if (props.scenario === "loading" || props.scenario === "error") return scenarioPanel;

  if (props.surface === "owner") return <OwnerSurface {...props} />;
  if (props.surface === "public") return <PublicSurface {...props} />;
  if (props.surface === "update") return <UpdateSurface {...props} />;
  return <DetailSurface {...props} />;
}
