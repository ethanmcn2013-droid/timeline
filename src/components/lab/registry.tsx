import type { ComponentType } from "react";
import { TimelineHeroLine } from "./option-the-line";
import { TimelineHeroLink } from "./option-the-link";
import { TimelineHeroOpenLine } from "./option-open-line";
import { TimelineHeroOneLine } from "./option-one-line";
import { TimelineHeroOpenPlan } from "./option-the-open-plan";

export type LabOption = {
  slug: string;
  name: string;
  role: "preferred" | "candidate";
  lens: string;
  headline: string;
  blurb: string;
  Component: ComponentType;
};

export const OPTIONS: LabOption[] = [
  {
    slug: "one-line",
    name: "One Line",
    role: "preferred",
    lens: "Flagship / the sentence becomes the line",
    headline: "Put the whole plan on one line.",
    blurb:
      "The flagship. A public-plan mast stays crisp while three plain sentences establish the problem. The underline beneath one line is the real timeline axis; it opens into the dated plan, reveals four visible moments, closes on one small sweep, and rests.",
    Component: TimelineHeroOneLine,
  },
  {
    slug: "the-line",
    name: "The Line",
    role: "preferred",
    lens: "Counterpoint / the line reads",
    headline: "The plan, on one line.",
    blurb:
      "The restrained counterpoint. The public folio and hairline are fixed from frame zero; three short sentences hand off to one left-to-right read as the dated plan settles onto the line, then everything becomes still.",
    Component: TimelineHeroLine,
  },
  {
    slug: "the-open-plan",
    name: "The Open Plan",
    role: "candidate",
    lens: "Public by default / the wall dissolves",
    headline: "Send one link. Everyone reads the same plan.",
    blurb:
      "The sharing-story candidate. The words one link condense into a public URL, the sign-in wall dissolves off the plan underneath, and the shared plan reads exactly as a guest sees it.",
    Component: TimelineHeroOpenPlan,
  },
  {
    slug: "the-link",
    name: "The Link",
    role: "candidate",
    lens: "Public by default / reading room",
    headline: "Send the link. They just read it.",
    blurb:
      "The URL is the product, so the URL is the hero. The shared link opens in a real browser with no wall in front of it, and the plan unfolds exactly as the person on the other end sees it, no account, no app, nothing to decode.",
    Component: TimelineHeroLink,
  },
  {
    slug: "open-line",
    name: "The Open Line",
    role: "candidate",
    lens: "The Link × The Line",
    headline: "One link opens the whole line.",
    blurb:
      "The fusion. The shared URL opens, with no account, to a single readable line, and the line begins at the link itself: an indigo thread runs from the address bar down the margin and turns into the track at the first marker. One URL in, one plain line out. Access and shape, married.",
    Component: TimelineHeroOpenLine,
  },
];
