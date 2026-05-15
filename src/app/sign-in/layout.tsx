import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

/**
 * ClerkProvider scoped to the sign-in route only. Keeps the Clerk
 * runtime off the public roadmap viewer + marketing pages, which
 * never call Clerk (see clerk-appearance.ts).
 */
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
  );
}
