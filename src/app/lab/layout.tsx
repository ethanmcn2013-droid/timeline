import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Timeline hero lab · Signal Timeline",
  description: "Private review directions for the Signal Timeline homepage hero.",
  robots: { index: false, follow: false },
};

/**
 * Lab-only layout. Suppresses dev-mode chrome (Clerk keyless prompt, Next dev
 * indicator) so the hero options can be reviewed on a clean white field.
 * Local review surface only; never ships to a public route.
 */
export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <style>{`
        .cl-keylessPrompt, [class*="cl-keyless"], .cl-impersonationFab,
        [data-clerk-keyless], a[href*="clerk.com/apps/claim"],
        #clerk-components, .signal-devbanner { display: none !important; }
        [data-nextjs-toast], [data-next-badge], nextjs-portal { display: none !important; }
      `}</style>
    </>
  );
}
