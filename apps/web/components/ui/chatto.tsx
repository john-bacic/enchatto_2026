"use client";

/** Chatto, the yellow speech-bubble mascot. */
export function Chatto({
  size = 120,
  bob = true,
  wave = true,
  shadow = false,
  style,
}: {
  size?: number;
  bob?: boolean;
  wave?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ width: size, flex: "none", ...style }}>
      <svg
        className={`ec-mascot${bob ? " bob" : ""}`}
        viewBox="-6 -8 132 140"
        width={size}
        height={size * (140 / 132)}
        aria-hidden
      >
        <ellipse cx="44" cy="120" rx="13" ry="8" fill="#3b6bff" stroke="#1d1b4f" strokeWidth="4" />
        <ellipse cx="76" cy="120" rx="13" ry="8" fill="#3b6bff" stroke="#1d1b4f" strokeWidth="4" />
        <path d="M16 62 L2 48" stroke="#1d1b4f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="2" cy="47" r="6" fill="#ffd23f" stroke="#1d1b4f" strokeWidth="3.5" />
        <g className={wave ? "wave" : undefined}>
          <path d="M104 60 L118 40" stroke="#1d1b4f" strokeWidth="4" strokeLinecap="round" />
          <circle cx="118" cy="39" r="6" fill="#ffd23f" stroke="#1d1b4f" strokeWidth="3.5" />
        </g>
        <path d="M60 14 Q55 2 64 -3" fill="none" stroke="#1d1b4f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="65" cy="-3" r="6" fill="#ff7ab6" stroke="#1d1b4f" strokeWidth="3.5" />
        <path
          d="M56 14 H64 C88 14 106 30 106 54 C106 78 88 96 64 96 H50 L28 112 L34 92 C22 85 14 71 14 54 C14 30 32 14 56 14 Z"
          fill="#ffd23f"
          stroke="#1d1b4f"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path d="M26 40 C30 28 42 21 54 20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />
        <g className="blink">
          <circle cx="45" cy="50" r="11" fill="#fff" stroke="#1d1b4f" strokeWidth="3.5" />
          <circle cx="47" cy="51" r="5.5" fill="#1d1b4f" />
          <circle cx="49" cy="48.5" r="2" fill="#fff" />
          <circle cx="77" cy="50" r="11" fill="#fff" stroke="#1d1b4f" strokeWidth="3.5" />
          <circle cx="79" cy="51" r="5.5" fill="#1d1b4f" />
          <circle cx="81" cy="48.5" r="2" fill="#fff" />
        </g>
        <ellipse cx="32" cy="67" rx="7" ry="4.5" fill="#ff7ab6" opacity=".8" />
        <ellipse cx="90" cy="67" rx="7" ry="4.5" fill="#ff7ab6" opacity=".8" />
        <path d="M52 66 Q61 80 70 66 Z" fill="#ff4f6d" stroke="#1d1b4f" strokeWidth="3.5" strokeLinejoin="round" />
      </svg>
      {shadow && <div className="ec-mascot-shadow" />}
    </div>
  );
}
