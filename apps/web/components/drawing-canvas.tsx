"use client";

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

export interface DrawingCanvasHandle {
  exportImage: () => string | null;
}

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  gameMode?: boolean;
  countdownSeconds?: number;
}

const BW_COLORS = ["#000000", "#ffffff"];
const RAINBOW_COLORS = ["#ef4444", "#ff8c00", "#facc15", "#22c55e", "#3b82f6", "#4f46e5", "#8b5cf6"];
const MIN_WIDTH = 1;
const MAX_WIDTH = 40;

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function SpectrumPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(color));
  const hueRef = useRef<HTMLDivElement>(null);
  const brightRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"hue" | "bright" | null>(null);

  // Sync external color changes
  useEffect(() => {
    const [h, s, l] = hexToHsl(color);
    setHsl([h, s, l]);
  }, [color]);

  const updateHue = useCallback((clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const h = (x / rect.width) * 360;
    // If brightness is at black or white extremes, reset to center so the color is visible
    const l = (hsl[2] <= 0.05 || hsl[2] >= 0.95) ? 0.5 : hsl[2];
    const next: [number, number, number] = [h, hsl[1] || 1, l];
    setHsl(next);
    onChange(hslToHex(next[0], next[1], next[2]));
  }, [hsl, onChange]);

  const updateBright = useCallback((clientX: number) => {
    const el = brightRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const l = x / rect.width;
    const next: [number, number, number] = [hsl[0], hsl[1] || 1, l];
    setHsl(next);
    onChange(hslToHex(next[0], next[1], next[2]));
  }, [hsl, onChange]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingRef.current === "hue") updateHue(e.clientX);
      else if (draggingRef.current === "bright") updateBright(e.clientX);
    };
    const onUp = () => { draggingRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateHue, updateBright]);

  const barStyle: React.CSSProperties = {
    height: "1.75rem",
    borderRadius: "0.875rem",
    position: "relative",
    cursor: "pointer",
    touchAction: "none",
    border: "1px solid var(--border)",
  };

  const thumbStyle = (pct: number): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    left: `${pct}%`,
    transform: "translate(-50%, -50%)",
    width: "1.35rem",
    height: "1.35rem",
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)",
    pointerEvents: "none" as const,
    background: color,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1, minWidth: 0 }}>
      {/* Hue bar */}
      <div
        ref={hueRef}
        style={{
          ...barStyle,
          background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
        onPointerDown={(e) => { draggingRef.current = "hue"; updateHue(e.clientX); }}
      >
        <div style={thumbStyle((hsl[0] / 360) * 100)} />
      </div>
      {/* Brightness bar */}
      <div
        ref={brightRef}
        style={{
          ...barStyle,
          background: `linear-gradient(to right, #000, hsl(${hsl[0]}, ${Math.round(hsl[1] * 100)}%, 50%), #fff)`,
        }}
        onPointerDown={(e) => { draggingRef.current = "bright"; updateBright(e.clientX); }}
      >
        <div style={thumbStyle(hsl[2] * 100)} />
      </div>
    </div>
  );
}

