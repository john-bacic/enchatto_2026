"use client";

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

function Letters({ text, className }: { text: string; className: string }) {
  return (
    <div className={className} aria-label={text}>
      {[...text].map((ch, i) => (
        <i
          key={i}
          data-c={ch}
          style={
            {
              "--r": `${i % 2 ? 6 : -7}deg`,
              "--dy": `${i % 2 ? -5 : 0}px`,
              "--d": `${-i * 0.18}s`,
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

/** Still, header-sized version of the logo letters. */
export function Wordmark({ text = "Enchatto", size = 24 }: { text?: string; size?: number }) {
  return (
    <div className="ec-wordmark" style={{ "--fs": `${size}px` } as React.CSSProperties}>
      <Letters text={text} className="ec-logo-top" />
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
          <b style={{ "--c": "var(--mint)", left: -22, top: -12, "--d": "-.4s" } as React.CSSProperties}>あ</b>
          <b style={{ "--c": "var(--violet)", right: -20, top: -18, "--d": "-1.2s" } as React.CSSProperties}>A</b>
          <b style={{ "--c": "var(--red)", left: -10, top: size * 1.45, "--d": "-1.8s" } as React.CSSProperties}>！</b>
          <b style={{ "--c": "var(--yellow)", right: -8, top: size * 1.37, "--d": "-.9s" } as React.CSSProperties}>?</b>
        </div>
      )}
    </div>
  );
}
