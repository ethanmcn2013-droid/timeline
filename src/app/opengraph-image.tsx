import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "roadmap — ship what matters";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Root OG image.
 * Wordmark-only composition — same restraint as studio. OG.
 * Background: --bg #fafaf7 (warm-stone canvas token from globals.css)
 * Wordmark: hairline SVG mark (—•—) + "roadmap" text
 *   - text color:    #18181b (--ink-900)
 *   - hairline:      #71717a (--ink-500 / --ink-quiet, matches SVG stroke in component)
 *   - dot fill:      #4f46e5 (--indigo-600 / --brand)
 * SVG mark scaled to be a legible accent at thumbnail size:
 *   lineW=120, dotR=9 → total SVG 138×20
 */
export default async function OG() {
  const fontSize = 330;

  // SVG hairline mark — proportional to the brand component, fixed size
  const lineW = 120;
  const dotR = 9;
  const svgW = lineW + dotR * 2;
  const svgH = dotR * 2 + 2;
  const midY = svgH / 2;
  // Dot rests at 70% along the line (RESTING = 0.7)
  const dotCx = dotR + lineW * 0.7;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#fafaf7",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: Math.round(fontSize * 0.45 * 0.45), // ~0.45em gap scaled
            marginLeft: "-0.15ch",
          }}
        >
          {/* Hairline + dot mark — static version of the animated SVG lockup */}
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            // Align to text baseline: shift down so it sits at cap-height midpoint
            style={{ display: "flex", alignSelf: "center", marginBottom: 8 }}
          >
            <line
              x1={dotR}
              x2={lineW + dotR}
              y1={midY}
              y2={midY}
              stroke="#71717a"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <circle cx={dotCx} cy={midY} r={dotR} fill="#4f46e5" />
          </svg>

          {/* Wordmark text */}
          <span
            style={{
              display: "flex",
              fontSize,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#18181b",
            }}
          >
            roadmap
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
