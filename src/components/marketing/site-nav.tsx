import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { AuthNavControls } from "./auth-nav-controls";

const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";

const NAV: { href: string; label: string; external?: boolean }[] = [
  { href: UMBRELLA_PRICING, label: "Pricing",   external: true },
  { href: "/about",         label: "About"      },
  { href: "/demo",          label: "Demo"       },
  { href: "/changelog",     label: "Dispatch"   },
];

/**
 * Marketing SiteNav — Layer 3 auth-aware update (seamless-ecosystem-2026-05-18).
 *
 * "Sign in" is replaced by the account menu when authed.
 * The escape hatch ("View public site") lives inside AuthNavControls.
 *
 * Kept as a server component — AuthNavControls handles the Clerk read
 * via a thin client island, preserving SSR for the rest of the nav.
 */
export function SiteNav() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line-soft/75"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "saturate(150%) blur(12px)",
        WebkitBackdropFilter: "saturate(150%) blur(12px)",
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-3 whitespace-nowrap">
          <div className="inline-flex">
            <SuiteLauncher current="roadmap" />
          </div>
          <span aria-hidden style={{ color: "var(--ink-faint)", fontSize: 12 }}>/</span>
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
                className="hover:text-ink"
                style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-ink"
                style={{ transition: "color var(--motion-fast) var(--ease-standard)" }}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
        {/* Auth-aware controls: account menu when authed, sign-in/start-for-free when not */}
        <AuthNavControls nav={NAV} />
      </div>
    </header>
  );
}
