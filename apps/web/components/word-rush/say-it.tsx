"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AvatarDisc } from "@/components/ui/avatar";
import { Confetti, CutIn } from "@/components/ui/effects";
import { Icon } from "@/components/ui/icon";
import { useAudioRecorder, type AudioRecorder } from "@/hooks/use-audio-recorder";
import {
  ClipPlayer,
  Lockins,
  MicGlyph,
  Stage,
  Timer,
  VOTE_META,
  errorText,
  fmtSecs,
  haptic,
  isNativeFor,
  sfx,
  speak,
  textUnits,
  unlockAudio,
  uploadClip,
  type ViewProps,
  type WRVote,
} from "./shared";

const HOLD_MS = 450;

function WordLine({ word, kana, romaji, lang, s }: { word: string; kana: string; romaji: string; lang: "en" | "ja"; s: ViewProps["s"] }) {
  return (
    <>
      <div className="wr-word-mini">
        <b style={{ fontSize: Math.max(20, Math.min(34, Math.floor(280 / Math.max(1, textUnits(word))))) }}>{word}</b>
        <button type="button" className="ec-round-btn" onClick={() => speak(word, lang)} aria-label={s.speak}>
          <Icon name="g-ear" size={28} />
        </button>
      </div>
      {lang === "ja" && (kana || romaji) && (
        <div className="wr-reading">
          {kana && kana !== word && <span>{kana}</span>}
          {romaji && <span className="romaji">{romaji}</span>}
        </div>
      )}
    </>
  );
}

/** Press-and-hold or tap-to-toggle mic button with a live level ring. */
function MicButton({ rec, onHoldChange }: { rec: AudioRecorder; onHoldChange: (holding: boolean) => void }) {
  const downAt = useRef(0);
  const wasRecording = useRef(false);
  const recording = rec.status === "recording";
  const p = recording ? Math.min(100, (rec.elapsedMs / rec.maxMs) * 100) : 0;

  const release = () => {
    onHoldChange(false);
    if (wasRecording.current) return;
    if (Date.now() - downAt.current >= HOLD_MS) rec.stop();
  };

  return (
    <button
      type="button"
      className={`wr-mic${recording ? " rec" : ""}`}
      disabled={rec.status === "requesting"}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        unlockAudio();
        wasRecording.current = recording;
        if (recording) {
          rec.stop();
          return;
        }
        downAt.current = Date.now();
        haptic("tap");
        onHoldChange(true);
        void rec.start();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      aria-label="Record"
    >
      <span className="ring" />
      <span className="ring b" />
      {recording && (
        <>
          <span className="level" style={{ transform: `scale(${1 + rec.level * 0.35})` }} />
          <span className="prog" style={{ "--p": `${p}%` } as React.CSSProperties} />
        </>
      )}
      <MicGlyph size={44} />
    </button>
  );
}

function LiveWave({ level, active }: { level: number; active: boolean }) {
  const hist = useRef<number[]>(Array(24).fill(0));
  useEffect(() => {
    if (!active) return;
    hist.current = [...hist.current.slice(1), level];
  }, [level, active]);
  return (
    <div className="wr-wave" aria-hidden>
      {hist.current.map((v, i) => (
        <i key={i} style={{ height: `${Math.max(8, Math.min(100, v * 110))}%`, opacity: active ? 1 : 0.35 }} />
      ))}
    </div>
  );
}

function micErrorText(rec: AudioRecorder, s: ViewProps["s"]) {
  return rec.error === "denied" ? s.micDenied : rec.error === "unsupported" ? s.micUnsupported : s.micFailed;
}

// ─── Mic ─────────────────────────────────────────────────────────────────────

export function MicView(props: ViewProps) {
  const { state, myId } = props;
  if (!state.performer) return null;
  return state.performer.participantId === myId ? <PerformerMic {...props} /> : <WaitingMic {...props} />;
}

