"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Fires the demo redirect after hydration. Invisible — renders nothing. */
export function DemoRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/tasks");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
