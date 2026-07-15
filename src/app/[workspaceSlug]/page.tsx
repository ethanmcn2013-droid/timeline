import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { formatRelative } from "@/lib/format";
import { currentState, type CurrentState } from "@/lib/roadmap/current-state";
import { anchorMilestone, countdown, countdownToken } from "@/lib/roadmap/anchor";
import {
  getWorkspace,
  getProjectsForWorkspace,
  getTasksForWorkspace,
  getEffectiveNodesForWorkspace,
  getLastUpdatedForWorkspace,
  isWorkspacePublished,
} from "@/server/db/queries";
import { getCurrentUser } from "@/server/auth";
import type { Task, Project } from "@/server/db/schema";
import { WorkspaceHeader } from "@/components/roadmap/workspace-header";
import { MetaStrip } from "@/components/roadmap/meta-strip";
import { ShortcutsOverlay } from "@/components/roadmap/shortcuts-overlay";
import {
  WorkspaceViewSwitcher,
  WorkspaceViewSwitcherStatic,
} from "@/components/roadmap/workspace-view-switcher";
import {
  WorkspaceViewBody,
  WorkspaceViewBodyStatic,
} from "@/components/roadmap/workspace-view-client";
import { GanttView } from "@/components/roadmap/gantt-view";
import { WorkspaceTimeline } from "@/components/roadmap/workspace-timeline";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getRequestTime } from "@/lib/request-time";

// Public roadmap is read-only, ISR with a 5-min window. The page reads
// NO dynamic APIs (no searchParams/cookies/headers) so this revalidate
// genuinely engages, every shared-link hit is served from cache, not a
// fresh 4-query Turso round-trip. The source-save action calls
// revalidatePath on edit so stakeholders see changes immediately rather
// than waiting out the window. View selection (?view=) is resolved
// client-side by WorkspaceViewBody, see that component for why reading
// it server-side here would silently break ISR.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) return { title: "Not Found" };
  const [published, currentUser] = await Promise.all([
    isWorkspacePublished(workspaceSlug),
    getCurrentUser(),
  ]);
  if (!published && currentUser?.userId !== workspace.ownerUserId) {
    return { title: "Timeline", robots: { index: false, follow: false } };
  }
  return {
    title: `${workspace.name}, Timeline`,
    description: `Public roadmap for ${workspace.name}.`,
  };
}

// ── P1-3 shell / content split ────────────────────────────────────────────────
// The outer page component resolves only getWorkspace (React-cached, the
// generateMetadata call above reuses the same request-deduped query).
// Everything that requires data, the draft/publish gate plus the four heavy
// reads, lives in WorkspaceContentWell behind a Suspense boundary scoped to
// the content well only. The WorkspaceHeader + ShortcutsOverlay paint
// immediately from the cache; they never re-blank while the data resolves.
//
// revalidate=300 still engages: the outer shell and the content well are
// co-located in the same route segment, so ISR caches the whole composed
// output at the pathname boundary. The Suspense split is a streaming
// concern, not a caching concern.

