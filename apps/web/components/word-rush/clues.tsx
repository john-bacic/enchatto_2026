"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthedMutation } from "@/lib/convex";
import { Chatto } from "@/components/ui/chatto";
import { Icon } from "@/components/ui/icon";
import {
  Lockins,
  SpectatorScores,
  Timer,
  answerSizeClass,
  errorText,
  haptic,
  sfx,
  unlockAudio,
  type MyAnswer,
  type ViewProps,
} from "./shared";

const TAG_COLORS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--mint-soft)", "var(--blue-soft)"];
const LETTERS = ["A", "B", "C", "D"];

export function streakMultiplier(streak: number) {
  return streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
}

export function CluesView({
  state,
  me,
  myId,
  learning,
  s,
  now,
  toast,
  myAnswer,
  hint,
  onAnswered,
  onHint,
}: ViewProps & {
  myAnswer: MyAnswer | null;
  hint: string | null;
  onAnswered: (a: MyAnswer) => void;
  onHint: (h: string) => void;
}) {
  const answer = useAuthedMutation(api.wordRush.answer);
  const takeHint = useAuthedMutation(api.wordRush.takeHint);
  const [pending, setPending] = useState<number | null>(null);
  const [hintBusy, setHintBusy] = useState(false);

  const card = state.card;
  const elapsed = Math.max(0, now - state.phaseStartedAt);
  const step = state.emojiStepMs;
  const shown = elapsed >= step * 2 ? 3 : elapsed >= step ? 2 : 1;
  const answeredIds = new Set(state.answers.map((a) => a.participantId));
  const serverSaysAnswered = answeredIds.has(myId);
  const locked = !!myAnswer || serverSaysAnswered || pending !== null;
  const lockedIndex = myAnswer?.choiceIndex ?? pending;
  const spectator = !me;

  const base = shown === 1 ? 300 : shown === 2 ? 200 : 100;
  const live = hint ? Math.max(50, base - 100) : base;
  const nextStreak = (me?.streak ?? 0) + 1;
  const mult = streakMultiplier(nextStreak);

  const secsLeft = Math.ceil(Math.max(0, state.phaseEndsAt - now) / 1000);
  const prevShown = useRef(shown);
  useEffect(() => {
    if (shown > prevShown.current) sfx("pop");
    prevShown.current = shown;
  }, [shown]);
  const prevSecs = useRef(secsLeft);
  useEffect(() => {
    if (secsLeft !== prevSecs.current && secsLeft > 0 && secsLeft <= 3 && !locked && !spectator) sfx("tick");
    prevSecs.current = secsLeft;
  }, [secsLeft, locked, spectator]);

  if (!card) return null;

  const pick = async (i: number) => {
    if (locked || spectator) return;
    unlockAudio();
    haptic("tap");
    setPending(i);
    try {
      const res = await answer({ gameId: state._id, participantId: myId, choiceIndex: i });
      onAnswered({ choiceIndex: i, correct: res.correct, points: res.points });
    } catch (e) {
      setPending(null);
      toast(errorText(e, s.error));
    }
  };

  const askHint = async () => {
    if (hint || hintBusy || locked || spectator) return;
    unlockAudio();
    setHintBusy(true);
    try {
      onHint(await takeHint({ gameId: state._id, participantId: myId }));
    } catch (e) {
      toast(errorText(e, s.error));
    } finally {
      setHintBusy(false);
    }
  };

  const choices =
    learning === "en"
      ? card.choicesEn.map((c) => ({ main: c, kana: "", romaji: "" }))
      : card.choicesJa.map((c) => ({ main: c.ja, kana: c.kana !== c.ja ? c.kana : "", romaji: c.romaji }));

  const mascotLine = spectator ? s.mascotSpectate : locked ? s.mascotLocked : shown < 3 ? s.mascotEarly : s.mascotAll;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Timer state={state} now={now} />
        <Lockins
          players={state.players}
          doneIds={answeredIds}
          label={answeredIds.size > 0 ? s.inCount(answeredIds.size, state.players.length) : undefined}
          size={state.players.length > 5 ? 30 : 38}
        />
        {me && me.streak >= 2 ? (
          <div className="wr-streak">
            <Icon name="g-bolt" size={26} />
            <b>{s.streak(me.streak)}</b>
            {mult > 1 && <small>×{mult}</small>}
          </div>
        ) : me ? (
          <div className="wr-myscore" style={{ marginLeft: "auto" }}>
            <small>{s.score}</small>
            <b>{me.score.toLocaleString()}</b>
          </div>
        ) : null}
      </div>

      {!spectator && (
        <div className="wr-pts">
          <div>
            <small>{s.fasterMore}</small>
            <b key={live} className="drop">
              +{Math.round(live * mult)}
            </b>
          </div>
          <div className="steps">
            {[0, 1, 2].map((i) => (
              <i key={i} className={i < shown - 1 ? "gone" : ""} />
            ))}
          </div>
        </div>
      )}

      <div className="wr-ask">{learning === "en" ? s.askEn : s.askJa}</div>

      <div className="wr-clues">
        {[0, 1, 2].map((i) =>
          i < shown ? (
            <div key={`e${i}`} className="wr-clue in" style={{ "--r": `${[-6, 4, -3][i]}deg` } as React.CSSProperties}>
              {card.emoji[i]}
            </div>
          ) : (
            <div key={`x${i}`} className="wr-clue empty" style={{ "--r": `${[-6, 4, -3][i]}deg` } as React.CSSProperties}>
              ?
            </div>
          )
        )}
      </div>

      {!spectator &&
        (hint ? (
          <div className="wr-hint shown">
            <Icon name="g-bulb" size={22} />
            <span>{hint}</span>
          </div>
        ) : (
          <button
            type="button"
            className={`wr-hint${locked ? " locked" : ""}`}
            onClick={askHint}
            disabled={locked || hintBusy}
          >
            <Icon name="g-bulb" size={22} />
            {s.hint} <b>−100</b>
          </button>
        ))}

      <div className="wr-mascot-row">
        <Chatto size={58} />
        <div className="ec-say" key={mascotLine}>
          {mascotLine}
        </div>
      </div>

      {spectator ? (
        <div style={{ marginTop: "auto" }}>
          <SpectatorScores state={state} s={s} />
        </div>
      ) : (
        <div className="wr-answers">
          {choices.map((c, i) => {
            const isLocked = locked && lockedIndex === i;
            return (
              <button
                key={i}
                type="button"
                className={`wr-ans${isLocked ? " locked" : locked ? " dim" : ""}${answerSizeClass(c.main)}`}
                style={{ "--c": TAG_COLORS[i], "--lock-label": `"${s.lockedIn}"` } as React.CSSProperties}
                disabled={locked}
                onClick={() => pick(i)}
              >
                <span className="tag">{LETTERS[i]}</span>
                {c.kana && <span className="kana">{c.kana}</span>}
                {c.main}
                {c.romaji && <small>{c.romaji}</small>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
