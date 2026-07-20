import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { SuiteHeader, type SuiteNavItem } from "@/components/chrome/suite-header";
import { AuthNavControls } from "./auth-nav-controls";

const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";
const UMBRELLA_DESIGN = "https://signalstudio.ie/design";
const UMBRELLA_ABOUT = "https://signalstudio.ie/about";

// One header contract (product-header-contract.md, 2026-07-06): the marketing
// header nav is Pricing · Design · About, all umbrella links. Demo and
// Dispatch stay reachable from the footer and body, not the primary header.
const NAV: SuiteNavItem[] = [
  { href: UMBRELLA_PRICING, label: "Pricing", external: true },
  { href: UMBRELLA_DESIGN, label: "Design", external: true },
  { href: UMBRELLA_ABOUT, label: "About", external: true },
];

/**
 * Timeline marketing header — a thin wrapper over the shared SuiteHeader
 * shell. Server component; AuthNavControls (a client island) carries the
 * §14 auth-aware controls in the account slot. The shell, lockup, nav, and
 * mobile menu are the one shared component.
 */
export function SiteNav() {
  return (
    <SuiteHeader
      launcher={<SuiteLauncher current="roadmap" />}
      wordmark={<Wordmark size="md" />}
      nav={NAV}
      account={<AuthNavControls />}
    />
  );
}
