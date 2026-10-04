"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface MessageDrawingProps {
  src: string;
  onLoad?: () => void;
}

export function MessageDrawing({ src, onLoad }: MessageDrawingProps) {
  const [fullscreen, setFullscreen] = useState(false);
  // The frame lets its tape lie over its top edge only once the picture is in: until then the frame is a few
  // pixels tall, and the tape would hang in mid-air
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div className={`ec-media drawing${loaded ? " loaded" : ""}`} onClick={() => setFullscreen(true)}>
        <img
          src={src}
          alt="Drawing"
          onLoad={() => {
            setLoaded(true);
            onLoad?.();
          }}
        />
      </div>

      {fullscreen &&
        createPortal(
          <div className="ec-lightbox" onClick={() => setFullscreen(false)}>
            <img src={src} alt="Drawing" />
            <button className="ec-round-btn" aria-label="Close">✕</button>
          </div>,
          document.body
        )}
    </>
  );
}
