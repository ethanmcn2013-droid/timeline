import type { Metadata } from "next";
import { connection } from "next/server";
import { AudienceLinkUnavailable, AudienceTimelineView } from "@/components/audience/audience-timeline-view";
import { resolveAudienceTimeline } from "@/server/audience-timeline";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const result = await resolveAudienceTimeline(token);
  if (result.kind !== "ok") {
    return { title: "Audience Timeline", robots: { index: false, follow: false } };
  }
  return {
    title: `${result.dto.label}, Timeline`,
    description: `A shared ${result.dto.audienceKind} timeline.`,
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function AudienceTimelinePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const { token } = await params;
  const result = await resolveAudienceTimeline(token);
  if (result.kind !== "ok") return <AudienceLinkUnavailable kind={result.kind} />;
  return <AudienceTimelineView dto={result.dto} token={token} />;
}
