import { Suspense } from "react";
import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SuiteHeader } from "@/components/chrome/suite-header";
import { AppAccessGate } from "@/components/app-access-gate";
import { ClearDemoMode } from "./_components/clear-demo-mode";
import AppLoading from "./loading";

/**
 * Authenticated app chrome, (app) route group layout.
 *
 * Lifted into the (app) route group so the shell never unmounts during
 * navigation between /app and /app/plan/[projectSlug]. ClerkProvider is
 * at the root layout; no nested provider needed here.
 *
 * H1 (roadmap-elevation): route group shell persistence, eliminates the
 * charcoal void produced by shell unmount/remount on route transitions.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* App top bar — the shared SuiteHeader shell (switcher lockup, no
          wordmark). Persists across all (app) routes. */}
      <SuiteHeader
        launcher={<SuiteSwitcher current="roadmap" />}
        nav={[]}
        account={<UserButtonWithSuite current="roadmap" />}
      />

      {/* Clear demo-mode cookie on app entry, escape hatch self-resets */}
      <ClearDemoMode />
      {/* Page content. Closed-beta gate: only allowlisted accounts reach it
          (production only); the wordmark loader paints during the check. */}
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<AppLoading />}>
          <AppAccessGate>{children}</AppAccessGate>
        </Suspense>
      </main>
    </div>
  );
}
