import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { ANALYTICS_URL, NOTES_URL, STUDIO_URL, TASKS_URL } from "@/lib/product-urls";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line-soft/70 pb-10 pt-16">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-6 md:grid-cols-[1.4fr_repeat(2,1fr)]">
        <div>
          <Wordmark size="lg" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
            Direction clarity for public plans, decisions, and changes people can read.
          </p>
        </div>
        <FooterCol
          heading="Product"
          links={[
            { href: "https://signalstudio.ie/pricing", label: "Pricing", external: true },
            { href: "/demo",      label: "Demo"      },
            { href: "/about",     label: "About"     },
            { href: "/changelog", label: "Changelog" },
          ]}
        />
        <FooterCol
          heading="Suite"
          links={[
            { href: STUDIO_URL,    label: "Signal Studio",    external: true },
            { href: TASKS_URL,     label: "Signal Tasks",     external: true },
            { href: ANALYTICS_URL, label: "Signal Analytics", external: true },
            { href: NOTES_URL,     label: "Signal Notes",     external: true },
          ]}
        />
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-[1240px] flex-col items-start justify-between gap-2 border-t border-line-soft/70 px-6 pt-6 text-[12px] text-ink-quiet md:flex-row md:items-center">
        <span>
          © {new Date().getFullYear()} Signal Roadmap.{" "}
          A{" "}
          <a
            href={`${STUDIO_URL}/about`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-ink"
          >
            Signal Studio
          </a>{" "}
          product.
        </span>
        <span>Built for direction clarity.</span>
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
