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
  lang?: string;
}

const SWATCHES = ["#1d1b4f", "#ffffff", "#ff4f6d", "#ff8c42", "#ffd23f", "#3fdcb0", "#3b6bff", "#a77bff", "#ff7ab6", "#8b5a3c"];
const MIN_WIDTH = 1;
const MAX_WIDTH = 40;
const SIZE_PRESETS = [3, 8, 18];

const COPY = {
  en: { send: "SEND", undo: "Undo", custom: "Custom colour", size: "Pen size" },
  ja: { send: "送る", undo: "戻す", custom: "カスタム色", size: "ペンの太さ" },
};

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

const barStyle: React.CSSProperties = {
  height: 26,
  borderRadius: 13,
  position: "relative",
  cursor: "pointer",
  touchAction: "none",
  border: "2.5px solid var(--ink)",
};

const thumbStyle = (pct: number, color: string): React.CSSProperties => ({
  position: "absolute",
  top: "50%",
  left: `${pct}%`,
  transform: "translate(-50%, -50%)",
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "3px solid var(--ink)",
  boxShadow: "0 2px 0 var(--ink), inset 0 0 0 2px #fff",
  pointerEvents: "none",
  background: color,
});

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "ec-pop 0.3s cubic-bezier(0.3, 1.6, 0.5, 1)" }}>
      {/* Hue bar */}
      <div
        ref={hueRef}
        style={{
          ...barStyle,
          background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
        onPointerDown={(e) => { draggingRef.current = "hue"; updateHue(e.clientX); }}
      >
        <div style={thumbStyle((hsl[0] / 360) * 100, color)} />
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
        <div style={thumbStyle(hsl[2] * 100, color)} />
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
        ...barStyle,
        flex: 1,
        minWidth: 0,
        background: "#fff",
      }}
      onPointerDown={(e) => { draggingRef.current = true; update(e.clientX); }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: "3px 12px", width: "calc(100% - 24px)", height: "calc(100% - 6px)" }}
      >
        <path d="M0 10 L100 2 L100 18 Z" fill="var(--line-soft)" />
      </svg>
      <div style={thumbStyle(pct, color)} />
    </div>
  );
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas({
  onSave,
  onCancel,
  gameMode = false,
  countdownSeconds = -1,
  lang,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(SWATCHES[0]);
  const [lineWidth, setLineWidth] = useState(4);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSpectrum, setShowSpectrum] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const strokesRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number }[]>([]);
  const currentStrokeRef = useRef<{ points: { x: number; y: number }[]; color: string; width: number } | null>(null);
  const c = lang === "ja" ? COPY.ja : COPY.en;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Export at 1x resolution to keep data URL small (smaller for game mode)
      const maxDim = gameMode ? 160 : 512;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const outW = Math.round(w * scale);
      const outH = Math.round(h * scale);
      const offscreen = document.createElement("canvas");
      offscreen.width = outW;
      offscreen.height = outH;
      const octx = offscreen.getContext("2d");
      if (!octx) return canvas.toDataURL("image/jpeg", gameMode ? 0.3 : 0.6);
      // Fill white background for JPEG (no transparency)
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, outW, outH);
      octx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outW, outH);
      return offscreen.toDataURL("image/jpeg", gameMode ? 0.3 : 0.6);
    },
  }));

  // Uses the CSS box size, so no ancestor may be mid scale-animation when this mounts.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;
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
      const sx = canvas.offsetWidth / (rect.width || 1);
      const sy = canvas.offsetHeight / (rect.height || 1);

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * sx,
          y: (touch.clientY - rect.top) * sy,
        };
      }
      return {
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy,
      };
    },
    []
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
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
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    lastPoint.current = point;
    currentStrokeRef.current = { points: [point], color, width: lineWidth };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
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
    if (!octx) { onSave(canvas.toDataURL("image/jpeg", gameMode ? 0.3 : 0.6)); return; }
    // Fill white background for JPEG (no transparency)
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, outW, outH);
    octx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outW, outH);
    onSave(offscreen.toDataURL("image/jpeg", 0.6));
  };

  const counting = countdownSeconds >= 0;
  const hurry = counting && countdownSeconds <= 3;
  const isSwatch = SWATCHES.includes(color);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Canvas card */}
      <div
        style={{
          padding: 8,
          border: "3px solid var(--ink)",
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 6px 0 var(--ink)",
        }}
      >
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
            display: "block",
            border: "2.5px dashed var(--line-soft)",
            borderRadius: 16,
            width: "100%",
            aspectRatio: "1 / 1",
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
      </div>

      {/* Colour swatches */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", padding: "6px 6px 4px" }}>
        {SWATCHES.map((sw) => {
          const on = color === sw;
          return (
            <button
              key={sw}
              onClick={() => setColor(sw)}
              aria-label={sw}
              aria-pressed={on}
              style={{
                flex: "0 1 30px",
                minWidth: 0,
                aspectRatio: "1",
                borderRadius: "50%",
                border: "3px solid var(--ink)",
                background: sw,
                boxShadow: on ? "0 0 0 3px #fff, 0 0 0 6px var(--pink)" : "0 3px 0 var(--ink)",
                transform: on ? "translateY(-2px) scale(1.12)" : "none",
                transition: "transform 0.12s cubic-bezier(0.3, 1.6, 0.5, 1), box-shadow 0.12s",
              }}
            />
          );
        })}
        <button
          onClick={() => setShowSpectrum((v) => !v)}
          aria-label={c.custom}
          aria-pressed={showSpectrum}
          style={{
            position: "relative",
            flex: "0 1 30px",
            minWidth: 0,
            aspectRatio: "1",
            borderRadius: "50%",
            border: "3px solid var(--ink)",
            background: "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            boxShadow:
              !isSwatch || showSpectrum ? "0 0 0 3px #fff, 0 0 0 6px var(--pink)" : "0 3px 0 var(--ink)",
            transform: !isSwatch ? "translateY(-2px) scale(1.12)" : "none",
          }}
        >
          {!isSwatch && (
            <span
              style={{
                position: "absolute",
                inset: 5,
                borderRadius: "50%",
                border: "2px solid var(--ink)",
                background: color,
              }}
            />
          )}
        </button>
      </div>
      {showSpectrum && <SpectrumPicker color={color} onChange={setColor} />}

      {/* Pen size */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }} aria-label={c.size}>
        {SIZE_PRESETS.map((sz) => {
          const on = Math.abs(lineWidth - sz) <= 1;
          return (
            <button
              key={sz}
              onClick={() => setLineWidth(sz)}
              aria-label={`${sz}px`}
              style={{
                display: "grid",
                placeItems: "center",
                flex: "none",
                width: 34,
                height: 34,
                borderRadius: 12,
                border: "2.5px solid var(--ink)",
                background: on ? "var(--yellow)" : "#fff",
                boxShadow: on ? "0 1px 0 var(--ink)" : "0 3px 0 var(--ink)",
                transform: on ? "translateY(2px)" : "none",
              }}
            >
              <span
                style={{
                  width: Math.max(5, sz * 0.9),
                  height: Math.max(5, sz * 0.9),
                  borderRadius: "50%",
                  background: color === "#ffffff" ? "var(--line-soft)" : color,
                  border: color === "#ffffff" ? "1.5px solid var(--ink)" : "none",
                }}
              />
            </button>
          );
        })}
        <PenSizeBar value={lineWidth} min={MIN_WIDTH} max={MAX_WIDTH} color={color} onChange={setLineWidth} />
      </div>

      {/* Bottom bar: Close — Send — Undo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
        {!gameMode && (
          <button className="ec-round-btn" onClick={onCancel} aria-label="Close" style={{ width: 48, height: 48 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}

        <div style={{ position: "relative", flex: 1 }}>
          {(hasDrawn || counting) && (
            <span
              key={counting ? countdownSeconds : "idle"}
              className="drawing-send-pulse"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: hurry ? "var(--red)" : "var(--blue)",
              }}
            />
          )}
          <button
            className={`ec-btn${hurry ? " red" : ""}`}
            onClick={handleSave}
            disabled={!hasDrawn && !counting}
            style={{
              position: "relative",
              minHeight: gameMode ? 58 : 52,
              animation: hurry ? "ec-kick 0.5s ease-in-out infinite" : undefined,
            }}
          >
            {counting && (
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  minWidth: 34,
                  height: 34,
                  padding: "0 4px",
                  border: "2.5px solid var(--ink)",
                  borderRadius: "50%",
                  background: "#fff",
                  color: hurry ? "var(--red)" : "var(--ink)",
                  textShadow: "none",
                  fontSize: 17,
                }}
              >
                {countdownSeconds}
              </span>
            )}
            {c.send}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
          <style>{`
            .drawing-send-pulse {
              animation: drawingSendPulse 1s ease-out forwards;
              pointer-events: none;
            }
            @keyframes drawingSendPulse {
              0% { transform: scale(1); opacity: 0.45; }
              100% { transform: scale(1.25, 1.6); opacity: 0; }
            }
          `}</style>
        </div>

        <button
          className="ec-btn white sm"
          onClick={handleUndo}
          disabled={!hasDrawn}
          style={{ width: "auto", minHeight: gameMode ? 58 : 52, padding: "0 14px", gap: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h10a5 5 0 0 1 0 10H12" />
            <polyline points="7 14 3 10 7 6" />
          </svg>
          {c.undo}
        </button>
      </div>
    </div>
  );
});
