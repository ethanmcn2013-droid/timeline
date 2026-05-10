import { DemoRedirect } from "./_redirect";

export const metadata = {
  title: "Demo — Roadmap",
  description: "See Signal Roadmap in action — a real workspace, live in seconds.",
};

export default function DemoPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      {/* SSR-visible content — renders before any JS */}
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--brand)" }}
          >
            Live demo
          </p>
          <h1
            className="text-[clamp(1.6rem,1.2rem+2vw,2.5rem)] font-semibold leading-[1.1]"
            style={{ letterSpacing: "-0.035em", color: "var(--ink)" }}
          >
            Signal Roadmap
          </h1>
          <p
            className="max-w-[38ch] text-[15px] leading-[1.6]"
            style={{ color: "var(--ink-soft)" }}
          >
            Opening the demo workspace&hellip;
          </p>
        </div>

        {/* Static skeleton preview — visible before hydration */}
        <div
          className="w-full max-w-[440px] rounded-2xl border px-5 py-4"
          style={{
            background: "var(--bg-elev)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-1)",
          }}
          aria-hidden
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--status-shipped)" }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              Product Roadmap
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Shipped",    width: "w-1/2",   status: "var(--status-shipped)" },
              { label: "In progress", width: "w-2/3",  status: "var(--status-next)" },
              { label: "Next up",    width: "w-3/5",   status: "var(--status-next)" },
              { label: "Considering", width: "w-2/5",  status: "var(--border)" },
            ].map(({ label, width, status }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: status }}
                />
                <div
                  className={`h-2 rounded-full ${width}`}
                  style={{ background: "var(--border)", opacity: 0.7 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Animated progress bar */}
        <div
          className="overflow-hidden rounded-full"
          style={{
            width: "160px",
            height: "2px",
            background: "var(--border)",
          }}
          aria-hidden
        >
          <div
            style={{
              height: "100%",
              background: "var(--brand)",
              borderRadius: "999px",
              animation: "demo-progress 1.5s var(--spring-glide, ease-out) forwards",
            }}
          />
        </div>
      </div>

      {/* Client-only redirect — transparent to SSR */}
      <DemoRedirect />

      <style>{`
        @keyframes demo-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