export default async function WorkspaceRoadmapPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  // getWorkspace is React-cached, shared with generateMetadata above and
  // with WorkspaceContentWell below (all three reuse one Turso round-trip).
  const workspace = await getWorkspace(workspaceSlug);
  if (!workspace) notFound();

  return (
    // data-workspace-view-root: anchor for the pre-paint inline script that
    // sets data-view="<active>" before first render so CSS immediately shows
    // only the deep-linked view panel without a flash. Placed on the outer
    // shell so the script is present even during Suspense resolution.
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--bg)" }}
      data-workspace-view-root
    >
      {/*
        Pre-paint view selection: runs synchronously during HTML parse,
        before any pixels are drawn. Reads ?view= from the URL, sets
        data-view on the root wrapper, and corrects aria-current on the
        static switcher tabs so the correct panel and active tab are
        visible on the very first frame, no flash, no hydration wait.

        Paired <style> block: hides non-matching panels when data-view is
        set (deep-linked non-overview views only, when there is no view
        param the attribute is absent and no CSS fires, so overview shows
        as the safe default).

        No-JS: script never runs → no data-view → overview shows (correct).
        Hydration: WorkspaceViewBody + WorkspaceViewSwitcher take over for
        subsequent in-page switching, making the data-view attribute and
        static aria-current values irrelevant.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* Gantt is the default: the timeline panel is hidden until ?view=timeline is
   deep-linked (set on the root by the pre-paint script below). This default
   hiding works with no JS at all, the bare URL renders the Gantt view. */
[data-view-panel="timeline"] { display: none; }
[data-workspace-view-root][data-view="timeline"] [data-view-panel="timeline"] { display: revert; }
[data-workspace-view-root][data-view="timeline"] [data-view-panel="gantt"] { display: none; }
`.trim(),
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{
var m=location.search.match(/[?&]view=(timeline)(?:&|$)/);
if(!m)return;
var v=m[1];
var root=document.querySelector('[data-workspace-view-root]');
if(!root)return;
root.setAttribute('data-view',v);
var tabs=root.querySelectorAll('[data-view-tab]');
for(var i=0;i<tabs.length;i++){
  var t=tabs[i];
  var tid=t.getAttribute('data-view-tab');
  if(tid===v){
    t.setAttribute('aria-current','page');
    t.style.color='#ffffff';
    t.style.background='var(--ink)';
  } else {
    t.removeAttribute('aria-current');
    t.style.color='var(--ink-quiet)';
    t.style.background='transparent';
  }
}
}catch(e){}})();`,
        }}
      />

      {/* Chrome: renders from the React-cached getWorkspace, no Turso
          round-trip beyond what generateMetadata already consumed.
          refusedCount=0 here; WorkspaceHeader will update when content
          resolves via the content well (nice-to-have detail, not blocking). */}
      <WorkspaceHeader workspace={workspace} refusedCount={0} />
      <ShortcutsOverlay />

      {/* Content well: draft gate + 4 heavy reads deferred to Suspense.
          The header above always paints first; the content area streams in
          behind it. Fallback scoped to the content well only (P1-3). */}
      <Suspense fallback={null}>
        <WorkspaceContentWell workspaceSlug={workspaceSlug} workspace={workspace} />
      </Suspense>
    </div>
  );
}

