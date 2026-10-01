"use client";

import { DrawingCanvas } from "@/components/drawing-canvas";
import { Icon } from "@/components/ui/icon";

interface DrawingModalProps {
  isOpen: boolean;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
  lang?: string;
}

const TITLE = { en: "DOODLE TIME!", ja: "お絵かきタイム！" };

export function DrawingModal({ isOpen, onSave, onClose, lang }: DrawingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="ec-sheet-backdrop"
      style={{ zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ec-sheet"
        style={{ maxWidth: 420, padding: "12px 16px calc(18px + env(safe-area-inset-bottom))" }}
      >
        <div style={{ width: 54, height: 6, margin: "0 auto 10px", borderRadius: 3, background: "var(--line-soft)" }} />
        <div
          className="ec-chunky"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 22,
            textShadow: "0 3px 0 var(--yellow)",
          }}
        >
          <Icon name="g-pencil" size={32} style={{ animation: "ec-wave 0.6s ease-in-out infinite alternate" }} />
          {lang === "ja" ? TITLE.ja : TITLE.en}
        </div>
        <DrawingCanvas onSave={onSave} onCancel={onClose} lang={lang} />
      </div>
    </div>
  );
}
