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
          Free during early access. No card required.
        </p>
        <SignUp />
        <p
          className="mt-5 text-[13px]"
          style={{ color: "var(--ink-quiet)" }}
        >
          You&apos;ll get a workspace. Add a project. Share a URL. Done.
        </p>
      </main>
    </div>
  );
}
