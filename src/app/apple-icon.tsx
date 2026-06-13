import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon for Signal Timeline. Full "roadmap" wordmark
 * with the suite-locked indigo dot. Brand-soft tile, ink wordmark,
 * indigo dot — same grammar as tasks/analytics/studio apple-icons.
 * No transparency — Apple draws a tile under transparent icons
 * which would clash with the brand-soft.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 26,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#14151a",
            fontSize: 90,
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          <span style={{ display: "flex" }}>timeline</span>
          <span
            style={{
              display: "flex",
              width: 15,
              height: 15,
              borderRadius: 9999,
              background: "#4f46e5",
              marginLeft: 7,
              marginBottom: 6,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
