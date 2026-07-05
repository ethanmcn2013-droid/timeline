import type { ComponentType } from "react";
import { TimelineHeroLine } from "./option-the-line";
import { TimelineHeroLink } from "./option-the-link";
import { TimelineHeroPlain } from "./option-plain-english";
import { TimelineHeroHorizon } from "./option-horizon";

export type LabOption = {
  slug: string;
  name: string;
  role: "polished" | "wildcard";
  flagship?: boolean;
  lens: string;
  headline: string;
  blurb: string;
  Component: ComponentType;
};

export const OPTIONS: LabOption[] = [
  {
    slug: "the-link",
    name: "The Link",
    role: "polished",
    flagship: true,
    lens: "Public by default / reading room",
    headline: "Send the link. They just read it.",
    blurb:
      "The shared URL sits in a browser bar and opens with no wall in front of it. The plan unfolds as the person on the other end sees it, Now, Soon, Later, and what was refused, no account, no app, nothing to decode. The URL is the product, so the URL is the hero.",
    Component: TimelineHeroLink,
  },
  {
    slug: "the-line",
    name: "The Line",
    role: "polished",
    lens: "Editorial / the line extends",
    headline: "The plan, on one line.",
    blurb:
      "A single hairline draws across the field and the plan sets itself onto it: Now, Soon, Later, Done, each a plain sentence at its own marker. The product's own gesture, the line extending, scaled to a full first impression.",
    Component: TimelineHeroLine,
  },
  {
    slug: "plain-english",
    name: "Plain English",
    role: "polished",
    lens: "Translation / jargon dissolves",
    headline: "No vocabulary to learn.",
    blurb:
      "A pile of project-management machinery, Gantt bars, tickets, sprint chips, story points, is passed over once and translated. The jargon dissolves and plain sentences settle into the Now / Soon / Later ladder that was under it all along.",
    Component: TimelineHeroPlain,
  },
  {
    slug: "horizon",
    name: "Horizon",
    role: "wildcard",
    lens: "Cinematic / the Long Now made literal",
    headline: "See the whole road, not just the quarter.",
    blurb:
      "The timeline becomes a vista. The plan recedes to a vanishing point where the five-digit year sits, Now in the foreground where you stand, the far things planted small and honest on the road ahead. Move your pointer and the road shifts under you.",
    Component: TimelineHeroHorizon,
  },
];