function JudgesCard({ state, s, myId }: Pick<ViewProps, "state" | "s" | "myId">) {
  const perf = state.performer;
  const judges = state.players.filter((p) => p.participantId !== perf?.participantId);
  if (!perf || judges.length === 0) return null;
  return (
    <div className="ec-card" style={{ padding: "10px 12px 14px", borderRadius: 20, marginTop: "auto" }}>
      <div className="ec-label" style={{ justifyContent: "center", marginBottom: 14 }}>
        {s.judgesLabel} <small>{s.judgesNote(perf.lang)}</small>
      </div>
      <div className="wr-judges">
        {judges.map((p) => (
          <div key={p.participantId} className="wr-judge">
            <AvatarDisc id={p.avatarValue} size={judges.length > 5 ? 38 : 50} />
            {p.participantId === myId ? s.you : p.nickname}
            {isNativeFor(p, perf.lang) && <span className="wr-nat">{s.nativeX2}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformerMic({ state, myId, s, now, toast }: ViewProps) {
  const perf = state.performer!;
  const me = state.players.find((p) => p.participantId === myId);
  const rec = useAudioRecorder({ maxMs: 4000 });
  const generateUrl = useMutation(api.wordRush.generateClipUploadUrl);
  const submitClip = useMutation(api.wordRush.submitClip);
  const skipMic = useMutation(api.wordRush.skipMic);
  const [sending, setSending] = useState(false);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    sfx("tada");
    haptic("correct");
  }, []);

  const send = async () => {
    if (!rec.blob || sending) return;
    setSending(true);
    try {
      const storageId = await uploadClip(rec.blob, () => generateUrl({}));
      await submitClip({ gameId: state._id, participantId: myId, storageId });
    } catch (e) {
      toast(errorText(e, s.error));
      setSending(false);
    }
  };

  const doSkip = () => skipMic({ gameId: state._id, participantId: myId }).catch((e) => toast(errorText(e, s.error)));
  const recording = rec.status === "recording";
  const secs = fmtSecs(rec.elapsedMs);

  return (
    <>
      <CutIn burstKey={state.phaseSeq}>
        <MicGlyph size={30} />
        {s.yourTurn}
      </CutIn>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -54 }}>
        <Timer state={state} now={now} size="sm" />
      </div>
      <Stage player={me} tag={s.onTheMic} live />
      <div className="wr-say-title">{s.sayItTitle}</div>
      <WordLine word={perf.word} kana={perf.kana} romaji={perf.romaji} lang={perf.lang} s={s} />

      {rec.status === "error" ? (
        <div className="ec-card" style={{ padding: 14, textAlign: "center", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 5px 0 var(--ink)" }}>
          <Icon name="g-no" size={44} style={{ alignSelf: "center" }} />
          <p style={{ fontSize: 13.5, fontWeight: 900, lineHeight: 1.45 }}>{micErrorText(rec, s)}</p>
          <div style={{ display: "flex", gap: 10 }}>
            {rec.error !== "unsupported" && (
              <button type="button" className="ec-btn white sm" onClick={() => rec.reset()}>
                {s.tryAgain}
              </button>
            )}
            <button type="button" className="ec-btn pink sm" onClick={doSkip}>
              {s.skip}
            </button>
          </div>
        </div>
      ) : rec.status === "recorded" && rec.url ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
          <ClipPlayer url={rec.url} color="var(--pink)" label={s.preview} s={s} />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="ec-btn white sm" style={{ flex: 1 }} onClick={() => rec.reset()} disabled={sending}>
              {s.retake}
            </button>
            <button type="button" className="ec-btn pink wiggle" style={{ flex: 1.6 }} onClick={send} disabled={sending}>
              {sending ? s.sending : s.send}
            </button>
          </div>
        </div>
      ) : (
        <>
          <MicButton rec={rec} onHoldChange={setHolding} />
          <LiveWave level={rec.level} active={recording} />
          <div className={`wr-rec-time${recording ? "" : " muted"}`}>
            {recording ? (holding ? s.recording(secs) : s.recordingTap(secs)) : s.holdOrTap}
          </div>
        </>
      )}

      {rec.status !== "error" && (
        <button
          type="button"
          className="ec-btn white sm"
          style={{ alignSelf: "center", width: "auto", padding: "0 22px" }}
          onClick={doSkip}
          disabled={sending}
        >
          {s.skip}
        </button>
      )}
      <JudgesCard state={state} s={s} myId={myId} />
    </>
  );
}

function WaitingMic({ state, me, myId, s, now }: ViewProps) {
  const perf = state.performer!;
  const performer = state.players.find((p) => p.participantId === perf.participantId);
  const native = isNativeFor(me, perf.lang);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -54 }}>
        <Timer state={state} now={now} size="sm" />
      </div>
      <Stage player={performer} tag={s.isOnMic(performer?.nickname ?? "?")} live />
      <WordLine word={perf.word} kana={perf.kana} romaji={perf.romaji} lang={perf.lang} s={s} />
      <div className="ec-card" style={{ padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxShadow: "0 5px 0 var(--ink)" }}>
        <div style={{ display: "flex", gap: 6, height: 44, alignItems: "center" }} aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              style={{
                width: 7,
                height: "100%",
                borderRadius: 5,
                border: "2px solid var(--ink)",
                background: ["var(--pink)", "var(--yellow)", "var(--mint)", "var(--blue)"][i % 4],
                animation: `wr-bar .7s ease-in-out ${-i * 0.11}s infinite alternate`,
              }}
            />
          ))}
        </div>
        <div style={{ fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ec-dots">
            <i />
            <i />
            <i />
          </span>
          {me ? s.getReady : s.listenIn}
        </div>
        {me && native && (
          <span className="wr-x2">
            <b>×2</b>
            {s.countsDouble}
          </span>
        )}
      </div>
      <JudgesCard state={state} s={s} myId={myId} />
    </>
  );
}

