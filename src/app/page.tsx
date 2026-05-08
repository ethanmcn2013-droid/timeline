import { Wordmark } from "@/components/brand/wordmark";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="px-6 pt-8 pb-0 flex items-center">
        <Wordmark size="md" />
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-start justify-center px-6 py-24 max-w-3xl mx-auto w-full">
        <p
          className="mb-5 text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--brand)", letterSpacing: "0.12em" }}
        >
          Coming soon
        </p>

        <h1 className="h-display font-display mb-6" style={{ color: "var(--ink-900)" }}>
          Roadmap.
        </h1>

        <div
          className="mb-8 w-12"
          style={{ height: "1px", background: "var(--border)" }}
          aria-hidden
        />

        <p
          className="text-xl leading-relaxed max-w-lg"
          style={{ color: "var(--ink-soft)", letterSpacing: "-0.01em" }}
        >
          Public product roadmaps for the 80% who don&apos;t work in tech.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8">
        <p
          className="text-sm"
          style={{ color: "var(--ink-quiet)" }}
        >
          Built by the{" "}
          <a
            href="https://tasks-nu-hazel.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--ink-quiet)" }}
          >
            Tasks
          </a>{" "}
          team.
        </p>
      </footer>
    </main>
  );
}
