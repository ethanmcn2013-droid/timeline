"use client";

import { useState } from "react";

export function ProjectorControls() {
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="min-h-11 rounded-lg border border-line-soft bg-white px-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        onClick={async () => {
          try {
            if (document.fullscreenElement) {
              await document.exitFullscreen();
              setMessage("Fullscreen closed.");
            } else if (document.documentElement.requestFullscreen) {
              await document.documentElement.requestFullscreen();
              setMessage("Fullscreen opened.");
            } else {
              setMessage("Fullscreen is not available here. Use your browser presentation controls.");
            }
          } catch {
            setMessage("Fullscreen was blocked. Use your browser presentation controls.");
          }
        }}
      >
        Toggle fullscreen
      </button>
      <span role="status" className="text-sm text-ink-quiet">{message}</span>
    </div>
  );
}
