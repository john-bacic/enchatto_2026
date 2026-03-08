"use client";

import { useRef } from "react";

interface ImageUploadButtonProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploadButton({ onUpload, disabled }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset so the same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Upload image"
        style={{
          background: "none",
          fontSize: "1.2rem",
          padding: "0.3rem",
          color: disabled ? "var(--border)" : "var(--muted)",
          display: "flex",
          alignItems: "center",
        }}
      >
        📷
      </button>
    </>
  );
}