// ── Content-well fallback (RW-5) ─────────────────────────────────────────────
// Wordmark identity loader, replaces the prior SuiteLoaderField bare 12px dot
// (whose `var(--load-dot-size, 12px)` was visually swallowed by the cross-origin
// pre-CSS window, reading as a much larger circle to the visitor). Letters of
// "roadmap" rise with stagger; indigo dot lands with overshoot; canonical
// Roadmap sweep gesture continues during the wait. Server Component, zero JS.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ContentWellFallback() {
  const word = "timeline";
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontFamily:
            'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          color: "var(--ink, #14151a)",
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
        }}
      >
        {word.split("").map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `signal-letter-rise 280ms cubic-bezier(0.16,1,0.3,1) ${i * 55}ms both`,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 11,
            height: 11,
            maxWidth: 11,
            maxHeight: 11,
            borderRadius: "50%",
            background: "var(--indigo, #4f46e5)",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 55 + 80}ms both, signal-timeline-pass 5.4s cubic-bezier(.22,.7,.2,1) ${word.length * 55 + 600}ms infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes signal-letter-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes signal-dot-land {
          0%   { opacity: 0; transform: translateY(-2px) scale(0.4); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.18); }
          100% { opacity: 1; transform: translateY(-2px) scale(1); }
        }
        @keyframes signal-timeline-pass {
          0%   { transform: translateY(-2px) translateX(0); opacity: 1; }
          60%  { transform: translateY(-2px) translateX(4px); opacity: 1; }
          62%  { transform: translateY(-2px) translateX(4px); opacity: 0; }
          70%  { transform: translateY(-2px) translateX(0);   opacity: 0; }
          78%  { transform: translateY(-2px) translateX(0);   opacity: 1; }
          100% { transform: translateY(-2px) translateX(0);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-timeline-pass {
            from, to { transform: translateY(-2px); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
// ── Content well ─────────────────────────────────────────────────────────────
// Async Server Component owning the draft/publish gate + the 4 heavy reads.
// Sits behind the Suspense boundary above. The WorkspaceHeader renders before
// this resolves (P1-3 fix).
//
// workspace is already resolved by the outer page component from the cache —
// passed down to avoid a second lookup while keeping the type narrowed.
async function WorkspaceContentWell({
  workspaceSlug,
  workspace,
}: {
  workspaceSlug: string;
  workspace: {
    ownerUserId: string;
    name: string;
    isDemo: boolean;
    description: string | null;
    slug: string;
    ownerName: string | null;
  };
}) {
  // Draft/publish gate (Layer 1, seamless-ecosystem-2026-05-18).
  // Run in parallel to keep the happy path fast.
  //
  // Rule:
  //   - Published → everyone sees the roadmap.
  //   - Draft + owner (current authed user) → owner preview allowed.
  //   - Draft + non-owner (or logged out) → calm "Not published yet" content.
  //
  // This is NOT a login wall. Logged-out visitors to a draft workspace see
  // the friendly not-published message, not a sign-in redirect.
  const [published, currentUser] = await Promise.all([
    isWorkspacePublished(workspaceSlug),
    getCurrentUser(),
  ]);
  const isOwner = currentUser?.userId === workspace.ownerUserId;
  if (!published && !isOwner) {
    return (
      <>
        <DraftNotPublishedContent workspaceName={workspace.name} />
        <SiteFooter />
      </>
    );
  }

  // Single data fetch, both views share this payload.
  // No per-view branching in the data layer; ISR remains intact.
  // effectiveNodes is included to support manual-only workspaces (D1 fix):
  // milestones created via "+ Add a milestone" live only in node_overlays,
  // not in the tasks table. getEffectiveNodesForWorkspace is React-cached so
  // this call deduplicates with any prior call in the same request.
  const [projects, allTasks, effectiveNodes, lastUpdated] = await Promise.all([
    getProjectsForWorkspace(workspaceSlug),
    getTasksForWorkspace(workspaceSlug),
    getEffectiveNodesForWorkspace(workspaceSlug),
    getLastUpdatedForWorkspace(workspaceSlug),
  ]);

  // Workspace-level status counts derived from the task list already fetched,
  // rather than a second full-table read (was getCountsForWorkspace).
  const counts = {
    total: allTasks.length,
    shipped: 0,
    inFlight: 0,
    waiting: 0,
    next: 0,
    refused: 0,
  };
  for (const t of allTasks) {
    if (t.status === "shipped") counts.shipped++;
    else if (t.status === "in-flight") counts.inFlight++;
    else if (t.status === "waiting") counts.waiting++;
    else if (t.status === "next") counts.next++;
    else if (t.status === "refused") counts.refused++;
  }

  const projectMap = new Map<string, Project>(projects.map((p) => [p.slug, p]));

  // Non-refused, non-milestone tasks, the items the Gantt plots.
  const visibleTasks = allTasks.filter(
    (t) => t.status !== "refused" && t.kind !== "milestone",
  );

  // Milestones (kind=milestone OR isLaunch), sorted by targetDate asc,
  // un-dated last. Refused milestones drop out.
  //
  // D1 fix: manual milestones (source="manual" in node_overlays, never
  // written to tasks) are not in allTasks. Merge them in from effectiveNodes
  // so manual-only workspaces render milestones on the public page.
  // Manual nodes are hidden=false (hidden ones are excluded by isWorkspacePublished
  // and the owner uses the curation surface to toggle them).
  const syncedMilestones = allTasks.filter(
    (t) => (t.kind === "milestone" || t.isLaunch) && t.status !== "refused",
  );
  // Ids of synced milestones already accounted for, prevents double-rendering
  // an effective node whose backing task row is already in syncedMilestones.
  const syncedMilestoneIds = new Set(syncedMilestones.map((t) => t.id));
  // Fabricate Task-shaped objects for manual nodes so all downstream consumers
  // (the Gantt + Timeline views, milestone nodes) work unchanged.
  // Only fields actually read by those consumers are populated; the rest get
  // safe zero-values. The first project slug is used as projectSlug because
  // manual nodes are workspace-scoped, not project-scoped at the DB level.
  const defaultProjectSlug = projects[0]?.slug ?? workspaceSlug;
  const manualMilestones: Task[] = effectiveNodes
    .filter(
      (n) =>
        n.source === "manual" &&
        !n.hidden &&
        n.status !== "refused" &&
        !syncedMilestoneIds.has(n.id),
    )
    .map((n) => ({
      id: n.id,
      projectSlug: defaultProjectSlug,
      workspaceSlug,
      title: n.title,
      description: "",
      status: n.status,
      phase: null,
      tier: null,
      assignee: "claude-code" as const,
      cycleLabel: null,
      targetDate: n.targetDate,
      sortOrder: n.sortOrder,
      kind: "milestone" as const,
      category: null,
      priority: null,
      blockerId: null,
      unblocks: null,
      weekHeading: null,
      channel: null,
      isLaunch: true,
      day: null,
      postingTime: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      completedAt: null,
    }));

  const milestones = [...syncedMilestones, ...manualMilestones].sort((a, b) => {
    if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    return a.sortOrder - b.sortOrder;
  });

  // Date range across all targetDates for the meta strip.
  const datedTasks = allTasks
    .filter((t) => t.targetDate && t.status !== "refused")
    .map((t) => t.targetDate!);
  const dateRange = datedTasks.length
    ? {
        from: datedTasks.reduce((a, b) => (a < b ? a : b)),
        to: datedTasks.reduce((a, b) => (a > b ? a : b)),
      }
    : null;

  const totalForProgress = counts.total - counts.refused;
  const progress = totalForProgress > 0 ? counts.shipped / totalForProgress : 0;

  // D1 fix: a manual-only workspace has allTasks.length === 0 but has
  // visible effective nodes. hasItems gates the "Nothing here yet" path,
  // so we must include non-hidden effective nodes in the count.
  const visibleEffectiveNodes = effectiveNodes.filter((n) => !n.hidden);
  const hasItems = allTasks.length > 0 || visibleEffectiveNodes.length > 0;
  // isDemoWorkspace: reads the explicit schema flag, not a reserved-slug check.
  const isDemoWorkspace = workspace.isDemo;

  // The dial + Next-milestone lockup earn their hero placement only
  // when the workspace tells a *story*, not when it's just rendering a count.
  const hasMomentum = totalForProgress >= 5 || milestones.length > 0;

  // H1 always ends in a period, the rhythmic signature of the brand —
  // without doubling up when a workspace name already ends in one.
  const heroTitle = /[.!?]$/.test(workspace.name)
    ? workspace.name
    : `${workspace.name}.`;

  // Single-glance verdict, "where does this stand?" answered before
  // the title lands. Derived entirely from data already fetched; no
  // extra query, ISR intact. Renders on every breakpoint (the
  // milestone emphasis block is desktop-only; this line is the
  // mobile reader's only date read).
  // One clock read per request, threaded to every time-relative child
  // (verdict + anchor countdown) so the whole hero agrees on "now".
  const now = getRequestTime();
  const verdict = hasItems ? currentState(allTasks, milestones, now) : null;

  // Per-milestone progress: share of non-refused dated items due on or
  // before the milestone date that have shipped. Cheap O(n·m).
  const milestoneScopes = milestones.map((m) => {
    if (!m.targetDate) {
      return { inScope: counts.total - counts.refused, shipped: counts.shipped };
    }
    let inScope = 0;
    let shipped = 0;
    for (const t of allTasks) {
      if (t.status === "refused") continue;
      if (t.kind === "milestone" || t.isLaunch) continue;
      if (!t.targetDate) continue;
      if (t.targetDate > m.targetDate) continue;
      inScope++;
      if (t.status === "shipped") shipped++;
    }
    if (inScope === 0) {
      return { inScope: counts.total - counts.refused, shipped: counts.shipped };
    }
    return { inScope, shipped };
  });

  // Serialisable milestone nodes for the Timeline view: scope + feeding-item
  // statuses precomputed server-side (functions can't cross the RSC boundary).
  const milestoneNodes = milestones.map((m, i) => {
    const feeding = allTasks
      .filter((t) => {
        if (t.status === "refused") return false;
        if (t.kind === "milestone" || t.isLaunch) return false;
        if (!m.targetDate) return true;
        if (!t.targetDate) return false;
        return t.targetDate <= m.targetDate;
      })
      .map((t) => t.status);
    return {
      id: m.id,
      title: m.title,
      projectSlug: m.projectSlug,
      targetDate: m.targetDate,
      status: m.status,
      inScope: milestoneScopes[i].inScope,
      shipped: milestoneScopes[i].shipped,
      feeding,
    };
  });

  return (
    <>
      {/* Demo banner, gated to the owner. A non-owner who follows a shared
          link to the demo workspace did not arrive looking for "what your
          roadmap could look like"; they arrived to read the work. The banner
          is the operator's framing, not the recipient's. (REVIEW Gap 1, L2.) */}
      {isDemoWorkspace && isOwner && (
        <div
          className="w-full border-b px-6 py-2 text-center text-[12px] text-ink-soft"
          style={{ background: "var(--bg-deep)", borderColor: "var(--line-soft)" }}
        >
          You&apos;re viewing a public demo workspace, this is what your roadmap could look like.
        </div>
      )}

      <main className="flex-1">
        {/* Hero, typographic title + meta strip + progress dial + view switcher */}
        <section className="border-b border-line-soft/60 px-6 pb-10 pt-12">
          <div className="mx-auto w-full max-w-[1240px]">
            {/* MetaStrip, owner-only. The uppercase mono row of name ·
                date-range · weeks · milestone-count is decoration that costs
                the recipient a full visual sweep before the H1 lands. The
                title + "Shared by … Last updated …" already carry identity,
                attribution, and recency for the non-logged-in reader.
                (REVIEW Gap 1, L2.) */}
            {isOwner ? (
              <MetaStrip
                anchor={workspace.name}
                items={[
                  dateRange ? `${formatShortDate(dateRange.from)} → ${formatShortDate(dateRange.to)}` : null,
                  dateRange
                    ? `${weeksBetween(dateRange.from, dateRange.to)} weeks`
                    : null,
                  milestones.length > 0
                    ? `${milestones.length} milestone${milestones.length === 1 ? "" : "s"}`
                    : null,
                ]}
              />
            ) : null}

            {/* Title + dial row */}
            <div className="flex items-start justify-between gap-8">
              <div className="min-w-0 flex-1">
                {verdict ? <CurrentStateLine state={verdict} /> : null}
                <h1 className="text-[clamp(1.85rem,1.25rem+2.8vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink text-balance">
                  {heroTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-[16px] leading-[1.55] text-ink-soft">
                  {workspace.description?.trim() ||
                    `What ${workspace.name} is building next, written in plain English.`}
                </p>
                {/* Last updated + owner + view switcher row */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {(workspace.ownerName || lastUpdated) ? (
                    <p className="text-[12.5px] text-ink-quiet">
                      {workspace.ownerName ? (
                        <>
                          Shared by{" "}
                          <span className="font-medium text-ink-soft">
                            {workspace.ownerName}
                          </span>
                        </>
                      ) : null}
                      {workspace.ownerName && lastUpdated ? (
                        <span className="mx-1.5 text-ink-faint">&middot;</span>
                      ) : null}
                      {lastUpdated ? (
                        <>
                          Last updated{" "}
                          <span className="text-ink-soft">
                            {formatRelative(lastUpdated)}
                          </span>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                  {/* View switcher, client island. Suspense required because
                      useSearchParams() suspends until params are known.
                      The static fallback renders the nav in SSR HTML so
                      no-JS visitors see the tabs immediately. */}
                  <Suspense fallback={<WorkspaceViewSwitcherStatic workspaceSlug={workspaceSlug} />}>
                    <WorkspaceViewSwitcher workspaceSlug={workspaceSlug} />
                  </Suspense>
                </div>
              </div>

              {hasItems && totalForProgress > 0 ? (
                hasMomentum ? (
                  <div className="hidden flex-shrink-0 sm:block">
                    {/* CREATIVE_SPEC §1.4: one composed milestone emphasis block —
                        NextMilestoneStrip + ProgressRing collapsed into a single unit. */}
                    <MilestoneEmphasisBlock
                      milestones={milestones}
                      progress={progress}
                      totalForProgress={totalForProgress}
                      shipped={counts.shipped}
                      now={now}
                    />
                  </div>
                ) : (
                  <div className="hidden flex-shrink-0 self-end text-right sm:block">
                    <span className="text-[12px] tabular-nums text-ink-quiet">
                      {counts.shipped} of {totalForProgress} shipped
                    </span>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </section>

        {/* ── View body ─────────────────────────────────────────────────────── */}
        {!hasItems ? (
          // Published workspace with projects but no items yet (can occur if
          // the owner publishes right after content is removed). The prior copy
          // "Nothing yet. The owner is still drafting." is wrong here, the
          // owner is NOT drafting, the workspace is published. Calm, accurate.
          <section className="px-6 py-24 text-center">
            <div className="mx-auto max-w-md space-y-2">
              <p className="text-[15px] text-ink-soft">
                Nothing here yet.
              </p>
              <p className="text-[13px] text-ink-quiet">
                This page updates as the plan moves, check back, or bookmark it.
              </p>
            </div>
          </section>
        ) : (
          /* Both views are server-rendered once from the single data fetch;
             WorkspaceViewBody (client) shows the one matching ?view=.
             Suspense is required by useSearchParams. The static fallback
             pre-renders both panels in SSR HTML; the pre-paint CSS shows the
             Gantt by default and the pre-paint script flips to Timeline for a
             deep-linked ?view=timeline, so no-JS visitors get the Gantt. */
          (() => {
            const gantt = (
              <GanttView
                tasks={visibleTasks}
                milestones={milestones}
                projects={projects}
                projectMap={projectMap}
              />
            );
            const timeline = (
              <WorkspaceTimeline
                milestones={milestoneNodes}
                projects={projects}
              />
            );
            return (
              <Suspense
                fallback={
                  <WorkspaceViewBodyStatic gantt={gantt} timeline={timeline} />
                }
              >
                <WorkspaceViewBody gantt={gantt} timeline={timeline} />
              </Suspense>
            );
          })()
        )}
      </main>

      <SiteFooter />
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function weeksBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T00:00:00Z").getTime();
  const to = new Date(toIso + "T00:00:00Z").getTime();
  const weeks = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24 * 7)));
  return weeks;
}

/**
 * Format ISO date as "Jun 12", CREATIVE_SPEC §1.3.
 * Year shown only when it differs from the current calendar year.
 */
function formatShortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const d = new Date(year, Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(year !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
}

/**
 * Single-glance current-state line, the first thing a recipient reads.
 *
 * One sentence in the product's voice, above the title:
 *   "On track for Jun 14."          (dot: shipped-green)
 *   "Aiming for Jun 14."            (dot: flight-amber, honest, unshaming)
 *   "Everything here has shipped."  (dot: shipped-green)
 *
 * No counts, no percentages, no red. The verb carries the truth; the
 * receipts stay on owner surfaces. Server-rendered, zero JS.
 */
function CurrentStateLine({ state }: { state: CurrentState }) {
  const label =
    state.kind === "shipped"
      ? "Everything here has shipped."
      : state.kind === "on-track"
        ? `On track for ${formatShortDate(state.date)}.`
        : `Aiming for ${formatShortDate(state.date)}.`;
  const dot =
    state.kind === "aiming"
      ? "var(--status-flight, #f59e0b)"
      : "var(--status-shipped, #10b981)";

  return (
    <p className="mb-3 flex items-center gap-2 text-[13.5px] font-medium text-ink">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ background: dot }}
      />
      {label}
    </p>
  );
}

/**
 * CREATIVE_SPEC §1.4, milestone emphasis block.
 * Collapses the prior NextMilestoneStrip + ProgressRing sibling pair into
 * one composed unit: eyebrow + title + date/count meta on the left,
 * 48px ProgressRing on the right. One block, not two widgets.
 *
 * Exact tokens from §1.4:
 *   padding: 16px 20px
 *   border: 1px solid var(--hairline)
 *   border-radius: 10px   (--r-3)
 *   background: var(--paper)
 *   min-width: 220px, max-width: 280px
 *
 * The T-N countdown number uses var(--accent), one of six named indigo uses
 * (CREATIVE_SPEC §1.7). Everything else stays ink / ink-quiet.
 */
function MilestoneEmphasisBlock({
  milestones,
  progress,
  totalForProgress,
  shipped,
  now,
}: {
  milestones: Task[];
  progress: number;
  totalForProgress: number;
  shipped: number;
  now: number;
}) {
  // The anchor is the day the whole plan points at, the wedding, the
  // go-live, the launch, not the next waypoint. Leading the block with its
  // countdown is the context the reader actually wants. §1.4 is kept intact:
  // the ring still earns its hero placement beside the number.
  const anchor = anchorMilestone(milestones);
  const c = anchor?.targetDate ? countdown(anchor.targetDate, now) : null;
  // A day already met is not a countdown; the block falls back to progress.
  const showCountdown = c !== null && c.kind !== "past";
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const size = 48;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div
      style={{
        padding: "16px 20px",
        border: "1px solid var(--hairline, #e4e4e7)",
        borderRadius: 10,
        background: "var(--paper, #ffffff)",
        minWidth: 220,
        maxWidth: 280,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Left: eyebrow + countdown + title + date meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Eyebrow, §1.4 exact token */}
        <div
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-quiet)",
            marginBottom: 6,
          }}
        >
          {showCountdown ? "Building toward" : "Progress"}
        </div>

        {showCountdown ? (
          <>
            {/* The countdown, promoted to the block's primary value.
                §1.7: T-N is the one indigo use in this block. */}
            <div
              style={{
                fontFamily: "var(--font-mono-stack)",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "var(--accent, #4f46e5)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {countdownToken(c!)}
            </div>
            {/* Anchor title, §1.4: 600 / -0.02em, one line */}
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {anchor!.title}
            </div>
            {/* Date + count meta, §1.4 mono 11px */}
            <div
              style={{
                fontFamily: "var(--font-mono-stack)",
                fontSize: 11,
                color: "var(--ink-quiet)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span>{formatShortDate(anchor!.targetDate!)}</span>
              {totalForProgress > 0 ? (
                <span>
                  {shipped} of {totalForProgress} shipped
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {/* No upcoming dated day, the block still earns its place by
                carrying the ring; the copy stays quiet. */}
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {totalForProgress > 0
                ? `${shipped} of ${totalForProgress} shipped`
                : "In progress"}
            </div>
            {anchor?.targetDate ? (
              <div
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 11,
                  color: "var(--ink-quiet)",
                  marginTop: 4,
                }}
              >
                {formatShortDate(anchor.targetDate)}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Right: 48px ProgressRing, inside the block per §1.4 */}
      <div
        role="img"
        aria-label={`Progress: ${pct}%`}
        style={{ position: "relative", flexShrink: 0, width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--status-shipped)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono-stack)",
            fontSize: Math.round(size * 0.28),
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1,
          }}
        >
          {pct}
          <span style={{ fontSize: 8, opacity: 0.7, marginLeft: 1 }}>%</span>
        </span>
      </div>
    </div>
  );
}

// ── Draft / not-published content ─────────────────────────────────────────────
// Shown inside the content well (behind WorkspaceHeader) to non-owners
// visiting a draft workspace. Not a 404, not a login wall. Brand voice:
// plain English, no "error" framing, no sign-in invitation.
//
// The outer shell always renders WorkspaceHeader; this component only
// provides the content area message. LAYER0_ROUTE_ALLOWLIST.md §Roadmap.

function DraftNotPublishedContent({ workspaceName }: { workspaceName: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-sm">
        <p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Not published yet
        </p>
        <h1
          className="mb-4 text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] font-semibold leading-[1.1]"
          style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
        >
          {workspaceName}.
        </h1>
        <p
          className="mb-10 text-[15px] leading-[1.55]"
          style={{ color: "var(--ink-soft)" }}
        >
          This plan isn&apos;t public yet. The owner will share it when it&apos;s ready.
        </p>
      </div>
    </main>
  );
}
