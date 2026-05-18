/**
 * Roadmap /app segment loading boundary — App Router loading.tsx
 *
 * Spec: LOADING_SYSTEM.md §1 (2026-05-18 seamless-wave, D8 remediation).
 * Supersedes: wordmark + roadmap-dot sweep composite.
 *
 * Canonical single-dot: same visual as the root loading.tsx so the
 * user sees one consistent identity regardless of which segment is
 * streaming. The ContentWellFallback (Suspense fallback within the
 * workspace page) uses the same token-driven dot pattern — see
 * roadmap/src/app/[workspaceSlug]/page.tsx.
 *
 * Server Component: zero JS overhead, paints with RSC shell.
 */
export default function AppLoading() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <div
        className="signal-loading-dot"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--indigo, #4f46e5)",
          flexShrink: 0,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
