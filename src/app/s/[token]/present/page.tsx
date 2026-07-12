import type { Metadata } from "next";
import { connection } from "next/server";
import { AudienceLinkUnavailable, AudienceTimelineView } from "@/components/audience/audience-timeline-view";
import { resolveAudienceTimeline } from "@/server/audience-timeline";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Projector, Audience Timeline",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AudienceTimelineProjectorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const { token } = await params;
  const result = await resolveAudienceTimeline(token);
  if (result.kind !== "ok") return <AudienceLinkUnavailable kind={result.kind} />;
  return <AudienceTimelineView dto={result.dto} token={token} projector />;
}
