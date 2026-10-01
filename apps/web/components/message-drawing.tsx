"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface MessageDrawingProps {
  src: string;
  onLoad?: () => void;
}

export function MessageDrawing({ src, onLoad }: MessageDrawingProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="ec-media drawing" onClick={() => setFullscreen(true)}>
        <img src={src} alt="Drawing" onLoad={onLoad} />
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
