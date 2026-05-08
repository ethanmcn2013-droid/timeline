import { UserButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/wordmark";

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
          <Wordmark size="sm" />
          <UserButton />
        </div>
      </header>

      {/* Page content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