function PenSizeBar({ value, min, max, color, onChange }: {
  value: number; min: number; max: number; color: string; onChange: (v: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    onChange(Math.round(min + pct * (max - min)));
  }, [min, max, onChange]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (draggingRef.current) update(e.clientX); };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [update]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={barRef}
      style={{
        height: "1.75rem",
        borderRadius: "0.875rem",
        position: "relative",
        cursor: "pointer",
        touchAction: "none",
        border: "1px solid var(--border)",
        background: "#e5e5e5",
      }}
      onPointerDown={(e) => { draggingRef.current = true; update(e.clientX); }}
    >
      <div style={{
        position: "absolute",
        top: "50%",
        left: `${pct}%`,
        transform: "translate(-50%, -50%)",
        width: "1.35rem",
        height: "1.35rem",
        borderRadius: "50%",
        border: "2px solid #fff",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        background: color,
      }} />
    </div>
  );
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas({
  onSave,
  onCancel,
  gameMode = false,
  countdownSeconds = -1,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(BW_COLORS[0]);
  const [lineWidth, setLineWidth] = useState(4);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokesRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number }[]>([]);
  const currentStrokeRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number } | null>(null);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Export at 1x resolution to keep data URL small
      const maxDim = 512;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const outW = Math.round(w * scale);
      const outH = Math.round(h * scale);
      const offscreen = document.createElement("canvas");
      offscreen.width = outW;
      offscreen.height = outH;
      const octx = offscreen.getContext("2d");
      if (!octx) return canvas.toDataURL("image/png");
      octx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outW, outH);
      return offscreen.toDataURL("image/png");
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);
  }, [dpr]);

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    lastPoint.current = point;
    currentStrokeRef.current = { points: [point], color, width: lineWidth };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const point = getPoint(e);
    if (!point) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPoint.current = point;
    currentStrokeRef.current?.points.push(point);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStrokeRef.current) {
      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = null;
      setHasDrawn(true);
    }
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    redrawCanvas();
    if (strokesRef.current.length === 0) setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export at 1x resolution to keep data URL small
    const maxDim = 512;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const outW = Math.round(w * scale);
    const outH = Math.round(h * scale);
    const offscreen = document.createElement("canvas");
    offscreen.width = outW;
    offscreen.height = outH;
    const octx = offscreen.getContext("2d");
    if (!octx) { onSave(canvas.toDataURL("image/png")); return; }
    octx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outW, outH);
    onSave(offscreen.toDataURL("image/png"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Spectrum color picker + thickness */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <SpectrumPicker color={color} onChange={setColor} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "3rem" }}>
          <span
            style={{
              width: `${Math.max(lineWidth, 6)}px`,
              height: `${Math.max(lineWidth, 6)}px`,
              borderRadius: "50%",
              background: color,
              border: color === "#ffffff" ? "1px solid var(--border)" : "none",
            }}
          />
        </div>
      </div>
      <PenSizeBar value={lineWidth} min={MIN_WIDTH} max={MAX_WIDTH} color={color} onChange={setLineWidth} />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          width: "100%",
          aspectRatio: "1 / 1",
          touchAction: "none",
          cursor: "crosshair",
        }}
      />

      {/* Bottom bar: Close (left) — Send (center) — Clear (right) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "0.75rem 0 0.25rem",
          minHeight: "40px",
        }}
      >
        {/* Close — left (hidden in game mode) */}
        {!gameMode && (
          <div style={{ position: "absolute", left: 0 }}>
            <button
              onClick={onCancel}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--surface, #fff)",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg, #1a1a1a)" strokeWidth="3" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Send — center */}
        <div style={{ position: "relative", width: gameMode ? "48px" : "32px", height: gameMode ? "48px" : "32px" }}>
          {(hasDrawn || countdownSeconds >= 0) && (
            <span
              key={countdownSeconds >= 0 ? countdownSeconds : "idle"}
              className="drawing-send-pulse"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: countdownSeconds >= 0
                  ? (countdownSeconds <= 3 ? "#ef4444" : "var(--primary)")
                  : "var(--primary)",
              }}
            />
          )}
          <button
            onClick={handleSave}
            disabled={!hasDrawn && countdownSeconds < 0}
            style={{
              position: "relative",
              width: gameMode ? "48px" : "32px",
              height: gameMode ? "48px" : "32px",
              borderRadius: "50%",
              background: countdownSeconds >= 0
                ? (countdownSeconds <= 3 ? "#ef4444" : "var(--primary)")
                : (hasDrawn ? "var(--primary)" : "var(--border)"),
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: hasDrawn ? "pointer" : "default",
              transition: "background 0.15s ease",
            }}
          >
            {countdownSeconds >= 0 ? (
              <span style={{
                color: "#fff",
                fontSize: gameMode ? "1.25rem" : "0.85rem",
                fontWeight: 700,
              }}>
                {countdownSeconds}
              </span>
            ) : (
              <svg
                width={gameMode ? "24" : "16"}
                height={gameMode ? "24" : "16"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </button>
          <style>{`
            .drawing-send-pulse {
              animation: drawingSendPulse 1s ease-out;
            }
            @keyframes drawingSendPulse {
              0% { transform: scale(1); opacity: 0.5; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Undo — right */}
        <div style={{ position: "absolute", right: 0 }}>
          <button
            onClick={handleUndo}
            disabled={!hasDrawn}
            style={{
              position: "relative",
              border: "none",
              background: "transparent",
              cursor: hasDrawn ? "pointer" : "default",
              padding: 0,
              width: "44px",
              height: "32px",
            }}
          >
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none" style={{ position: "absolute", inset: 0 }}>
              <path d="M0,16 L10,0 L36,0 Q44,0 44,8 L44,24 Q44,32 36,32 L10,32 Z" fill={hasDrawn ? "#ef4444" : "var(--border)"} />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%, -50%)" }}>
              <path d="M3 10h10a5 5 0 0 1 0 10H12" />
              <polyline points="7 14 3 10 7 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
