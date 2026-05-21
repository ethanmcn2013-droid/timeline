import type { MetadataRoute } from "next";

/**
 * PWA manifest — Signal Roadmap.
 *
 * Direction-clarity product. start_url goes to /app (the authed
 * workspace surface) — a home-screen tap should land where the
 * planner does their work, not the marketing home.
 *
 * No private workspaces, no team tier — locked refusals per
 * AGENTS.md.
 *
 * `orientation: "any"` because the roadmap viewer has table content
 * and milestone maps that are wider-friendly — users rotate.
 *
 * One shortcut, not three. The Roadmap product is single-surface
 * (the workspace IS the destination); a returning user has exactly
 * one place to go. "Start a roadmap" / "Example" were marketing
 * artifacts in disguise — cut per UX review.
 *
 * Maskable icon at /icon1 (512×512) for Android adaptive icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/signal-roadmap",
    name: "Signal Roadmap",
    short_name: "Roadmap",
    description:
      "Public plans, decisions, and changes written in plain English.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "en-IE",
    dir: "ltr",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Your roadmap",
        short_name: "Roadmap",
        url: "/app",
        description: "Your workspace.",
      },
    ],
  };
}
