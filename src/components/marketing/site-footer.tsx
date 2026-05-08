import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://studio-sigma-pied-75.vercel.app";
const TASKS_URL = "https://tasks-nu-hazel.vercel.app";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line-soft/70 pb-10 pt-16">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-6 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div>
          <Wordmark size="lg" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
            Your roadmap, in plain English. Not a Jira export. Not a slide deck.
            Something your users can actually read.
          </p>
        </div>
        <FooterCol
          heading="Product"
          links={[
            { href: "/pricing",   label: "Pricing"   },
            { href: "/demo",      label: "Demo"      },
            { href: "/about",     label: "About"     },
            { href: "/changelog", label: "Changelog" },
          ]}
        />
        <FooterCol
          heading="Made by"
          links={[
            {
              href:     `${STUDIO_URL}/about`,
              label:    "studio.",
              external: true,
              note:     "The studio behind Roadmap",
            },
            {
              href:     TASKS_URL,
              label:    "Tasks",
              external: true,
              note:     "Our other product",
            },
          ]}
        />
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-[1240px] flex-col items-start justify-between gap-2 border-t border-line-soft/70 px-6 pt-6 text-[12px] text-ink-quiet md:flex-row md:items-center">
        <span>
          © {new Date().getFullYear()} Roadmap.{" "}
          A{" "}
          <a
            href={`${STUDIO_URL}/about`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-ink"
          >
            studio.
          </a>{" "}
          product.
        </span>
        <span>Next.js 16 · React 19 · Motion</span>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string; external?: boolean; note?: string }[];
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink-quiet">
        {heading}
      </div>
      <ul className="space-y-2 text-[13.5px] text-ink-soft">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
                title={l.note}
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