// ─── Judging ─────────────────────────────────────────────────────────────────

export function JudgingView({ state, me, myId, s, now, toast }: ViewProps) {
  const perf = state.performer;
  const vote = useMutation(api.wordRush.vote);
  const [myVote, setMyVote] = useState<WRVote | null>(null);
  if (!perf) return null;

  const performer = state.players.find((p) => p.participantId === perf.participantId);
  const name = performer?.nickname ?? "?";
  const isPerformer = perf.participantId === myId;
  const judges = state.players.filter((p) => p.participantId !== perf.participantId);
  const voted = new Set<string>(state.votedIds);
  if (myVote) voted.add(myId);
  const hasVoted = voted.has(myId);
  const native = isNativeFor(me, perf.lang);
  const canVote = !!me && !isPerformer && !hasVoted;

  const cast = async (v: WRVote) => {
    if (!canVote) return;
    unlockAudio();
    haptic("tap");
    sfx("pop");
    setMyVote(v);
    try {
      await vote({ gameId: state._id, participantId: myId, vote: v });
    } catch (e) {
      setMyVote(null);
      toast(errorText(e, s.error));
    }
  };

  const waitingFor = judges.filter((p) => !voted.has(p.participantId));
  const lockinLabel =
    waitingFor.length === 0 ? s.votedCount(judges.length, judges.length) : s.votedCount(judges.length - waitingFor.length, judges.length);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -54 }}>
        <Timer state={state} now={now} size="sm" />
      </div>
      <Stage player={performer} tag={s.saidIt(isPerformer ? s.you : name)} size={70} live />
      <div className="wr-word-mini">
        <b style={{ fontSize: Math.max(20, Math.min(34, Math.floor(330 / Math.max(1, textUnits(perf.word))))) }}>{perf.word}</b>
      </div>
      {perf.clipUrl ? (
        <ClipPlayer url={perf.clipUrl} autoPlay={!isPerformer} s={s} />
      ) : (
        <div className="wr-next-hint">{s.noClip}</div>
      )}

      {isPerformer || !me ? (
        <>
          <div style={{ textAlign: "center", fontFamily: "var(--chunky)", fontSize: 22, marginTop: 8 }}>{s.roomJudging}</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span className="ec-dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", fontFamily: "var(--chunky)", fontSize: 21 }}>{s.howDid(name)}</div>
          {native && (
            <span className="wr-x2">
              <b>×2</b>
              {s.countsDouble}
            </span>
          )}
          <div className="wr-jbtns">
            {(["huh", "close", "native"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`wr-jb${myVote === v ? " on" : hasVoted ? " off" : ""}`}
                style={{ "--c": VOTE_META[v].color } as React.CSSProperties}
                disabled={!canVote}
                onClick={() => cast(v)}
              >
                {myVote === v && native && <span className="x2">×2</span>}
                <Icon name={VOTE_META[v].icon} size={60} />
                {v === "huh" ? s.huh : v === "close" ? s.close : s.native}
                <small>{v === "huh" ? s.huhSub : v === "close" ? s.closeSub : s.nativeSub}</small>
              </button>
            ))}
          </div>
          {native && <TeachButton state={state} myId={myId} s={s} toast={toast} name={name} />}
        </>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: "auto", paddingTop: 6 }}>
        <Lockins players={judges} doneIds={voted} label={lockinLabel} size={judges.length > 6 ? 30 : 38} />
      </div>
    </>
  );
}

