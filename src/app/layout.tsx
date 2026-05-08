import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roadmap — public product roadmaps for the 80% who don't work in tech",
  description:
    "Your roadmap shouldn't require a glossary. Roadmap makes it readable for the people who actually use what you're building.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmap-ebon-eight.vercel.app"),
  openGraph: {
    title: "Roadmap — public product roadmaps for the 80% who don't work in tech",
    description:
      "Your roadmap shouldn't require a glossary.",
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
          formButtonPrimary:
            "bg-ink hover:bg-ink-soft text-white rounded-full",
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
