"use client";

import { useEffect, useRef, useState } from "react";
import { PRESET_AVATARS, PresetAvatarId, avatarIconSrc } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { t } from "@/lib/i18n";

interface AvatarPickerProps {
  selected: PresetAvatarId;
  onSelect: (id: PresetAvatarId) => void;
  takenAvatars?: string[];
  lang?: string;
}

const PER_PAGE = 16;
const PAGES = Array.from({ length: Math.ceil(PRESET_AVATARS.length / PER_PAGE) }, (_, i) =>
  PRESET_AVATARS.slice(i * PER_PAGE, (i + 1) * PER_PAGE)
);

export function AvatarPicker({ selected, onSelect, takenAvatars = [], lang }: AvatarPickerProps) {
  const pager = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // Open on the page holding the current pick (it can be auto-chosen from page 2)
  useEffect(() => {
    const el = pager.current;
    const index = PAGES.findIndex((p) => p.some((a) => a.id === selected));
    if (!el || index < 0) return;
    el.scrollTo({ left: index * el.clientWidth });
    setPage(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (index: number) => {
    const el = pager.current;
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="ec-av-picker">
      <div
        ref={pager}
        className="ec-av-pager"
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {PAGES.map((avatars, index) => (
          <div key={index} className="ec-av-grid">
            {avatars.map((avatar) => {
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
        ))}
      </div>
      {PAGES.length > 1 && (
        <div className="ec-av-dots">
          {PAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === page ? "on" : undefined}
              onClick={() => goTo(index)}
              aria-label={`${index + 1} / ${PAGES.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
