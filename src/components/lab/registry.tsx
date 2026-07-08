import type { ComponentType } from "react";
import { TimelineHeroLine } from "./option-the-line";
import { TimelineHeroLink } from "./option-the-link";
import { TimelineHeroOpenLine } from "./option-open-line";
import { TimelineHeroOneLine } from "./option-one-line";
import { TimelineHeroOpenPlan } from "./option-the-open-plan";

export type LabOption = {
  slug: string;
  name: string;
  role: "polished" | "hybrid";
  lens: string;
  headline: string;
  blurb: string;
  Component: ComponentType;
};

export const OPTIONS: LabOption[] = [
  {
    slug: "the-line",
    name: "The Line",
    role: "polished",
    lens: "Editorial / the line extends",
    headline: "The plan, on one line.",
    blurb:
      "The product's own gesture, the line extending, scaled to a first impression. A single hairline draws across and the plan sets itself onto it: Now, Soon, Later, Done, each a plain sentence at its own marker, dated, with what was set aside kept honestly below.",
    Component: TimelineHeroLine,
  },
  {
    slug: "the-link",
    name: "The Link",
    role: "polished",
    lens: "Public by default / reading room",
    headline: "Send the link. They just read it.",
    blurb:
      "The URL is the product, so the URL is the hero. The shared link opens in a real browser with no wall in front of it, and the plan unfolds exactly as the person on the other end sees it, no account, no app, nothing to decode.",
    Component: TimelineHeroLink,
  },
  {
    slug: "open-line",
    name: "The Open Line",
    role: "hybrid",
    lens: "The Link × The Line",
    headline: "One link opens the whole line.",
    blurb:
      "The fusion. The shared URL opens, with no account, to a single readable line, and the line begins at the link itself: an indigo thread runs from the address bar down the margin and turns into the track at the first marker. One URL in, one plain line out. Access and shape, married.",
    Component: TimelineHeroOpenLine,
  },
  {
    slug: "one-line",
    name: "One Line",
    role: "polished",
    lens: "Editorial / the sentence becomes the line",
    headline: "Put the whole plan on one line.",
    blurb:
      "Plans live in a dozen places and nobody sees the whole thing. The underline beneath the words one line extends across the page and becomes the timeline itself, and the plan drops onto it in order: Now, Soon, Later, Done, each a plain sentence at its marker, dated, with Now the only colour.",
    Component: TimelineHeroOneLine,
  },
  {
    slug: "the-open-plan",
    name: "The Open Plan",
    role: "polished",
    lens: "Public by default / the wall dissolves",
    headline: "Send one link. Everyone reads the same plan.",
    blurb:
      "You wrote the plan, then chased everyone to read it. The words one link condense into a public URL, the sign-in wall dissolves off the plan underneath, and the shared line reads exactly as a guest sees it. No account, no app, they just read it.",
    Component: TimelineHeroOpenPlan,
  },
];
