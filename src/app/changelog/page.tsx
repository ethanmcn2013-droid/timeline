import { permanentRedirect } from "next/navigation";
import { STUDIO_URL } from "@/lib/product-urls";

/**
 * The per-product changelog is retired.
 *
 * The suite-wide changelog lives at signalstudio.ie/changelog —
 * a curated reading surface. Roadmap's own shipping notes are now
 * curated up into the umbrella log.
 */
export default function ChangelogPage() {
  permanentRedirect(`${STUDIO_URL}/changelog`);
}
