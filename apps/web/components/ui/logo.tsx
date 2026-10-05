"use client";

import { useState } from "react";

const LETTER_COLORS = ["#3b6bff", "#ff7ab6", "#3fdcb0", "#a77bff"];

const star = (points: number, outer: number, inner: number) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

const BURST_OUTER = star(14, 96, 66);
const BURST_INNER = star(12, 70, 50);

export function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="ec-ribbon">
      <svg viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
        <path d="M0 14 L26 8 L22 30 L26 52 L0 46 L10 30 Z" fill="#2647c9" stroke="#1d1b4f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M300 14 L274 8 L278 30 L274 52 L300 46 L290 30 Z" fill="#2647c9" stroke="#1d1b4f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M18 4 H282 V56 H18 Z" fill="#3b6bff" stroke="#1d1b4f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M30 13 H270" stroke="#fff" strokeWidth="3" strokeDasharray="10 8" opacity=".6" />
      </svg>
      {children}
    </div>
  );
}

/**
 * How long letter `i` waits before it hops in a wave whose letters start `stagger` apart: the wave runs from the
 * first letter to the last, or from the `tapped` letter to both sides.
 */
export function hopDelay(i: number, tapped: number | null, stagger: number) {
  return Math.abs(i - (tapped ?? 0)) * stagger;
}

/** The letter a tap at `x` is on, given the middle of each letter: the nearest one, so no gap between them is dead */
export function tappedLetter(x: number, middles: number[]) {
  const off = (i: number) => Math.abs(middles[i] - x);
  return middles.reduce((nearest, _, i) => (off(i) < off(nearest) ? i : nearest), 0);
}

/** How far into ec-wordmark-hop (globals.css) a letter is back on the ground */
const LANDED = 0.55;

/** Whether one of the letters in `row` is still waiting for its hop or in the air */
function hopping(row: Element) {
  return row.getAnimations({ subtree: true }).some((a) => (a.effect?.getComputedTiming().progress ?? 1) < LANDED);
}

function Letters({
  text,
  className,
  tapped = null,
  onClick,
}: {
  text: string;
  className: string;
  tapped?: number | null;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    // onClickCapture, not onClick: for an onClick React also sets a click handler on the element itself, and Chrome
    // then offers the image to screen readers as something to press and pulls finger taps beside it onto it. Safari
    // on iPhone sends the click to a row with no handler of its own because the row has cursor: pointer (globals.css)
    <div className={className} role="img" aria-label={text} onClickCapture={onClick}>
      {[...text].map((ch, i) => (
        <i
          key={i}
          data-c={ch}
          style={
            {
              "--r": `${i % 2 ? 6 : -7}deg`,
              "--dy": `${i % 2 ? -5 : 0}px`,
              "--d": `${-i * 0.18}s`,
              // In steps: .ec-wordmark.hop multiplies it by the stagger
              "--i": hopDelay(i, tapped, 1),
              "--c": LETTER_COLORS[i % LETTER_COLORS.length],
            } as React.CSSProperties
          }
        >
          {ch}
        </i>
      ))}
    </div>
  );
}

/**
 * Header-sized version of the logo letters. Still by default; each new `hopKey` plays one hop wave,
 * and `hot` keeps them hopping like the home logo. A tap on a letter plays one wave that starts at that letter.
 */
export function Wordmark({
  text = "Enchatto",
  size = 24,
  hopKey = 0,
  hot = false,
}: {
  text?: string;
  size?: number;
  hopKey?: number;
  hot?: boolean;
}) {
  // The wave of the last tap: the letter it starts at, a count that tells two taps apart, and the `hopKey` it follows
  const [tap, setTap] = useState<{ at: number; count: number; hopKey: number } | null>(null);
  // A new `hopKey` and `hot` take over from it
  if (tap && (hot || tap.hopKey !== hopKey)) setTap(null);

  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Letters that are hopping absorb the tap: a wave in flight does not restart mid-hop
    if (hot || hopping(e.currentTarget)) return;
    const middles = [...e.currentTarget.children].map((letter) => {
      const box = letter.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    setTap({ at: tappedLetter(e.clientX, middles), count: (tap?.count ?? 0) + 1, hopKey });
  };

  const motion = hot ? " hot" : hopKey || tap ? " hop" : "";
  return (
    <div className={`ec-wordmark${motion}`} style={{ "--fs": `${size}px` } as React.CSSProperties}>
      {/* Remounting restarts the one-shot animation */}
      <Letters
        key={hot ? "hot" : `${hopKey}.${tap?.count ?? 0}`}
        text={text}
        className="ec-logo-top"
        tapped={tap?.at ?? null}
        onClick={onTap}
      />
    </div>
  );
}

/** Hopping "Enchatto" wordmark on a spinning burst with a ribbon tagline. */
export function Logo({
  text = "Enchatto",
  tagline,
  size = 54,
  bits = true,
  style,
}: {
  text?: string;
  tagline?: string;
  size?: number;
  bits?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className="ec-logo" style={{ "--fs": `${size}px`, ...style } as React.CSSProperties}>
      <svg className="ec-logo-burst" viewBox="-100 -100 200 200" aria-hidden>
        <polygon points={BURST_OUTER} fill="#ffd23f" stroke="#1d1b4f" strokeWidth="5" strokeLinejoin="round" />
        <polygon points={BURST_INNER} fill="#ff7ab6" stroke="#1d1b4f" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      <Letters text={text} className="ec-logo-top" />
      {tagline && <Ribbon>{tagline}</Ribbon>}
      {bits && (
        <div className="ec-logo-bits" aria-hidden>
          <b className="kana" style={{ "--c": "var(--mint)", left: -22, top: -14, "--d": "-.4s" } as React.CSSProperties}>あ</b>
          <b style={{ "--c": "var(--violet)", right: -20, top: -18, "--d": "-1.2s" } as React.CSSProperties}>A</b>
          <b style={{ "--c": "var(--red)", left: -10, top: size * 1.45, "--d": "-1.8s" } as React.CSSProperties}>！</b>
          <b style={{ "--c": "var(--yellow)", right: -8, top: size * 1.37, "--d": "-.9s" } as React.CSSProperties}>?</b>
        </div>
      )}
    </div>
  );
}
