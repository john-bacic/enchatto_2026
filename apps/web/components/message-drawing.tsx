"use client";

import { useState } from "react";

interface MessageDrawingProps {
  src: string;
}

export function MessageDrawing({ src }: MessageDrawingProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div
        onClick={() => setFullscreen(true)}
        style={{
          maxWidth: "220px",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
          border: "1px solid var(--border)",
          background: "#fff",
        }}
      >
        <img
          src={src}
          alt="Drawing"
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            cursor: "zoom-out",
            padding: "1rem",
          }}
        >
          <img
            src={src}
            alt="Drawing"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
              background: "#fff",
            }}
          />
        </div>
      )}
    </>
  );
}
