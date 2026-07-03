import { SignIn } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/wordmark";
import Link from "next/link";

export const metadata = { title: "Sign in, Timeline" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      <div className="px-6 pt-6">
        <Wordmark size="md" />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <p
          className="mb-5 text-[13px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Sign in to your Timeline workspace.
        </p>
        <SignIn />
        <p className="mt-5 text-[13px]" style={{ color: "var(--ink-quiet)" }}>
          New here?{" "}
          <Link
            href="/demo"
            className="group inline-flex items-center gap-1 underline underline-offset-2 transition-colors hover:text-ink-soft"
          >
            See a live demo first
            <svg
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </p>
      </main>
    </div>
  );
}
