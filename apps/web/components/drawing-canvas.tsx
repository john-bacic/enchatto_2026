"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { t } from "@/lib/i18n";

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  lang?: string;
}

const COLORS = ["#1a1a1a", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
const SIZES = [2, 4, 8];

export function DrawingCanvas({
  width = 320,
  height = 240,
  onSave,
  onCancel,
  lang,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(SIZES[1]);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [width, height]
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
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
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
        width={width}
        height={height}
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
          maxWidth: `${width}px`,
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

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "8px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            fontSize: "0.85rem",
          }}
        >
          {t("Clear", lang)}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "8px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            fontSize: "0.85rem",
          }}
        >
          {t("Cancel", lang)}
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {t("Send", lang)}
        </button>
      </div>
    </div>
  );
}
