import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TimelineDesignLab } from "@/components/design-lab/timeline/timeline-design-lab";
import {
  parseLabConfig,
  serializeLabAttribution,
} from "@/components/design-lab/timeline/query";
import { isReviewMode } from "@/lib/access-mode";
import { isTimelineDesignLabEnabled } from "@/lib/design-lab/timeline-lab-guard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Timeline design lab · Signal Studio",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TimelineDesignLabPage({ searchParams }: PageProps) {
  if (
    !isTimelineDesignLabEnabled({
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      flag: process.env.SIGNAL_TIMELINE_DESIGN_LAB,
      reviewMode: isReviewMode(),
    })
  ) {
    notFound();
  }

  const query = await searchParams;
  const initialConfig = parseLabConfig(query);
  const initialAttribution = serializeLabAttribution(query);

  return (
    <TimelineDesignLab
      initialConfig={initialConfig}
      initialAttribution={initialAttribution}
    />
  );
}
