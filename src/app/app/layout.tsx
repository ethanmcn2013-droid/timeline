import { ClerkProvider } from "@clerk/nextjs";
import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { ClearDemoMode } from "./_components/clear-demo-mode";
import { clerkAppearance } from "@/lib/clerk-appearance";

/**
 * Authenticated app chrome. Replaces the marketing SiteNav entirely.
 * Thin top bar: wordmark left, user avatar right.
 * No SiteFooter — the workspace surface is its own world.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* App top bar */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[80rem] items-center justify-between px-6">
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
    </ClerkProvider>
  );
}
