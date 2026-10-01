"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { Chatto } from "@/components/ui/chatto";
import { Icon } from "@/components/ui/icon";

type GameTab = "word-rush" | "lost-in-translation" | "emoji-bingo" | "emoji-match" | "truth-or-dare";

interface GamePickerModalProps {
  isOpen: boolean;
  isHost: boolean;
  playerCount: number;
  hostName?: string;
  nextLevel?: number;
  onStartGame: (gameType: string, level: number, timerSeconds: number) => void;
  onStartWordRush?: (opts: { pack: string; sayIt: boolean }) => void;
  onStartEmojiMatch?: () => void;
  onStartEmojiBingo?: () => void;
  onStartTruthOrDare?: (mode: "normal" | "deep") => void;
  onRequestGame: (message: string) => void;
  onClose: () => void;
  lang?: string;
}

const COPY = {
  en: {
    pick: "PICK A GAME!",
    wordRush: "Word Rush",
    wordRushSub: "Guess the word from 3 emoji. Learn it. Say it!",
    wordRushDesc:
      "3 emoji drop in — race to pick the word. Faster = more points! Japanese speakers learn English, English speakers learn Japanese.",
    litSub: "draw & guess",
    bingoSub: "roll & stamp",
    matchSub: "flip the pairs",
    todSub: "brave or honest?",
    pack: "Word pack",
    sayIt: "Say it!",
    sayItDesc: "Take turns saying the word — the room judges your accent",
    startWordRush: "START WORD RUSH!",
    askWordRush: 'can we play "Word Rush"? 🌸',
    timer: "Timer",
    mode: "Mode",
    close: "Close",
    isNew: "NEW!",
  },
  ja: {
    pick: "ゲームをえらぼう！",
    wordRush: "ワードラッシュ",
    wordRushSub: "3つの絵文字で単語を当てよう。覚えて、言ってみよう！",
    wordRushDesc:
      "絵文字が3つ落ちてくる！いち早く単語を当てよう。早いほど高得点！日本語話者は英語を、英語話者は日本語を学べる。",
    litSub: "描いて当てる",
    bingoSub: "回してスタンプ",
    matchSub: "ペアをめくろう",
    todSub: "勇気？正直？",
    pack: "単語パック",
    sayIt: "言ってみよう！",
    sayItDesc: "順番に単語を発音 — みんながアクセントを審査！",
    startWordRush: "ワードラッシュ開始！",
    askWordRush: "「ワードラッシュ」やりませんか？🌸",
    timer: "タイマー",
    mode: "モード",
    close: "閉じる",
    isNew: "NEW!",
  },
};

const PACKS: { id: string; icon: string; en: string; ja: string }[] = [
  { id: "mix", icon: "ui-sparkle", en: "Mix", ja: "ミックス" },
  { id: "foodie", icon: "o-cake", en: "Foodie", ja: "グルメ" },
  { id: "travel", icon: "o-train", en: "Travel", ja: "旅行" },
  { id: "slang", icon: "re-laugh", en: "Slang", ja: "スラング" },
  { id: "anime", icon: "o-shootingstar", en: "Anime", ja: "アニメ" },
  { id: "feelings", icon: "re-heart", en: "Feelings", ja: "気持ち" },
  { id: "chat", icon: "ui-chat", en: "From this chat", ja: "このチャットから" },
];

const TILES: { id: GameTab; icon: string; color: string }[] = [
  { id: "word-rush", icon: "o-flower", color: "var(--yellow)" },
  { id: "lost-in-translation", icon: "g-pencil", color: "var(--blue-soft)" },
  { id: "emoji-bingo", icon: "g-clover", color: "var(--mint-soft)" },
  { id: "emoji-match", icon: "o-cherry", color: "var(--violet-soft)" },
  { id: "truth-or-dare", icon: "g-question", color: "var(--pink-soft)" },
];

const MIN_PLAYERS: Record<GameTab, number> = {
  "word-rush": 2,
  "lost-in-translation": 2,
  "emoji-bingo": 1,
  "emoji-match": 1,
  "truth-or-dare": 2,
};

const chipStyle = (on: boolean, extra?: React.CSSProperties): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 11px",
  border: "2.5px solid var(--ink)",
  borderRadius: 999,
  background: on ? "var(--yellow)" : "#fff",
  boxShadow: on ? "0 3px 0 var(--ink)" : "none",
  transform: on ? "translateY(-2px)" : "none",
  fontSize: 12.5,
  fontWeight: 900,
  transition: "transform 0.12s, box-shadow 0.12s, background 0.12s",
  ...extra,
});

