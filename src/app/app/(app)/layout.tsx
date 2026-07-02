import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { ClearDemoMode } from "./_components/clear-demo-mode";

/**
 * Authenticated app chrome — (app) route group layout.
 *
 * Lifted into the (app) route group so the shell never unmounts during
 * navigation between /app and /app/plan/[projectSlug]. ClerkProvider is
 * at the root layout; no nested provider needed here.
 *
 * H1 (roadmap-elevation): route group shell persistence — eliminates the
 * charcoal void produced by shell unmount/remount on route transitions.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* App top bar — persists across all (app) routes */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "saturate(150%) blur(12px)",
          WebkitBackdropFilter: "saturate(150%) blur(12px)",
          borderColor: "var(--border-soft)",
        }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">
          <div className="flex min-w-0 items-center">
            <SuiteSwitcher current="roadmap" />
          </div>
          <UserButtonWithSuite current="roadmap" />
        </div>
      </header>

      {/* Clear demo-mode cookie on app entry — escape hatch self-resets */}
      <ClearDemoMode />
      {/* Page content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
