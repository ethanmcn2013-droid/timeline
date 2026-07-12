import Link from "next/link";
import type { AudienceTimelineDto } from "@/lib/audience-timeline";
import { ProjectorControls } from "./projector-controls";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatCalendarDate(date: string): string {
  return DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

function dateFacts(dto: AudienceTimelineDto) {
  const items = dto.sections.flatMap((section) => section.items);
  const dates = items.flatMap((item) => (item.date ? [item.date] : [])).sort();
  const covered = items.filter((item) => item.state === "covered").length;
  const nextFixed = dates.find((date) => date >= dto.today) ?? null;
  return {
    itemCount: items.length,
    covered,
    from: dates.at(0) ?? null,
    to: dates.at(-1) ?? null,
    nextFixed,
  };
}

export function AudienceTimelineView({
  dto,
  token,
  projector = false,
}: {
  dto: AudienceTimelineDto;
  token: string;
  projector?: boolean;
}) {
  const facts = dateFacts(dto);
  return (
    <main
      className={
        projector
          ? "min-h-screen bg-white px-4 py-8 sm:px-10 sm:py-12"
          : "min-h-screen bg-[var(--bg)] px-4 py-8 sm:px-6 sm:py-12"
      }
    >
      <div className={projector ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}>
        <header className="border-b border-line-soft pb-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                {dto.audienceKind} timeline
              </p>
              <h1
                className={
                  projector
                    ? "mt-3 text-[clamp(2.5rem,1.7rem+4vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink"
                    : "mt-3 text-[clamp(2rem,1.4rem+3vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink"
                }
              >
                {dto.label}
              </h1>
              {dto.ownerDisplayLabel ? (
                <p className="mt-3 text-sm text-ink-soft">{dto.ownerDisplayLabel}</p>
              ) : null}
            </div>
            {!projector ? (
              <Link
                href={`/s/${token}/present`}
                className="inline-flex min-h-11 items-center justify-center self-start rounded-lg border border-line-soft bg-white px-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Projector view
              </Link>
            ) : (
              <ProjectorControls />
            )}
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-quiet">Time window</dt>
              <dd className="mt-2 text-sm font-medium text-ink">
                {facts.from && facts.to
                  ? facts.from === facts.to
                    ? formatCalendarDate(facts.from)
                    : `${formatCalendarDate(facts.from)} – ${formatCalendarDate(facts.to)}`
                  : "Dates added as they settle"}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-quiet">Milestones covered</dt>
              <dd className="mt-2 text-sm font-medium text-ink">
                {facts.covered} of {facts.itemCount}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-quiet">Next fixed date</dt>
              <dd className="mt-2 text-sm font-medium text-ink">
                {facts.nextFixed ? formatCalendarDate(facts.nextFixed) : "No later fixed date"}
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-quiet">Today</dt>
              <dd className="mt-2 text-sm font-medium text-ink">{formatCalendarDate(dto.today)}</dd>
            </div>
          </dl>

          {dto.primaryDate ? (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="font-medium text-ink">{dto.primaryDate.label}:</span>{" "}
              <time dateTime={dto.primaryDate.date}>{formatCalendarDate(dto.primaryDate.date)}</time>
            </p>
          ) : null}
        </header>

        <div className={projector ? "mt-10 grid gap-8 lg:grid-cols-2" : "mt-8 space-y-9"}>
          {dto.sections.map((section) => (
            <section key={section.state} aria-labelledby={`section-${section.state}`}>
              <div className="flex items-center gap-3">
                <h2
                  id={`section-${section.state}`}
                  className={
                    projector
                      ? "text-xl font-semibold tracking-tight text-ink"
                      : "text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft"
                  }
                >
                  {section.label}
                </h2>
                <span className="text-xs tabular-nums text-ink-quiet">{section.items.length}</span>
              </div>
              <ol className="mt-3 divide-y divide-line-soft border-y border-line-soft">
                {section.items.map((item) => {
                  const isToday = item.date === dto.today;
                  return (
                    <li
                      key={item.publicId}
                      className={
                        projector
                          ? "grid min-h-20 grid-cols-[1fr_auto] items-center gap-4 py-4"
                          : "grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 py-3"
                      }
                    >
                      <span className={projector ? "text-xl font-medium leading-snug text-ink" : "text-[15px] font-medium leading-snug text-ink"}>
                        {item.title}
                      </span>
                      <span className="flex flex-col items-end gap-1 text-right">
                        {item.date ? (
                          <time dateTime={item.date} className="text-sm tabular-nums text-ink-soft">
                            {formatCalendarDate(item.date)}
                          </time>
                        ) : (
                          <span className="text-sm text-ink-quiet">Date open</span>
                        )}
                        {isToday ? (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                            Today
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-line-soft pt-5 text-xs leading-5 text-ink-quiet">
          <p>Updated <time dateTime={dto.lastUpdatedAt}>{new Date(dto.lastUpdatedAt).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })}</time>.</p>
          <p className="mt-1">This page contains a frozen set of public milestones. It does not expose the private workspace.</p>
        </footer>
      </div>
    </main>
  );
}

export function AudienceLinkUnavailable({ kind }: { kind: string }) {
  const expired = kind === "expired";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-16 text-center">
      <div className="max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-quiet">
          Audience Timeline
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink">
          {expired ? "This link has expired." : "This link is no longer active."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Ask the person who shared it for a current link. No sign-in is needed.
        </p>
      </div>
    </main>
  );
}
