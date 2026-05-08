import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://studio-sigma-pied-75.vercel.app";

const NAV = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about",   label: "About"   },
  { href: "/demo",    label: "Demo"    },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-soft/60 bg-bg/72 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          {/* studio. parent-brand whisper — hidden on mobile to avoid crowding */}
          <a
            href={`${STUDIO_URL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2.5 md:flex"
            aria-label="studio. — the studio behind Roadmap"
          >
            <span className="text-[11px] font-medium tracking-[-0.05em] text-ink-quiet transition-colors hover:text-ink-soft">
              studio.
            </span>
            <span className="h-3 w-px bg-line-soft" aria-hidden="true" />
          </a>
          <Wordmark size="md" />
        </div>
        <nav className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
          >
            See it live
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
