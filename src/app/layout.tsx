import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorText: "#18181b",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          // Mobile correctness: 48px min-height on inputs + buttons hits
          // the WCAG 2.5.5 tap-target floor; 16px input font-size prevents
          // iOS Safari's auto-zoom on focus. Mirrors tasks T·47.
          formFieldInput:
            "!min-h-[48px] !text-[16px]",
          formButtonPrimary:
            "bg-ink hover:bg-ink-soft text-white rounded-full !min-h-[48px] !text-[15px]",
          socialButtonsBlockButton:
            "!min-h-[48px] !text-[15px]",
          card: "shadow-[0_24px_60px_-24px_rgba(24,24,27,0.18)]",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
