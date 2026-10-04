"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { RoomTexture, ambientTexture, ambientTextureIfAny, keepAmbientTexture, textureStyle } from "@/lib/textures";

/**
 * Fixed full-page paper + texture behind everything. A room's screens pass the room's texture, which the screens
 * outside a room then keep showing; without one this is such a screen and shows the ambient texture (lib/textures.ts).
 * `waiting` says the room's texture is on its way: until it comes no random texture is picked, since the room's
 * would replace it a moment later.
 */
export function RoomBackground({ texture, waiting = false }: { texture?: RoomTexture; waiting?: boolean }) {
  // The ambient texture is only known in the browser. The server and the first client render draw the paper bare,
  // so they match, and the layout effect puts the texture on before that render is painted
  const [ambient, setAmbient] = useState<RoomTexture>();
  useLayoutEffect(() => {
    if (texture) keepAmbientTexture(texture);
    else setAmbient(waiting ? ambientTextureIfAny() : ambientTexture());
  }, [texture, waiting]);
  const shown = texture ?? ambient;
  return <div className="ec-paper" style={shown && textureStyle(shown)} aria-hidden />;
}

const CONFETTI_COLORS = ["#ff7ab6", "#3b6bff", "#ffd23f", "#3fdcb0", "#a77bff", "#ff4f6d"];

/** One-shot confetti burst. Re-trigger by changing `burstKey`. */
export function Confetti({ burstKey, count = 70 }: { burstKey: string | number; count?: number }) {
  const [visible, setVisible] = useState(true);
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: Math.random() * 360,
        round: Math.random() < 0.3,
      })),
    [burstKey, count]
  );

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(t);
  }, [burstKey]);

  if (!visible) return null;
  return (
    <div className="ec-confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
            borderRadius: p.round ? "50%" : 2,
            width: p.round ? 10 : 9,
            height: p.round ? 10 : 14,
          }}
        />
      ))}
    </div>
  );
}

/** Diagonal striped banner that sweeps across the screen once. */
export function CutIn({
  children,
  burstKey,
  colors = ["#ff7ab6", "#ff9ccc"],
}: {
  children: React.ReactNode;
  burstKey: string | number;
  colors?: [string, string];
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [burstKey]);
  if (!visible) return null;
  return (
    <div key={burstKey} className="ec-cutin" style={{ "--c1": colors[0], "--c2": colors[1] } as React.CSSProperties}>
      <span>{children}</span>
    </div>
  );
}

/** Spinning sunburst rays (position: absolute; parent needs position: relative + overflow hidden). */
export function Rays({ rainbow = false, glow = true }: { rainbow?: boolean; glow?: boolean }) {
  return (
    <>
      <div className={`ec-rays${rainbow ? " rainbow" : ""}`} aria-hidden />
      {glow && <div className="ec-rays-glow" aria-hidden />}
    </>
  );
}

const FLAG_COLORS = ["#ff7ab6", "#3b6bff", "#ffd23f", "#3fdcb0", "#a77bff"];

/** Swaying party bunting strip. */
export function Bunting({ top = 0 }: { top?: number }) {
  return (
    <svg
      viewBox="0 0 400 34"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        position: "absolute",
        left: "-2%",
        top,
        width: "104%",
        height: 34,
        zIndex: 6,
        pointerEvents: "none",
        transformOrigin: "50% 0",
        animation: "ec-wiggle 2.4s ease-in-out infinite",
      }}
    >
      <path d="M0 4 Q200 22 400 4" fill="none" stroke="#1d1b4f" strokeWidth="2.5" />
      <g stroke="#1d1b4f" strokeWidth="2.5" strokeLinejoin="round">
        {Array.from({ length: 16 }, (_, i) => {
          const x = 6 + i * 25;
          const t = x / 400;
          const y = 4 + 18 * t * (1 - t) * 2;
          return <path key={i} d={`M${x} ${y} L${x + 18} ${y} L${x + 9} ${y + 16} Z`} fill={FLAG_COLORS[i % 5]} />;
        })}
      </g>
    </svg>
  );
}
