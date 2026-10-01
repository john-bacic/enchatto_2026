"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AvatarDisc } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { streakMultiplier } from "./clues";
import { answerSizeClass, errorText, haptic, sfx, speak, type ViewProps } from "./shared";

const RESULT_MS = 1700;
const TAG_COLORS = ["var(--pink-soft)", "var(--yellow-soft)", "var(--mint-soft)", "var(--blue-soft)"];
const LETTERS = ["A", "B", "C", "D"];

function Highlight({ text, word }: { text: string; word: string }) {
  const at = word ? text.toLowerCase().indexOf(word.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + word.length)}</mark>
      {text.slice(at + word.length)}
    </>
  );
}

export function RevealView({ state, me, myId, learning, s, now, isHost, toast }: ViewProps) {
  const skip = useMutation(api.wordRush.skip);
  const card = state.card;
  const reveal = card?.reveal;
  const elapsed = now - state.phaseStartedAt;
  const [lateJoin] = useState(() => elapsed > RESULT_MS);
  const showCard = lateJoin || elapsed > RESULT_MS;
  const mine = state.answers.find((a) => a.participantId === myId) ?? null;
  const played = useRef(false);

  useEffect(() => {
    if (played.current || lateJoin || !me) return;
    played.current = true;
    if (mine?.correct) {
      sfx("correct");
      haptic("correct");
    } else {
      sfx("wrong");
      haptic("wrong");
    }
  }, [lateJoin, me, mine?.correct]);

  if (!card || !reveal) return null;

  const correctIndex = learning === "en" ? reveal.correctEnIndex : reveal.correctJaIndex;
  const target = learning === "en" ? reveal.en : reveal.ja.ja;
  const meaning = learning === "en" ? reveal.ja.ja : reveal.en;
  const hook = learning === "en" ? reveal.hookJa : reveal.hookEn;
  const pos = learning === "en" ? reveal.posJa : reveal.posEn;
  const sayItNext = state.sayIt && state.cardIndex % 2 === 1 && state.players.length >= 2;
  const secsLeft = Math.ceil(Math.max(0, state.phaseEndsAt - now) / 1000);
  const topPoints = Math.max(0, ...state.answers.map((a) => a.points ?? 0));

  const hear = () => {
    speak(target, learning);
  };

  if (!showCard && me) {
    const choices =
      learning === "en"
        ? card.choicesEn.map((c) => ({ main: c, romaji: "" }))
        : card.choicesJa.map((c) => ({ main: c.ja, romaji: c.romaji }));
    const mult = mine?.correct ? streakMultiplier(me.streak) : 1;
    return (
      <>
        <div className="wr-ask" style={{ marginTop: 10 }}>
          {learning === "en" ? s.askEn : s.askJa}
        </div>
        <div className="wr-clues">
          {card.emoji.map((e, i) => (
            <div key={i} className="wr-clue" style={{ "--r": `${[-6, 4, -3][i]}deg` } as React.CSSProperties}>
              {e}
            </div>
          ))}
        </div>
        <div className={`wr-floater${mine?.correct ? "" : " miss"}`}>
          {mine?.correct ? `+${mine.points ?? 0}!` : mine ? s.missed : s.tooSlow}
          {mult > 1 && <small>STREAK ×{mult}</small>}
        </div>
        <div className="wr-answers">
          {choices.map((c, i) => {
            const cls = i === correctIndex ? " right" : mine?.choiceIndex === i ? " wrong" : " dim";
            return (
              <div key={i} className={`wr-ans${cls}${answerSizeClass(c.main)}`} style={{ "--c": TAG_COLORS[i] } as React.CSSProperties}>
                <span className="tag">{LETTERS[i]}</span>
                {c.main}
                {c.romaji && <small>{c.romaji}</small>}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ec-card wr-word-card" style={{ marginTop: 8 }}>
        {mine?.correct && (
          <div className="ec-stamp" style={{ whiteSpace: "pre-line" }}>
            {s.gotIt}
          </div>
        )}
        <div className="wr-pos">
          <span>{pos}</span>
          {learning === "en" ? reveal.ipa : `${reveal.ja.kana} · ${reveal.ja.romaji}`}
        </div>
        <div className={`wr-big-word${target.length > 12 ? " sm" : target.length > 8 ? " md" : ""}`}>{target}</div>
        <div className="wr-meaning">{meaning}</div>
        <div className="wr-trio">
          {card.emoji.map((e, i) => (
            <span key={i} style={{ "--d": `${-i * 0.2}s` } as React.CSSProperties}>
              {e}
            </span>
          ))}
        </div>
        {hook && (
          <div className="wr-hook">
            <Icon name="g-bulb" size={24} />
            {hook}
          </div>
        )}
        {(reveal.exampleEn || reveal.exampleJa) && (
          <div className="wr-example">
            {learning === "en" ? (
              <>
                <Highlight text={reveal.exampleEn} word={reveal.en} />
                <small>{reveal.exampleJa}</small>
              </>
            ) : (
              <>
                <Highlight text={reveal.exampleJa} word={reveal.ja.ja} />
                <small>{reveal.exampleEn}</small>
              </>
            )}
          </div>
        )}
      </div>

      <div className="wr-got">
        {state.players.map((p, i) => {
          const a = state.answers.find((x) => x.participantId === p.participantId);
          const ok = !!a?.correct;
          return (
            <div key={p.participantId} className={`p${ok ? "" : " miss"}`} style={{ "--d": `${0.15 + i * 0.08}s` } as React.CSSProperties}>
              <AvatarDisc id={p.avatarValue} size={46} />
              <b>{ok ? `+${a?.points ?? 0}` : s.miss}</b>
              {ok && topPoints > 0 && a?.points === topPoints && <img className="bolt" src="/icons/g-bolt.png" alt="" />}
              {p.participantId === myId && <span className="me">{s.you}</span>}
            </div>
          );
        })}
      </div>

      <div className="wr-action-row">
        <button type="button" className="ec-round-btn" onClick={hear} aria-label={s.speak}>
          <Icon name="g-ear" size={38} />
        </button>
        {isHost ? (
          <button
            type="button"
            className="ec-btn pink wiggle"
            style={{ flex: 1, minHeight: 64, fontSize: 17, whiteSpace: "nowrap" }}
            onClick={() =>
              skip({ gameId: state._id, participantId: myId, phaseSeq: state.phaseSeq }).catch((e) => toast(errorText(e, s.error)))
            }
          >
            {sayItNext ? `${s.sayItNext} ➜` : s.nextWord}
          </button>
        ) : (
          <div className={`wr-next-hint${sayItNext ? " sayit" : ""}`}>
            {sayItNext ? s.sayItNext : s.nextIn(secsLeft)}
          </div>
        )}
      </div>
    </>
  );
}
