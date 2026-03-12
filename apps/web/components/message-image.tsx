"use client";

import { useState } from "react";

interface MessageImageProps {
  src: string;
  alt?: string;
  onLoad?: () => void;
}

export function MessageImage({ src, alt = "Shared image", onLoad }: MessageImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div
        style={{
          maxWidth: "240px",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => setFullscreen(true)}
      >
        {!loaded && (
          <div
            style={{
              width: "240px",
              height: "160px",
              background: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: "0.8rem",
            }}
          >
            Loading...
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          style={{
            width: "100%",
            display: loaded ? "block" : "none",
          }}
        />
      </div>

      {/* Fullscreen overlay */}
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
            alt={alt}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </>
  );
}
