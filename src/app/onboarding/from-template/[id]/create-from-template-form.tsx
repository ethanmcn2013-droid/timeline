"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createWorkspaceAction } from "@/server/actions/workspaces";
import { slugify, isValidSlug } from "@/lib/reserved-slugs";
import type { SyncedTemplateRoadmap } from "@/lib/templates.generated";

const initialState = { error: undefined as string | undefined };

/**
 * Variant of CreateWorkspaceForm that knows it's being created from a
 * canonical workspace template. Carries `fromTemplate` as a hidden
 * input so the server action seeds projects + items after the
 * workspace row lands. Strategy: studio/docs/TEMPLATES_STRATEGY.md (T-2.1b).
 */
export function CreateFromTemplateForm({
  template,
  defaultName,
  defaultSlug,
}: {
  template: SyncedTemplateRoadmap;
  defaultName: string;
  defaultSlug: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createWorkspaceAction(formData);
      if (result && "error" in result) return { error: result.error };
      return { error: undefined };
    },
    initialState,
  );

  const initialSlug = defaultSlug || slugify(defaultName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(Boolean(defaultSlug));
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(slugify(e.target.value));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  const slugOk = isValidSlug(slug);
  const projectCount = template.roadmap.projects.length;
  const itemCount = template.roadmap.items.length;

  return (
    <div className="mx-auto w-full max-w-md py-20 px-6">
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--brand)", letterSpacing: "0.12em" }}
      >
        From template · {template.name}
      </p>
      <h1
        className="mb-2 text-3xl font-semibold"
        style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}
      >
        Start from the {template.name.toLowerCase()}.
      </h1>
      <p
        className="mb-10 text-sm leading-relaxed"
        style={{ color: "var(--ink-soft)" }}
      >
        {projectCount === 1 ? "One project, " : `${projectCount} projects, `}
        {itemCount} starter items. Edit them once the workspace is live.
      </p>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="fromTemplate" value={template.id} />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ws-name"
            className="text-xs font-medium"
            style={{ color: "var(--ink-soft)" }}
          >
            Workspace name
          </label>
          <input
            ref={nameRef}
            id="ws-name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            onChange={handleNameChange}
            className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "var(--bg-elev)",
              borderColor: "var(--border)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ws-slug"
            className="text-xs font-medium"
            style={{ color: "var(--ink-soft)" }}
          >
            Slug
          </label>
          <div
            className="flex items-center rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
          >
            <span
              className="px-3 py-2.5 text-sm select-none"
              style={{
                color: "var(--ink-quiet)",
                borderRight: "1px solid var(--border)",
              }}
            >
              roadmap/
            </span>
            <input
              id="ws-slug"
              name="slug"
              type="text"
              required
              placeholder="harbour-house-wedding"
              value={slug}
              onChange={handleSlugChange}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
              style={{ color: "var(--ink)" }}
            />
          </div>
          {slug && !slugOk && (
            <p className="text-xs" style={{ color: "var(--status-blocked)" }}>
              3–32 chars, lowercase letters/numbers/hyphens, not reserved.
            </p>
          )}
          {slug && slugOk && (
            <p className="text-xs" style={{ color: "var(--status-done)" }}>
              Looks good.
            </p>
          )}
        </div>

        {state.error && (
          <p
            className="rounded-lg border px-3.5 py-2.5 text-sm"
            style={{
              color: "var(--roadmap-red-fg)",
              background: "var(--roadmap-red-bg)",
              borderColor: "var(--roadmap-red-border)",
            }}
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !slugOk}
          className="mt-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40"
          style={{ background: "var(--brand)" }}
        >
          {pending ? "Creating…" : "Create workspace"}
        </button>
      </form>
    </div>
  );
}
