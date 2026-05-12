// AUTO-GENERATED — do not edit by hand.
// Source: studio/src/lib/templates/ (canonical workspace templates).
// Refresh: pnpm sync:templates
// Strategy: studio/docs/TEMPLATES_STRATEGY.md (locked 2026-05-12)

export type SyncedTemplateRoadmap = {
  id: string;
  name: string;
  roadmap: {
    projects: Array<{
      slug: string;
      name: string;
      oneLiner: string;
      accent?: string;
    }>;
    items: Array<{
      projectSlug: string;
      title: string;
      description: string;
      status: "shipped" | "in-flight" | "next" | "blocked" | "refused";
      targetDate?: string;
    }>;
  };
};

export const SYNCED_TEMPLATE_ROADMAPS: SyncedTemplateRoadmap[] = [
  {
    "id": "wedding-planning-workspace",
    "name": "Wedding planning workspace",
    "roadmap": {
      "projects": [
        {
          "slug": "planning",
          "name": "Planning Roadmap",
          "oneLiner": "What is decided, what is moving, and what needs attention before the day.",
          "accent": "#be185d"
        }
      ],
      "items": [
        {
          "projectSlug": "planning",
          "title": "Venue contract and deposit schedule",
          "description": "Locked at booking. Final-week walkthrough date confirmed.",
          "status": "shipped"
        },
        {
          "projectSlug": "planning",
          "title": "Ceremony room layout agreed",
          "description": "Venue, couple, and officiant have signed off on aisle direction, seating block, and signing-table placement.",
          "status": "shipped"
        },
        {
          "projectSlug": "planning",
          "title": "Confirm final guest numbers",
          "description": "Couple to confirm the final headcount before the venue locks table layout and catering quantities.",
          "status": "in-flight"
        },
        {
          "projectSlug": "planning",
          "title": "Supplier arrival times need confirmation",
          "description": "Photographer, florist, and band arrival times are not all confirmed yet. This is the main planning risk.",
          "status": "blocked"
        },
        {
          "projectSlug": "planning",
          "title": "Menu decisions sent to catering",
          "description": "Venue has sent the couple's menu decisions to catering and is waiting for final dietary notes.",
          "status": "in-flight"
        },
        {
          "projectSlug": "planning",
          "title": "Final-week walkthrough",
          "description": "Venue, planner, and couple walk through room setup, ceremony flow, supplier access, and backup weather plan.",
          "status": "next"
        },
        {
          "projectSlug": "planning",
          "title": "Day-of timeline shared with suppliers",
          "description": "One-page run of show with arrival windows, ceremony cue, meal service, and band start time. Goes to every supplier.",
          "status": "next"
        },
        {
          "projectSlug": "planning",
          "title": "Weather backup plan confirmed",
          "description": "Indoor ceremony fallback + supplier coverage if outdoor ceremony moves inside. Venue holds the final call.",
          "status": "next"
        }
      ]
    }
  }
];

export const SYNCED_TEMPLATE_IDS = new Set<string>(
  SYNCED_TEMPLATE_ROADMAPS.map((t) => t.id),
);

export function getSyncedTemplateRoadmap(id: string): SyncedTemplateRoadmap | undefined {
  return SYNCED_TEMPLATE_ROADMAPS.find((t) => t.id === id);
}
