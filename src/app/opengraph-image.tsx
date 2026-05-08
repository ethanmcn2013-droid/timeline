import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "roadmap — ship what matters";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const fontSize = 260;

  const lineW = 96;
  const dotR = 8;
  const svgW = lineW + dotR * 2;
  const svgH = dotR * 2 + 4;
  const midY = svgH / 2;
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
          background: "#f0f1ff",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
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
          <div
            style={{
              fontSize,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#18181b",
              lineHeight: 1,
            }}
          >
            roadmap
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
