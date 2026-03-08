"use client";

import { PRESET_AVATARS, PresetAvatarId } from "@/lib/types";

interface AvatarPickerProps {
  selected: PresetAvatarId;
  onSelect: (id: PresetAvatarId) => void;
  takenAvatars?: string[];
}

export function AvatarPicker({ selected, onSelect, takenAvatars = [] }: AvatarPickerProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.5rem",
      }}
    >
      {PRESET_AVATARS.map((avatar) => {
        const isSelected = selected === avatar.id;
        const isTaken = takenAvatars.includes(avatar.id) && !isSelected;
        return (
          <button
            key={avatar.id}
            onClick={() => !isTaken && onSelect(avatar.id)}
            disabled={isTaken}
            title={isTaken ? `${avatar.label} (taken)` : avatar.label}
            style={{
              fontSize: "1.6rem",
              width: "100%",
              aspectRatio: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.1rem",
              borderRadius: "var(--radius)",
              background: isSelected ? avatar.color : "var(--surface)",
              border: isSelected
                ? "2px solid var(--primary)"
                : "2px solid var(--border)",
              transition: "all 0.15s ease",
              position: "relative",
              opacity: isTaken ? 0.3 : 1,
              cursor: isTaken ? "not-allowed" : "pointer",
            }}
          >
            <span>{avatar.emoji}</span>
            <span
              style={{
                fontSize: "0.55rem",
                color: isTaken ? "var(--muted)" : "var(--muted)",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              {isTaken ? "Taken" : avatar.label}
            </span>
            {isSelected && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "4px",
                  fontSize: "0.6rem",
                  color: "var(--primary)",
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
