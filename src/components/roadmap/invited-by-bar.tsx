import type { Workspace } from "@/server/db/schema";

/**
 * Invited-by bar, Sprint 2 cycle 10.3, 2026-05-12.
 *
 * Sits at the top of shared views (currently the /update page) to
 * orient the invited person: who shared this, when, what it's about,
 * and how to reply.
 *
 * Sprint 2 locked refusal: no comment-thread infrastructure. The
 * reply gesture is a mailto link, not a feedback form. Conversations
 * belong in email, Timeline stays a clarity artefact, not a
 * collaboration tool.
 *
 * Conditional rendering:
 *  - No `ownerName` → bar omits the inviter sentence (falls back to
 *    a calmer "Shared with you" eyebrow).
 *  - No `ownerEmail` → reply gesture is dropped entirely. No fake
 *    "send us a message" buttons that don't go anywhere.
 *  - No `description` → uses a brand-coherent fallback sentence.
 *
 * Pre-Sprint-2 workspaces (null name + null email) degrade to a
 * minimal "Shared with you · [last updated]" line. No fake
 * attribution, no fake gestures.
 */
export function InvitedByBar({
  workspace,
  lastUpdatedLabel,
}: {
  workspace: Workspace;
  lastUpdatedLabel: string | null;
}) {
  const ownerName = workspace.ownerName?.trim() || null;
  // Validate ownerEmail against a plausible RFC-shape before using it.
  // Prevents layout abuse and mailto injection from untrusted DB content.
  const rawEmail = workspace.ownerEmail?.trim() || null;
  const emailValid = rawEmail ? /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/.test(rawEmail) : false;
  const ownerEmail = emailValid ? rawEmail : null;
  // Truncate display email to 60 chars to prevent layout abuse on public pages.
  const ownerEmailDisplay = ownerEmail && ownerEmail.length > 60
    ? ownerEmail.slice(0, 57) + "..."
    : ownerEmail;
  const description = workspace.description?.trim() || null;

  const mailtoHref = ownerEmail
    ? `mailto:${ownerEmail}?subject=${encodeURIComponent(
        `Re: ${workspace.name} roadmap`,
      )}&body=${encodeURIComponent(
        `Hi${ownerName ? ` ${ownerName.split(" ")[0]}` : ""},\n\n`,
      )}`
    : null;

  return (
    <section
      aria-label="Invitation context"
      className="border-b border-line-soft/60 px-6 py-5"
      style={{ background: "var(--bg-deep)" }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-quiet">
            {ownerName ? `${ownerName} shared this with you` : "Shared with you"}
          </p>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.55] text-ink-soft">
            {description ??
              `A plain-English update for ${workspace.name}. Read in 30 seconds; reply if anything's unclear.`}
          </p>
          {lastUpdatedLabel ? (
            <p className="mt-1.5 text-[11.5px] text-ink-quiet">
              Last updated {lastUpdatedLabel}
            </p>
          ) : null}
        </div>

        {mailtoHref ? (
          <div className="flex flex-shrink-0 flex-col gap-1 sm:items-end">
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-line-soft bg-bg-elevated px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-quiet/40 hover:text-ink sm:self-auto"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M4 4h16v16H4z" />
                <polyline points="4 4 12 13 20 4" />
              </svg>
              Reply by email
            </a>
            <p className="text-[11px] text-ink-quiet">
              <span className="font-mono">{ownerEmailDisplay}</span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
