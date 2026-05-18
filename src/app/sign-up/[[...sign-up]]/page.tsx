import { SignUp } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata = { title: "Sign up — Roadmap" };

export default function SignUpPage() {
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
          Free to start.
        </p>
        <SignUp />
        <p
          className="mt-5 text-[13px]"
          style={{ color: "var(--ink-quiet)" }}
        >
          You&apos;ll have a workspace live in minutes. Share one link. Anyone can read it.
        </p>
      </main>
    </div>
  );
}
