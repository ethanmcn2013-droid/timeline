import Link from "next/link";
import { OPTIONS } from "@/components/lab/registry";

export default function LabIndex() {
  return (
    <main className="labx">
      <header className="labx-head">
        <p className="labx-kicker">Signal Timeline · first-experience lab</p>
        <h1 className="labx-h1">Three directions for the Timeline hero</h1>
        <p className="labx-lede">
          Each takes the same promise, one public plan anyone can read, and finds a different first
          impression for it. Two are refined directions held to a world-class bar. The third is their
          hybrid, the link and the line married into one. Open each, watch the first two seconds, then
          judge the rest state, that is what a visitor actually lives with. Press 1 to {OPTIONS.length} to
          jump, R to replay.
        </p>
      </header>
      <div className="labx-grid">
        {OPTIONS.map((o, i) => (
          <Link key={o.slug} href={`/lab/${o.slug}`} className="labx-card">
            <div className="labx-card-top">
              <span className="labx-idx">{i + 1}</span>
              <span className={`labx-role labx-role-${o.role}`}>{o.role}</span>
            </div>
            <h2 className="labx-name">{o.name}</h2>
            <p className="labx-lens">{o.lens}</p>
            {o.headline && <p className="labx-headline">&ldquo;{o.headline}&rdquo;</p>}
            {o.blurb && <p className="labx-blurb">{o.blurb}</p>}
            <span className="labx-open">Open ▸</span>
          </Link>
        ))}
      </div>
      <style>{INDEX_CSS}</style>
    </main>
  );
}

const INDEX_CSS = `
.labx{min-height:100svh;background:#fff;color:#111;font-family:var(--font-geist-sans,system-ui,sans-serif);
  max-width:1120px;margin:0 auto;padding:72px 28px 96px}
.labx-kicker{font-family:var(--font-geist-mono,monospace);font-size:12px;letter-spacing:.14em;
  text-transform:uppercase;color:#4f46e5;margin:0 0 14px}
.labx-h1{font-size:clamp(30px,5vw,46px);line-height:1.05;letter-spacing:-.03em;font-weight:600;margin:0 0 16px}
.labx-lede{font-size:17px;line-height:1.55;color:#3f3f46;max-width:68ch;margin:0 0 44px}
.labx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(248px,1fr));gap:16px}
.labx-card{display:flex;flex-direction:column;gap:6px;padding:22px;border:1px solid rgba(17,17,17,.1);
  border-radius:14px;text-decoration:none;color:inherit;transition:.15s;background:#fff}
.labx-card:hover{border-color:#4f46e5;transform:translateY(-2px);box-shadow:0 10px 30px -18px rgba(79,70,229,.5)}
.labx-card-top{display:flex;align-items:center;justify-content:space-between}
.labx-idx{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;
  border:1px solid rgba(17,17,17,.18);font-family:var(--font-geist-mono,monospace);font-size:12px;color:#71717a}
.labx-role{font-family:var(--font-geist-mono,monospace);font-size:10.5px;letter-spacing:.08em;
  text-transform:uppercase;padding:3px 8px;border-radius:999px}
.labx-role-polished{color:#3f3f46;background:#f4f4f5}
.labx-role-hybrid{color:#fff;background:#4f46e5}
.labx-name{font-size:19px;font-weight:600;letter-spacing:-.01em;margin:4px 0 0}
.labx-lens{font-family:var(--font-geist-mono,monospace);font-size:11px;letter-spacing:.04em;
  color:#a1a1aa;text-transform:uppercase;margin:0}
.labx-headline{font-size:14px;color:#111;margin:4px 0 0;font-style:italic}
.labx-blurb{font-size:13.5px;line-height:1.5;color:#71717a;margin:2px 0 0;flex:1}
.labx-open{font-size:13px;color:#4f46e5;margin-top:8px}
`;
