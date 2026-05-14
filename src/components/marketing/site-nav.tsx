import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";

const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";

const NAV: { href: string; label: string; external?: boolean }[] = [
  { href: UMBRELLA_PRICING, label: "Pricing",   external: true },
  { href: "/about",         label: "About"      },
  { href: "/demo",          label: "Demo"       },
  { href: "/changelog",     label: "Changelog"  },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-soft/60 bg-bg/72 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex">
            <SuiteLauncher current="roadmap" />
          </div>
          <span aria-hidden className="hidden sm:inline" style={{ color: "var(--ink-faint)", fontSize: 12 }}>/</span>
          <Wordmark size="md" />
        </div>
        <nav className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            See it live
          </Link>
          <Link
            href="/sign-in"
            className="hidden rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm transition-transform hover:-translate-y-px hover:shadow-md"
          >
            Start for free
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
          <details className="relative md:hidden">
            <summary
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border text-ink-soft transition-colors hover:text-ink"
              style={{ borderColor: "var(--border)" }}
              aria-label="Open menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div
              className="absolute right-0 top-11 w-56 rounded-xl border p-3 shadow-lg"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            >
              <ul className="flex flex-col gap-1 text-[13px]">
                {NAV.map((item) => (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
                <li className="my-1 h-px" style={{ background: "var(--border)" }} aria-hidden />
                <li>
                  <Link
                    href="/sign-in"
                    className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
                  >
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
