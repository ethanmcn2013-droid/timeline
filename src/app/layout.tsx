import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { ROADMAP_URL } from "@/lib/product-urls";
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
  title: "Signal Roadmap — direction clarity",
  description:
    "Public plans, decisions, and changes written in plain English.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? ROADMAP_URL),
  openGraph: {
    title: "Signal Roadmap — direction clarity",
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
        {/* RW-5 Layer-0 pre-paint primitive — ARCH_SPEC §3, CREATIVE_SPEC §3.
            Two synchronous inlines that fire before any linked stylesheet
            or script resolves. Together they kill the dark frame on every
            cross-origin hop:
            1. <style>: white field on html + body; body::before = full-screen
               white overlay (z:9998); body::after = centred 12px #4f46e5 dot
               (z:9999). All literals — no var(), no em, no JS. Identical
               across all 5 repos so the dot appears at the same coords on
               both sides of a cross-origin hop → perceptually continuous.
               globals.css overrides body::before/after to content:none once
               the stylesheet loads, handing off to SuiteLoader.
            2. <script>: reads sessionStorage key `signal_dot_nav`. If set,
               clears it and marks <html data-dot-landing="1"> so that the
               dot-land @keyframes in globals.css fires on the wordmark period.
        */}
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: "html,body{background:#fff}body::before{content:\"\";position:fixed;inset:0;background:#fff;z-index:9998;pointer-events:none}body::after{content:\"\";position:fixed;top:50%;left:50%;width:12px;height:12px;background:#4f46e5;border-radius:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:none}" }} />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){var k='signal_dot_nav';if(sessionStorage.getItem(k)==='1'){sessionStorage.removeItem(k);document.documentElement.setAttribute('data-dot-landing','1');}})()" }} />
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
        <ClerkProvider appearance={clerkAppearance}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
