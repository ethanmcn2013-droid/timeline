import { redirect } from "next/navigation";

// The canonical public demo is a real wedding plan, the 80% audience's own
// use case, not a software roadmap (BRAND.md §2.1/§2.2). Server redirect:
// instant, no flash, works with JS disabled and for crawlers.
export default function DemoPage() {
  redirect("/the-wedding");
}
