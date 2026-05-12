import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getSyncedTemplateRoadmap } from "@/lib/templates.generated";
import { CreateFromTemplateForm } from "./create-from-template-form";

/**
 * Onboarding entry point for "create a Roadmap workspace from a canonical
 * template." Linked from Tasks's apply/remix success path. Strategy:
 * studio/docs/TEMPLATES_STRATEGY.md (T-2.1b).
 *
 * Query params (optional):
 *  - ?name=<string>   pre-fills the workspace name field
 *  - ?slug=<string>   pre-fills the slug field
 */
export default async function FromTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; slug?: string }>;
}) {
  await requireUser();

  const { id } = await params;
  const template = getSyncedTemplateRoadmap(id);
  if (!template) notFound();

  const sp = await searchParams;

  return (
    <CreateFromTemplateForm
      template={template}
      defaultName={sp.name ?? `${template.name} planning`}
      defaultSlug={sp.slug ?? ""}
    />
  );
}
