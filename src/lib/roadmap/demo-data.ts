import type { Project, Task, Workspace } from "@/server/db/schema";

const createdAt = new Date("2026-05-11T07:00:00Z");

export const demoWorkspace: Workspace = {
  slug: "tasks",
  name: "studio. shipping log",
  description: "What we're building next, written in plain English.",
  ownerUserId: "seed-demo-user",
  plan: "free",
  createdAt,
  updatedAt: createdAt,
  templateId: null,
};

export const demoProjects: Project[] = [
  {
    workspaceSlug: "tasks",
    slug: "product",
    name: "Product Roadmap",
    oneLiner: "What we're building — and what we said no to.",
    accent: "#4f46e5",
    sortOrder: 0,
    shareToken: null,
    isPublic: true,
  },
];

export const demoTasks: Task[] = [
  {
    id: "tasks-product-001",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "Workspace onboarding — paste your markdown",
    description:
      "First-run experience for new workspaces. Paste a markdown roadmap, we parse it into structured items. Zero forms, zero dropdowns.",
    status: "in-flight",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-14",
    sortOrder: 1,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  },
  {
    id: "tasks-product-002",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "Proof card on the marketing homepage",
    description:
      "A live screenshot of the demo workspace embedded in the homepage hero — so the product sells itself without a separate demo page. Blocked on screenshot infra.",
    status: "blocked",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-15",
    sortOrder: 2,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  },
  {
    id: "tasks-product-003",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "Invite-only beta",
    description:
      "Gated signup behind an invite code. Small cohort, high-signal feedback. No public self-serve until the onboarding is solid.",
    status: "in-flight",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-18",
    sortOrder: 3,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  },
  {
    id: "tasks-product-004",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "Shared comment threads on roadmap items",
    description:
      "People who need the plan can leave comments on individual roadmap items. Auth-gated for writes; public for reads. Keeps the conversation in context.",
    status: "in-flight",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-21",
    sortOrder: 4,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  },
  {
    id: "tasks-product-005",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "Composite-PK multi-tenancy",
    description:
      'Project slugs are now scoped per workspace — two teams can each have a project called "blog" without colliding. Schema migration shipped cleanly.',
    status: "shipped",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-08",
    sortOrder: 5,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: new Date("2026-05-08T09:00:00Z"),
  },
  {
    id: "tasks-product-006",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "studio. brand integration in nav + footer",
    description:
      "The studio. parent brand whisper is now in the nav and footer — links Tasks and Roadmap under one roof without making it a big deal.",
    status: "shipped",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: "2026-05-10",
    sortOrder: 6,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: new Date("2026-05-10T09:00:00Z"),
  },
  {
    id: "tasks-product-007",
    projectSlug: "product",
    workspaceSlug: "tasks",
    title: "AI-generated roadmap items",
    description:
      "Not this year. The product's value is structured clarity, not generated content. If we ship AI suggestions before the manual workflow is proven, we're solving the wrong problem.",
    status: "refused",
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    targetDate: null,
    sortOrder: 7,
    kind: "refusal",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  },
];

export const demoUpcomingTasks = demoTasks.filter(
  (task) => task.status !== "shipped" && task.status !== "refused",
);

export const weddingDemoWorkspace: Workspace = {
  slug: "wedding-planning",
  name: "Harbour House wedding",
  description:
    "A planning update for a venue, couple, and suppliers who need the next steps in plain English.",
  ownerUserId: "seed-wedding-demo-user",
  plan: "free",
  createdAt,
  updatedAt: createdAt,
  templateId: "wedding-planning-workspace",
};

export const weddingDemoProjects: Project[] = [
  {
    workspaceSlug: "wedding-planning",
    slug: "planning",
    name: "Planning Roadmap",
    oneLiner: "What is decided, what is moving, and what needs attention before the day.",
    accent: "#be185d",
    sortOrder: 0,
    shareToken: null,
    isPublic: true,
  },
];

export const weddingDemoTasks: Task[] = [
  makeDemoTask({
    id: "wedding-planning-001",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Confirm final guest numbers",
    description:
      "Couple to confirm the final headcount before the venue locks table layout and catering quantities.",
    status: "in-flight",
    targetDate: "2026-05-14",
    sortOrder: 1,
  }),
  makeDemoTask({
    id: "wedding-planning-002",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Supplier arrival times need confirmation",
    description:
      "Photographer, florist, and band arrival times are not all confirmed yet. This is the main planning risk.",
    status: "blocked",
    targetDate: "2026-05-15",
    sortOrder: 2,
  }),
  makeDemoTask({
    id: "wedding-planning-003",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Menu tasting notes sent to catering",
    description:
      "Venue has sent the couple's menu decisions to catering and is waiting for final dietary notes.",
    status: "in-flight",
    targetDate: "2026-05-16",
    sortOrder: 3,
  }),
  makeDemoTask({
    id: "wedding-planning-004",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Final-week walkthrough",
    description:
      "Venue, planner, and couple walk through room setup, ceremony flow, supplier access, and backup weather plan.",
    status: "next",
    targetDate: "2026-05-20",
    sortOrder: 4,
  }),
  makeDemoTask({
    id: "wedding-planning-005",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Ceremony room layout agreed",
    description:
      "The couple and venue agreed the ceremony layout, aisle placement, and reserved family seating.",
    status: "shipped",
    targetDate: "2026-05-08",
    sortOrder: 5,
    completedAt: new Date("2026-05-08T09:00:00Z"),
  }),
  makeDemoTask({
    id: "wedding-planning-006",
    workspaceSlug: "wedding-planning",
    projectSlug: "planning",
    title: "Outdoor drinks reception",
    description:
      "Not relying on an outdoor-only reception. The weather backup is now the default plan.",
    status: "refused",
    kind: "refusal",
    targetDate: null,
    sortOrder: 6,
  }),
];

export const weddingDemoUpcomingTasks = weddingDemoTasks.filter(
  (task) => task.status !== "shipped" && task.status !== "refused",
);

export function getDemoSharedUpdateDataset(workspaceSlug: string) {
  if (workspaceSlug === demoWorkspace.slug) {
    return {
      workspace: demoWorkspace,
      projects: demoProjects,
      tasks: demoTasks,
      upcoming: demoUpcomingTasks,
    };
  }

  if (workspaceSlug === weddingDemoWorkspace.slug) {
    return {
      workspace: weddingDemoWorkspace,
      projects: weddingDemoProjects,
      tasks: weddingDemoTasks,
      upcoming: weddingDemoUpcomingTasks,
    };
  }

  return null;
}

function makeDemoTask(
  task: Pick<
    Task,
    | "id"
    | "workspaceSlug"
    | "projectSlug"
    | "title"
    | "description"
    | "status"
    | "targetDate"
    | "sortOrder"
  > &
    Partial<Task>,
): Task {
  return {
    phase: null,
    tier: null,
    assignee: "claude-code",
    cycleLabel: null,
    kind: "cycle",
    category: null,
    priority: null,
    blockerId: null,
    unblocks: null,
    weekHeading: null,
    channel: null,
    isLaunch: false,
    day: null,
    postingTime: null,
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
    ...task,
  };
}
