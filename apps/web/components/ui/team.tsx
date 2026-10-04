"use client";

import { TEAM_LOOK, teamTitle, type TeamIndex } from "@/lib/game-teams";
import { t } from "@/lib/i18n";

/** A round dot in the team's colour, ink-outlined so it shows on any fill. The team's name is printed next to it */
export function TeamDot({ team, size = 12 }: { team: TeamIndex; size?: number }) {
  return (
    <i
      aria-hidden
      style={{
        display: "inline-block",
        flex: "none",
        width: size,
        height: size,
        border: "2px solid var(--ink)",
        borderRadius: "50%",
        background: TEAM_LOOK[team].color,
      }}
    />
  );
}

/** The team's name on its colour, as a pill */
export function TeamChip({ team, lang, fontSize = 12 }: { team: TeamIndex; lang?: string; fontSize?: number }) {
  return (
    <span
      className="ec-chunky"
      style={{
        display: "inline-block",
        maxWidth: "100%",
        padding: "1px 10px 2px",
        border: "2.5px solid var(--ink)",
        borderRadius: 999,
        background: TEAM_LOOK[team].color,
        fontSize,
        lineHeight: 1.35,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {teamTitle(team, lang)}
    </span>
  );
}

/**
 * The sticker on the viewer's own team, wherever teams are drawn. It sits on the top edge of its nearest
 * positioned ancestor, so that one needs `position: relative` and a little room above.
 */
export function YourTeamTag({ lang, style }: { lang?: string; style?: React.CSSProperties }) {
  return (
    <span
      className="ec-chunky"
      style={{
        position: "absolute",
        left: 8,
        top: -12,
        zIndex: 1,
        padding: "0 6px",
        border: "2px solid var(--ink)",
        borderRadius: 7,
        background: "var(--ink)",
        color: "var(--yellow)",
        fontSize: 9.5,
        lineHeight: "13px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        // Tilted with `rotate`, not `transform`: ec-pop ends on a transform and would straighten it
        rotate: "-3deg",
        animation: "ec-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) both",
        ...style,
      }}
    >
      {t("YOUR TEAM", lang)}
    </span>
  );
}
