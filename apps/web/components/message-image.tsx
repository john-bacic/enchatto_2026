"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

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
      <div className="ec-media" onClick={() => setFullscreen(true)}>
        {!loaded && (
          <div className="ec-media-loading">
            <span className="ec-dots"><i /><i /><i /></span>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          style={{ display: loaded ? "block" : "none" }}
        />
      </div>

      {fullscreen &&
        createPortal(
          <div className="ec-lightbox" onClick={() => setFullscreen(false)}>
            <img src={src} alt={alt} />
            <button className="ec-round-btn" aria-label="Close">✕</button>
          </div>,
          document.body
        )}
    </>
  );
}
