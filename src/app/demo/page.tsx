"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/tasks");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex flex-col items-center gap-8">
        <Wordmark size="lg" />
        <p
          className="text-[15px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Opening the demo workspace&hellip;
        </p>

        {/* Thin animated progress bar */}
        <div
          className="overflow-hidden rounded-full"
          style={{
            width: "160px",
            height: "2px",
            background: "var(--border)",
          }}
          aria-hidden
        >
          <div
            style={{
              height: "100%",
              background: "var(--brand)",
              borderRadius: "999px",
              animation: "demo-progress 1.5s var(--spring-glide) forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes demo-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