export function GamePickerModal({
  isOpen,
  isHost,
  playerCount,
  hostName,
  nextLevel = 1,
  onStartGame,
  onStartWordRush,
  onStartEmojiMatch,
  onStartEmojiBingo,
  onStartTruthOrDare,
  onRequestGame,
  onClose,
  lang,
}: GamePickerModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [selectedGame, setSelectedGame] = useState<GameTab>("word-rush");
  const [todMode, setTodMode] = useState<"normal" | "deep">("normal");
  const [pack, setPack] = useState("mix");
  const [sayIt, setSayIt] = useState(true);

  if (!isOpen) return null;

  const c = lang === "ja" ? COPY.ja : COPY.en;

  const names: Record<GameTab, string> = {
    "word-rush": c.wordRush,
    "lost-in-translation": t("Lost in Translation", lang),
    "emoji-bingo": t("Emoji Bingo", lang),
    "emoji-match": t("Emoji Match", lang),
    "truth-or-dare": t("Truth or Dare", lang),
  };
  const subs: Record<GameTab, string> = {
    "word-rush": c.wordRushSub,
    "lost-in-translation": c.litSub,
    "emoji-bingo": c.bingoSub,
    "emoji-match": c.matchSub,
    "truth-or-dare": c.todSub,
  };
  const askMessages: Record<GameTab, string> = {
    "word-rush": c.askWordRush,
    "lost-in-translation": t("can we play \"Lost in Translation\"? 🎮", lang),
    "emoji-bingo": t("can we play \"Emoji Bingo\"? 🎰", lang),
    "emoji-match": t("can we play \"Emoji Match\"? 🃏", lang),
    "truth-or-dare": t("can we play \"Truth or Dare\"? 🎲", lang),
  };

  const notEnough = playerCount < MIN_PLAYERS[selectedGame];

  const handleStart = () => {
    switch (selectedGame) {
      case "word-rush":
        onStartWordRush?.({ pack, sayIt });
        break;
      case "lost-in-translation":
        onStartGame("lost-in-translation", nextLevel, timerSeconds);
        break;
      case "emoji-bingo":
        onStartEmojiBingo?.();
        break;
      case "emoji-match":
        onStartEmojiMatch?.();
        break;
      case "truth-or-dare":
        onStartTruthOrDare?.(todMode);
        break;
    }
  };

  const startLabel =
    selectedGame === "word-rush"
      ? c.startWordRush
      : selectedGame === "lost-in-translation" && nextLevel > 1
      ? `${t("Level", lang)} ${nextLevel}`
      : t("Start Game", lang);

  const metaRow = (right?: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        width: "100%",
        marginTop: 10,
        fontSize: 11.5,
        fontWeight: 900,
        opacity: 0.6,
      }}
    >
      <span>
        {playerCount} {t("players", lang)}
      </span>
      {right && <span>{right}</span>}
    </div>
  );

  const desc = (text: string) => (
    <p style={{ width: "100%", marginTop: 8, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, opacity: 0.8 }}>{text}</p>
  );

  const howItWorks = (steps: string[]) => (
    <div
      style={{
        width: "100%",
        marginTop: 8,
        padding: "8px 10px",
        border: "2px dashed var(--ink)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.7)",
        fontSize: 11.5,
        fontWeight: 900,
        lineHeight: 1.5,
      }}
    >
      <div className="ec-chunky" style={{ fontSize: 12, marginBottom: 2 }}>
        {t("How it works", lang)}
      </div>
      {steps.map((s, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: "var(--pink)" }}> → </span>}
          {s}
        </span>
      ))}
    </div>
  );

  const optionLabel = (text: string) => (
    <div className="ec-chunky" style={{ width: "100%", marginTop: 10, marginBottom: 6, fontSize: 12.5 }}>
      {text}
    </div>
  );

  const renderDetails = () => {
    switch (selectedGame) {
      case "word-rush":
        return (
          <>
            {desc(c.wordRushDesc)}
            {isHost && (
              <>
                {optionLabel(c.pack)}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: "100%" }}>
                  {PACKS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPack(p.id)}
                      style={chipStyle(
                        pack === p.id,
                        p.id === "chat" && pack !== p.id
                          ? { background: "var(--mint-soft)", borderStyle: "dashed" }
                          : undefined
                      )}
                    >
                      <Icon name={p.icon} size={18} />
                      {lang === "ja" ? p.ja : p.en}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSayIt((v) => !v)}
                  aria-pressed={sayIt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    marginTop: 10,
                    padding: "8px 10px",
                    border: "2.5px solid var(--ink)",
                    borderRadius: 14,
                    background: "#fff",
                    textAlign: "left",
                  }}
                >
                  <Icon name="g-ear" size={30} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="ec-chunky" style={{ display: "block", fontSize: 14 }}>
                      {c.sayIt}
                    </span>
                    <span style={{ display: "block", fontSize: 11, fontWeight: 900, opacity: 0.6, lineHeight: 1.3 }}>
                      {c.sayItDesc}
                    </span>
                  </span>
                  <span
                    style={{
                      position: "relative",
                      flex: "none",
                      width: 50,
                      height: 30,
                      border: "2.5px solid var(--ink)",
                      borderRadius: 999,
                      background: sayIt ? "var(--mint)" : "#eceaf3",
                      transition: "background 0.15s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: sayIt ? 22 : 2,
                        width: 21,
                        height: 21,
                        border: "2.5px solid var(--ink)",
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left 0.18s cubic-bezier(0.3, 1.6, 0.5, 1)",
                      }}
                    />
                  </span>
                </button>
              </>
            )}
            <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 8, fontSize: 11.5, fontWeight: 900 }}>
              {["日本語の人 → ", "English speakers → "].map((who, i) => (
                <span
                  key={who}
                  style={{
                    flex: 1,
                    padding: "5px 6px",
                    border: "2px solid var(--ink)",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.75)",
                    textAlign: "center",
                  }}
                >
                  {who}
                  <b>{i === 0 ? "English" : "日本語"}</b>
                </span>
              ))}
            </div>
            {metaRow()}
          </>
        );
      case "lost-in-translation":
        return (
          <>
            {desc(t("A drawing guessing game: one player draws, everyone else picks from 4 choices. 10 rounds, rotating drawer!", lang))}
            {isHost && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    marginTop: 10,
                    padding: "8px 12px",
                    border: "2.5px solid var(--ink)",
                    borderRadius: 14,
                    background: "#fff",
                  }}
                >
                  <span
                    className="ec-chunky"
                    style={{
                      padding: "2px 10px",
                      border: "2.5px solid var(--ink)",
                      borderRadius: 10,
                      background: "var(--violet-soft)",
                      fontSize: 14,
                    }}
                  >
                    {t("Level", lang)} {nextLevel}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>
                    {nextLevel === 1
                      ? t("1 word with hint", lang)
                      : nextLevel === 2
                      ? t("2 words", lang)
                      : `${Math.min(nextLevel, 4)}+ ${t("words", lang)}`}
                    {" · "}
                    {t("10 rounds", lang)}
                  </span>
                </div>
                {optionLabel(c.timer)}
                <div style={{ display: "flex", gap: 6, width: "100%" }}>
                  {[10, 20, 30, 0].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setTimerSeconds(sec)}
                      style={chipStyle(timerSeconds === sec, { flex: 1, justifyContent: "center" })}
                    >
                      {sec === 0 ? t("Off", lang) : `${sec}s`}
                    </button>
                  ))}
                </div>
              </>
            )}
            {metaRow()}
          </>
        );
      case "emoji-bingo":
        return (
          <>
            {desc(t("Mark emojis on your card as they're called. First to complete the pattern wins!", lang))}
            {howItWorks([
              t("Emojis are called automatically", lang),
              t("Tap matching emojis on your card", lang),
              t("Complete the pattern and hit BINGO!", lang),
            ])}
            {metaRow(`~3–5 ${t("min", lang)}`)}
          </>
        );
      case "emoji-match":
        return (
          <>
            {desc(t("Find matching emoji pairs! Take turns flipping cards.", lang))}
            {howItWorks([
              t("Flip two cards per turn", lang),
              t("Match a pair to score", lang),
              t("Most matches wins!", lang),
            ])}
            {metaRow(t("Works solo or multiplayer", lang))}
          </>
        );
      case "truth-or-dare":
        return (
          <>
            {desc(t("A social game: answer a question or complete a challenge! Take turns with your group.", lang))}
            {isHost && (
              <>
                {optionLabel(c.mode)}
                <div style={{ display: "flex", gap: 6, width: "100%" }}>
                  {(["normal", "deep"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTodMode(mode)}
                      style={chipStyle(todMode === mode, {
                        flex: 1,
                        justifyContent: "center",
                        background: todMode === mode ? "var(--ink)" : "#fff",
                        color: todMode === mode ? "var(--yellow)" : "var(--ink)",
                      })}
                    >
                      {mode === "normal" ? (
                        t("Normal", lang)
                      ) : (
                        <>
                          {t("Deep", lang)}
                          <Icon name="o-whale" size={18} />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
            {metaRow(t("Rotates through all players", lang))}
          </>
        );
    }
  };

  return (
    <div className="ec-sheet-backdrop" onClick={onClose}>
      <div
        className="ec-sheet"
        style={{ padding: "12px 16px calc(22px + env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 54, height: 6, margin: "0 auto 8px", borderRadius: 3, background: "var(--line-soft)" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14, padding: "0 44px" }}>
          <Chatto size={44} wave={false} />
          <h2
            className="ec-chunky"
            style={{ fontSize: lang === "ja" ? 20 : 23, textShadow: "0 3px 0 var(--yellow)", whiteSpace: "nowrap" }}
          >
            {c.pick}
          </h2>
          <button
            className="ec-round-btn"
            onClick={onClose}
            aria-label={c.close}
            style={{ position: "absolute", right: 0, top: "50%", marginTop: -20, width: 38, height: 38, fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {TILES.map((tile) => {
            const sel = tile.id === selectedGame;
            return (
              <div
                key={tile.id}
                role="button"
                tabIndex={0}
                aria-pressed={sel}
                onClick={() => setSelectedGame(tile.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedGame(tile.id);
                }}
                style={{
                  position: "relative",
                  order: sel ? -1 : 0,
                  gridColumn: sel ? "1 / -1" : undefined,
                  display: "flex",
                  flexWrap: sel ? "wrap" : "nowrap",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 62,
                  padding: sel ? "10px 12px 12px 8px" : "6px 10px 6px 6px",
                  border: "3px solid var(--ink)",
                  borderRadius: 18,
                  background: tile.color,
                  boxShadow: sel ? "0 7px 0 var(--ink), 0 0 0 4px var(--pink)" : "0 5px 0 var(--ink)",
                  transform: sel ? "rotate(-1deg)" : "none",
                  cursor: sel ? "default" : "pointer",
                  animation: sel ? "ec-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1)" : undefined,
                  textAlign: "left",
                }}
              >
                {tile.id === "word-rush" && (
                  <span
                    className="ec-chunky"
                    style={{
                      position: "absolute",
                      right: -8,
                      top: -12,
                      padding: "2px 9px",
                      border: "2.5px solid var(--ink)",
                      borderRadius: 8,
                      background: "var(--red)",
                      color: "#fff",
                      fontSize: 12,
                      transform: "rotate(10deg)",
                      animation: "ec-kick 0.6s ease-in-out 3",
                    }}
                  >
                    {c.isNew}
                  </span>
                )}
                <Icon name={tile.icon} size={sel ? 48 : 42} style={{ flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ec-chunky" style={{ fontSize: sel ? 16 : 13.5, lineHeight: 1.1 }}>
                    {names[tile.id]}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 10.5, fontWeight: 900, opacity: 0.65, lineHeight: 1.2 }}>
                    {subs[tile.id]}
                  </div>
                </div>
                {sel && renderDetails()}
              </div>
            );
          })}
        </div>

        {!isHost && (
          <p style={{ marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: 900, opacity: 0.6 }}>
            {t("Only the host can start a game.", lang)}
          </p>
        )}
        {isHost && notEnough && (
          <p style={{ marginTop: 14, textAlign: "center", fontSize: 13, fontWeight: 900, color: "var(--red)" }}>
            {t("Need at least 2 players to start.", lang)}
          </p>
        )}

        {isHost ? (
          <button
            className={`ec-btn pink${notEnough ? "" : " wiggle"}`}
            style={{ marginTop: 14, minHeight: 64, fontSize: lang === "ja" ? 20 : 22 }}
            onClick={handleStart}
            disabled={notEnough}
          >
            {startLabel}
          </button>
        ) : (
          <button
            className="ec-btn pink wiggle"
            style={{ marginTop: 10, minHeight: 64, fontSize: 22 }}
            onClick={() => {
              onRequestGame(`${hostName} ${askMessages[selectedGame]}`);
              onClose();
            }}
          >
            <Icon name="ui-game" size={30} />
            {t("Ask to play!", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
