"use client";

import { PRESET_AVATARS, PresetAvatarId, avatarIconSrc } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";

interface AvatarPickerProps {
  selected: PresetAvatarId;
  onSelect: (id: PresetAvatarId) => void;
  takenAvatars?: string[];
  lang?: string;
}

export function AvatarPicker({ selected, onSelect, takenAvatars = [], lang }: AvatarPickerProps) {
  return (
    <div className="ec-av-grid">
      {PRESET_AVATARS.map((avatar) => {
        const isSelected = selected === avatar.id;
        const isTaken = takenAvatars.includes(avatar.id) && !isSelected;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => !isTaken && onSelect(avatar.id)}
            disabled={isTaken}
            title={isTaken ? `${avatar.label} (taken)` : avatar.label}
            aria-pressed={isSelected}
            className={`ec-av-tile${isSelected ? " sel" : ""}${isTaken ? " taken" : ""}`}
            data-tag={t("IN ROOM", lang)}
            style={{ "--c": avatar.color } as React.CSSProperties}
          >
            <img src={avatarIconSrc(avatar.id)} alt={avatar.label} draggable={false} />
            {isSelected && <Icon name="ui-sparkle" size={24} className="ec-av-spark" />}
          </button>
        );
      })}
    </div>
  );
}
