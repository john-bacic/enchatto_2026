"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const COLORS = ["#1a1a1a", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
const SIZES = [2, 4, 8];

export function DrawingCanvas({
  onSave,
  onCancel,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(SIZES[1]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getPoint(e);
    if (!point) return;
    setIsDrawing(true);
    lastPoint.current = point;
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
  };

  const stopDrawing = () => {
    if (isDrawing) setHasDrawn(true);
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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

      {/* Color picker */}
      <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: c,
              border: color === c ? "2px solid var(--primary)" : "2px solid transparent",
              outline: color === c ? "1px solid var(--primary-light)" : "none",
              cursor: "pointer",
            }}
          />
        ))}

        <span style={{ margin: "0 0.3rem", color: "var(--border)" }}>|</span>

        {/* Line width */}
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setLineWidth(s)}
            style={{
              width: "1.5rem",
              height: "1.5rem",
              borderRadius: "50%",
              background: lineWidth === s ? "var(--bg)" : "transparent",
              border: lineWidth === s ? "1px solid var(--primary)" : "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: `${s + 2}px`,
                height: `${s + 2}px`,
                borderRadius: "50%",
                background: "var(--fg)",
              }}
            />
          </button>
        ))}
      </div>

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
        {/* Close — left */}
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--fg, #1a1a1a)"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Send — center */}
        <div style={{ position: "relative", width: "32px", height: "32px" }}>
          {hasDrawn && (
            <span
              className="drawing-send-pulse"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "var(--primary)",
              }}
            />
          )}
          <button
            onClick={handleSave}
            disabled={!hasDrawn}
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: hasDrawn ? "var(--primary)" : "var(--border)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: hasDrawn ? "pointer" : "default",
              transition: "background 0.15s ease",
            }}
          >
            <svg
              width="16"
              height="16"
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
          </button>
          <style jsx>{`
            .drawing-send-pulse {
              animation: drawingSendPulse 1.5s ease-out infinite;
            }
            @keyframes drawingSendPulse {
              0% { transform: scale(1); opacity: 0.5; }
              100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Clear — right (tag shape pointing left) */}
        <div style={{ position: "absolute", right: 0 }}>
          <button
            onClick={handleClear}
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
            <svg
              width="44"
              height="32"
              viewBox="0 0 44 32"
              fill="none"
              style={{ position: "absolute", inset: 0 }}
            >
              <path
                d="M0,16 L10,0 L36,0 Q44,0 44,8 L44,24 Q44,32 36,32 L10,32 Z"
                fill={hasDrawn ? "#ef4444" : "var(--border)"}
              />
            </svg>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                position: "absolute",
                top: "50%",
                left: "55%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
