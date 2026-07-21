import type { ReactNode } from "react";
import type {
  LabDensity,
  LabScenario,
  LabSurface,
  PlanSnapshot,
  PreviewSource,
  PublicPlanDto,
  PublicTimelineItem,
  TimelineItem,
} from "../types";

export interface TimelineOptionProps {
  surface: LabSurface;
  density: LabDensity;
  scenario: LabScenario;
  ownerPlan: PlanSnapshot;
  plan: PublicPlanDto;
  publishedPlan: PublicPlanDto;
  previewSource: PreviewSource;
  selectedItemId: string;
  unpublishedCount: number;
  readOnly: boolean;
  copySurfaceLinkLabel: string;
  onSelect: (itemId: string) => void;
  onSurfaceChange: (surface: LabSurface) => void;
  onCopySurfaceLink: () => void;
  onPreviewSourceChange: (source: PreviewSource) => void;
  onPublish: () => void;
  renderOwnerTools: (item: TimelineItem) => ReactNode;
  renderPublicItemLink: (item: PublicTimelineItem, children: ReactNode) => ReactNode;
}
