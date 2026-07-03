import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Your wedding plan, kept by Glenmara House";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#fafaf8",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
          padding: "80px 96px",
        }}
      >
        {/* Eyebrow, venue attribution */}
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#a8a29e",
            margin: 0,
            marginBottom: 32,
          }}
        >
          Planning with Glenmara House
        </p>

        {/* Title */}
        <h1
          style={{
            fontSize: 80,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            color: "#111111",
            margin: 0,
            marginBottom: 28,
          }}
        >
          Your wedding plan.
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.5,
            color: "#52525b",
            margin: 0,
            maxWidth: 680,
          }}
        >
          Everything that matters, in one place. Forward this to anyone
          who needs to see where things stand.
        </p>

        {/* Signal wordmark, bottom right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "absolute",
            bottom: 60,
            right: 96,
          }}
        >
          {/* Sweep gesture dot */}
          <svg width="40" height="16" viewBox="0 0 40 16">
            <line
              x1="4"
              x2="36"
              y1="8"
              y2="8"
              stroke="#a1a1aa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="26" cy="8" r="4" fill="#4f46e5" />
          </svg>
          <span
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#71717a",
            }}
          >
            signal studio.
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
