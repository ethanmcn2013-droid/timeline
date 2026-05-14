import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

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
        <div className="mx-auto flex h-12 w-full max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <SuiteLauncher current="roadmap" />
            <span aria-hidden className="hidden sm:inline" style={{ color: "var(--ink-faint)", fontSize: 12 }}>/</span>
            <Wordmark size="md" />
          </div>
          <UserButtonWithSuite current="roadmap" />
        </div>
      </header>

      {/* Page content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