function TeachButton({
  state,
  myId,
  s,
  toast,
  name,
}: Pick<ViewProps, "state" | "myId" | "s" | "toast"> & { name: string }) {
  const rec = useAudioRecorder({ maxMs: 4000 });
  const generateUrl = useMutation(api.wordRush.generateClipUploadUrl);
  const submitTeachClip = useMutation(api.wordRush.submitTeachClip);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");

  const send = async () => {
    if (!rec.blob) return;
    setPhase("sending");
    try {
      const storageId = await uploadClip(rec.blob, () => generateUrl({}));
      await submitTeachClip({ gameId: state._id, participantId: myId, storageId });
      setPhase("sent");
      haptic("correct");
    } catch (e) {
      setPhase("idle");
      toast(errorText(e, s.error));
    }
  };

  if (state.teachClip && state.teachClip.byParticipantId !== myId && phase !== "sent") {
    const by = state.players.find((p) => p.participantId === state.teachClip?.byParticipantId);
    return (
      <div className="wr-teach done">
        <Icon name="g-ok" size={24} />
        <small style={{ opacity: 0.8 }}>{s.teachTaken(by?.nickname ?? "?")}</small>
      </div>
    );
  }
  if (phase === "sent" || state.teachClip?.byParticipantId === myId) {
    return (
      <div className="wr-teach done">
        <Icon name="g-ok" size={24} />
        {s.teachSent}
      </div>
    );
  }
  if (rec.status === "recorded" && rec.url) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ClipPlayer url={rec.url} color="var(--mint)" buttonColor="var(--mint)" label={s.preview} s={s} />
        </div>
        <button type="button" className="ec-round-btn" onClick={() => rec.reset()} aria-label={s.retake} disabled={phase === "sending"}>
          ↺
        </button>
        <button type="button" className="ec-btn mint sm" style={{ width: "auto", padding: "0 16px" }} onClick={send} disabled={phase === "sending"}>
          {phase === "sending" ? s.teachSending : s.send}
        </button>
      </div>
    );
  }
  const recording = rec.status === "recording";
  return (
    <button
      type="button"
      className={`wr-teach${recording ? " rec" : ""}`}
      onClick={() => {
        unlockAudio();
        if (recording) rec.stop();
        else void rec.start();
      }}
      disabled={rec.status === "requesting"}
    >
      <MicGlyph size={20} />
      {recording ? s.recordingTap(fmtSecs(rec.elapsedMs)) : rec.status === "error" ? micErrorText(rec, s).split(".")[0] : s.teach(name)}
      {!recording && rec.status !== "error" && <small>{s.teachSub}</small>}
    </button>
  );
}

// ─── Verdict ─────────────────────────────────────────────────────────────────

export function VerdictView({ state, myId, s, isHost, toast }: ViewProps) {
  const skip = useMutation(api.wordRush.skip);
  const perf = state.performer;
  const verdict = state.verdict;
  const played = useRef(false);

  useEffect(() => {
    if (played.current || !verdict) return;
    played.current = true;
    sfx(verdict.votes.length === 0 ? "pop" : verdict.label === "huh" ? "wrong" : "tada");
  }, [verdict]);

  if (!perf || !verdict) return null;
  const performer = state.players.find((p) => p.participantId === perf.participantId);
  const teacher = state.teachClip ? state.players.find((p) => p.participantId === state.teachClip?.byParticipantId) : undefined;
  const label = verdict.label === "native" ? s.verdictNative : verdict.label === "close" ? s.verdictClose : s.verdictHuh;

  return (
    <>
      {verdict.label !== "huh" && <Confetti burstKey={state.phaseSeq} count={verdict.label === "native" ? 70 : 36} />}
      <Stage player={performer} tag={perf.participantId === myId ? s.you : performer?.nickname ?? "?"} tagColor="var(--blue)" />
      {verdict.votes.length > 0 && <div className={`wr-verdict ${verdict.label}`}>{label}</div>}
      {verdict.votes.length === 0 ? (
        <div className="wr-next-hint" style={{ flex: "none" }}>
          {s.noVotes}
        </div>
      ) : (
        <div className="wr-panel">
          {verdict.votes.map((v, i) => {
            const judge = state.players.find((p) => p.participantId === v.judgeId);
            return (
              <div key={v.judgeId} className="wr-pcard">
                <div className="wr-vote" style={{ "--c": VOTE_META[v.vote].color, "--d": `${0.3 + i * 0.25}s` } as React.CSSProperties}>
                  {v.weight > 1 && <em>×{v.weight}</em>}
                  <Icon name={VOTE_META[v.vote].icon} size={52} />
                  {v.vote === "huh" ? s.huh : v.vote === "close" ? s.close : s.native}
                </div>
                <AvatarDisc id={judge?.avatarValue ?? "rabbit"} size={46} />
                <small>{v.judgeId === myId ? s.you : judge?.nickname}</small>
              </div>
            );
          })}
        </div>
      )}
      {verdict.bonus > 0 && (
        <div className="wr-bonus" style={{ animationDelay: `${0.3 + verdict.votes.length * 0.25}s, ${1 + verdict.votes.length * 0.25}s` }}>
          {s.bonus(verdict.bonus)}
        </div>
      )}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {state.teachClip && (
          <ClipPlayer
            url={state.teachClip.url}
            color="var(--mint)"
            buttonColor="var(--mint)"
            label={<span style={{ fontFamily: "var(--round)", fontWeight: 900, fontSize: 12 }}>{s.hearVersion(teacher?.nickname ?? "?")}</span>}
            s={s}
          />
        )}
        {isHost && (
          <button
            type="button"
            className="ec-btn pink wiggle"
            onClick={() =>
              skip({ gameId: state._id, participantId: myId, phaseSeq: state.phaseSeq }).catch((e) => toast(errorText(e, s.error)))
            }
          >
            {s.nextWord}
          </button>
        )}
      </div>
    </>
  );
}
