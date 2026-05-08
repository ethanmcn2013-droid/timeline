import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("http://localhost:3000"),
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
