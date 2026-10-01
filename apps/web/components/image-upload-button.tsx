"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/icon";

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
        className="ec-round-btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Upload image"
        style={disabled ? { opacity: 0.4 } : undefined}
      >
        <Icon name="ui-photo" size={28} />
      </button>
    </>
  );
}
