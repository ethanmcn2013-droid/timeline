import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { DevBanner } from "@/components/dev-banner";
import { clerkPublishableKey } from "@/lib/access-mode";
import { TIMELINE_URL } from "@/lib/product-urls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // D4 Layer-0 instant canvas: tells the browser to paint white before
  // any CSS resolves. Kills the browser-default grey void on cross-origin
  // first load. LOADING_SYSTEM.md §2.
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Timeline · direction clarity",
  description:
    "Public plans, decisions, and changes written in plain English.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? TIMELINE_URL),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Timeline · direction clarity",
    description:
      "Public plans, decisions, and changes written in plain English.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // D4 Layer-0 instant canvas: these inline attributes fire before any
      // stylesheet resolves. background:#fff kills the browser-default grey
      // on cross-origin first load. colorScheme:light prevents the UA from
      // painting a dark-mode void even when the OS is in dark mode.
      // LOADING_SYSTEM.md §2 — "Frame 1 of every cross-origin destination
      // is paper white field, no content."
      style={{ background: "#fff", colorScheme: "light" }}
    >
      <head>
        {/* D4 — belt-and-braces inline style: fires synchronously before the
            linked stylesheet resolves, preventing any grey flash on the
            document body. One-liner; only background is set here. */}
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: "html{background:#fff}" }} />
      </head>
      <body
        className="min-h-full flex flex-col"
        // D4 — inline style on body: same reason as html above.
        // background:#fff fires before the stylesheet link resolves,
        // removing the grey void on cross-origin first paint.
        style={{ background: "#fff" }}
      >
        {/*
          ClerkProvider at the root so every surface (marketing, public roadmap,
          and /app) can read auth state via useUser/useAuth hooks.
          The /app layout and WorkspaceHeader had their own ClerkProvider;
          with it here those nested providers can be removed — nested providers
          are fine (Clerk dedupes), but moving it root is cleaner.
          Layer 3/4 (seamless-ecosystem-2026-05-18): SuiteLauncher and
          WorkspaceAuthControls need useUser in the public route tree.
        */}
        <ClerkProvider
          publishableKey={clerkPublishableKey()}
          appearance={clerkAppearance}
        >
          {children}
        </ClerkProvider>
        <DevBanner />
      </body>
    </html>
  );
}
