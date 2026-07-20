import Link from "next/link";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-sm">
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--brand)" }}
          >
            404
          </p>
          <h1
            className="mb-4 text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] font-semibold leading-[1.1]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            This timeline doesn&apos;t exist yet.
          </h1>
          <p
            className="mb-10 text-[15px] leading-[1.55]"
            style={{ color: "var(--ink-soft)" }}
          >
            The page you&apos;re looking for isn&apos;t here. You could create one though.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="https://signalstudio.ie/waitlist?source=not_found&product=timeline"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
            >
              Create yours →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-ink-soft hover:text-ink"
              style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}
            >
              Back home
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
