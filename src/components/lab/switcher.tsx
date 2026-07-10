"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OPTIONS } from "./registry";

/**
 * Lab switcher, a quiet top bar to move between the Timeline hero options and
 * replay the current one. Lab-only chrome; never ships. Scoped `lab-` classes.
 */
export function LabSwitcher({ activeSlug }: { activeSlug: string }) {
  const router = useRouter();
  const replay = () => window.location.reload();

  // Keyboard: 1-N jumps between registered options. A full lab-only reload is
  // intentional for replay: it recreates the CSS animation timeline at zero.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= OPTIONS.length) router.push(`/lab/${OPTIONS[n - 1].slug}`);
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        window.location.reload();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <nav className="lab-bar" aria-label="Timeline hero options">
      <Link href="/lab" className="lab-home">Timeline · hero lab</Link>
      <div className="lab-tabs">
        {OPTIONS.map((o, i) => {
          const active = o.slug === activeSlug;
          return (
            <Link
              key={o.slug}
              href={`/lab/${o.slug}`}
              className={`lab-tab${active ? " lab-tab-on" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="lab-idx">{i + 1}</span>
              <span className="lab-name">{o.name}</span>
              <span className={`lab-role lab-role-${o.role}`}>{o.role}</span>
            </Link>
          );
        })}
      </div>
      <button className="lab-replay" onClick={replay} title="Replay (R)">Replay ▸</button>
      <style>{LAB_CSS}</style>
    </nav>
  );
}

const LAB_CSS = `
.lab-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:16px;
  padding:10px 18px;background:rgba(255,255,255,.82);backdrop-filter:blur(8px);
  border-bottom:1px solid rgba(17,17,17,.08);font-family:var(--font-geist-sans,system-ui,sans-serif)}
.lab-home{font-size:13px;font-weight:600;color:var(--ink);text-decoration:none;letter-spacing:-.01em;white-space:nowrap}
.lab-tabs{display:flex;gap:6px;flex:1;min-width:0;overflow-x:auto}
.lab-tab{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;
  border:1px solid var(--hairline);color:var(--ink-soft);text-decoration:none;font-size:13px;white-space:nowrap;
  transition:border-color .15s,color .15s,background .15s}
.lab-tab:hover{border-color:var(--accent);color:var(--ink)}
.lab-tab-on{background:var(--accent);border-color:var(--accent);color:var(--paper)}
.lab-tab-on .lab-idx{color:var(--paper);border-color:rgba(255,255,255,.5)}
.lab-idx{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;
  border:1px solid var(--hairline);font-family:var(--font-geist-mono,monospace);font-size:10px;color:var(--ink-faint)}
.lab-role{font-family:var(--font-geist-mono,monospace);font-size:9px;letter-spacing:.06em;text-transform:uppercase}
.lab-role-preferred{color:var(--accent)}.lab-role-candidate{color:var(--ink-ghost)}
.lab-tab-on .lab-role{color:var(--paper)}
.lab-replay{appearance:none;border:1px solid var(--hairline);background:var(--paper);color:var(--ink);
  font:inherit;font-size:12.5px;padding:6px 13px;border-radius:8px;cursor:pointer;white-space:nowrap}
.lab-replay:hover{border-color:var(--accent)}
.lab-tab:focus-visible,.lab-home:focus-visible,.lab-replay:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (max-width:720px){.lab-replay{display:none}}
@media (max-width:520px){.lab-home{display:none}.lab-bar{padding-inline:10px}}
@media (prefers-reduced-motion:reduce){.lab-tab{transition:none}}
`;
