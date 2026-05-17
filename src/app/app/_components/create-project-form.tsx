"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { createProjectAction } from "@/server/actions/workspaces";
import { slugify, isValidSlug } from "@/lib/reserved-slugs";

const initialState = {
  error: undefined as string | undefined,
  ok: false,
  slug: undefined as string | undefined,
};

export function CreateProjectForm({
  workspaceSlug,
  onCreated,
}: {
  workspaceSlug: string;
  onCreated?: (projectSlug: string) => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createProjectAction(workspaceSlug, formData);
      if ("error" in result) return { error: result.error, ok: false, slug: undefined };
      return { error: undefined, ok: true, slug: result.slug };
    },
    initialState,
  );

  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && state.slug) {
      onCreated?.(state.slug);
    }
  }, [state.ok, state.slug, onCreated]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  const slugOk = isValidSlug(slug);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="proj-name"
          className="text-xs font-medium"
          style={{ color: "var(--ink-soft)" }}
        >
          Project name
        </label>
        <input
          ref={nameRef}
          id="proj-name"
          name="name"
          type="text"
          required
          placeholder="Mobile App v2"
          onChange={handleNameChange}
          className="rounded-lg border px-3.5 py-2.5 text-sm outline-none"
          style={{
            background: "var(--bg-elev)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="proj-slug"
          className="text-xs font-medium"
          style={{ color: "var(--ink-soft)" }}
        >
          Slug
        </label>
        <input
          id="proj-slug"
          name="slug"
          type="text"
          placeholder="mobile-app-v2"
          value={slug}
          onChange={handleSlugChange}
          aria-describedby="proj-slug-feedback"
          aria-invalid={slug ? !slugOk : undefined}
          className="rounded-lg border px-3.5 py-2.5 text-sm outline-none"
          style={{
            background: "var(--bg-elev)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
        <p
          id="proj-slug-feedback"
          aria-live="polite"
          className="text-xs"
          style={{
            color: !slug
              ? "var(--ink-quiet)"
              : slugOk
                ? "var(--status-done)"
                : "var(--status-blocked)",
          }}
        >
          {!slug
            ? "Auto-filled from the name. 3–32 chars, lowercase."
            : slugOk
              ? "Looks good."
              : "3–32 chars, lowercase letters/numbers/hyphens."}
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
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
        className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40"
        style={{ background: "var(--brand)" }}
      >
        {pending ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
