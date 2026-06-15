import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DangerZone } from "@/components/account/danger-zone";
import { ManageIdentityButton } from "@/components/account/manage-identity-button";
import { isDemoMode } from "@/lib/access-mode";

export const metadata: Metadata = {
  title: "Account — Signal Timeline",
  description: "Account management.",
};

/**
 * /app/account
 *
 * The Account surface in Roadmap. The only thing here today is the
 * irreversible delete — Timeline doesn't carry profile fields or
 * notification preferences of its own (Clerk owns identity; the
 * Analytics product owns email cadence). When future cycles add
 * per-product preferences, they land in additional sections above
 * the danger-zone.
 *
 * Auth-gated — unauthed users redirect to /sign-in.
 */
export default async function AccountPage() {
  // Demo/Review: render the settings surface with a synthetic identity so it
  // is reviewable without a session. Never touches Clerk.
  let email: string;
  if (isDemoMode()) {
    email = "you@theorchard.example";
  } else {
    const user = await currentUser();
    if (!user) redirect("/sign-in");
    email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? "";
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
        Settings · Account
      </p>
      <h1 className="mb-3 text-[32px] font-semibold leading-[1.15] text-ink">
        Your Signal account
      </h1>
      <p className="mb-7 max-w-[560px] text-[15px] leading-[1.6] text-ink-soft">
        Signed in as <span className="font-medium text-ink">{email}</span> — one
        account across Notes, Tasks, Timeline, and Signal. Your password and
        sign-in methods live in your Signal account.
      </p>

      <ManageIdentityButton />

      <DangerZone email={email} />
    </main>
  );
}
