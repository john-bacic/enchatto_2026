"use client";

import { DrawingCanvas } from "@/components/drawing-canvas";

interface DrawingModalProps {
  isOpen: boolean;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export function DrawingModal({ isOpen, onSave, onClose }: DrawingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          padding: "1.25rem",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}
        >
          Draw something
        </h3>
        <DrawingCanvas onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  );
}
