"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AvatarPicker } from "@/components/avatar-picker";
import { AvatarDisc } from "@/components/ui/avatar";
import { Chatto } from "@/components/ui/chatto";
import { LangBadge } from "@/components/ui/icon";
import { RoomBackground } from "@/components/ui/effects";
import { LANGUAGES, PRESET_AVATARS, PresetAvatarId, LanguageCode } from "@/lib/types";
import { textureForRoom } from "@/lib/textures";
import { t } from "@/lib/i18n";
import {
  LEGACY_PARAM,
  LEGACY_VALUE,
  hasLegacyBackend,
  legacyConvex,
  useIsLegacyBackend,
} from "@/lib/convex";
import "../../screens.css";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = params.joinCode as string;

  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<PresetAvatarId>("cat");
  const [language, setLanguage] = useState<LanguageCode>("ja");

  useEffect(() => {
    setNickname(localStorage.getItem("enchatto_lastNickname") ?? "");
    setAvatar((localStorage.getItem("enchatto_lastAvatarId") as PresetAvatarId) ?? "cat");
    setLanguage((localStorage.getItem("enchatto_lastLanguage") as LanguageCode) ?? "ja");
  }, []);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const room = useQuery(api.rooms.getRoomByJoinCode, { joinCode });
  const isLegacy = useIsLegacyBackend();
  const [legacyChecked, setLegacyChecked] = useState(false);

  useEffect(() => {
    if (room !== null || isLegacy || !legacyConvex) return;
    let cancelled = false;
    legacyConvex
      .query(api.rooms.getRoomByJoinCode, { joinCode })
      .then((legacyRoom) => {
        if (cancelled) return;
        if (legacyRoom) router.replace(`/join/${joinCode}?${LEGACY_PARAM}=${LEGACY_VALUE}`);
        else setLegacyChecked(true);
      })
      .catch(() => !cancelled && setLegacyChecked(true));
    return () => {
      cancelled = true;
    };
  }, [room, isLegacy, joinCode, router]);

  const participants = useQuery(
    api.participants.getRoomParticipants,
    room ? { roomId: room._id as Id<"rooms"> } : "skip"
  );
  const joinRoom = useMutation(api.participants.joinRoom);

  // Avatars taken by OTHER online users (exclude own offline participant that would be reclaimed)
  const takenAvatars = (participants ?? [])
    .filter((p) => p.online)
    .map((p) => p.avatar.value);

  // Check if we have a returning participant (same name + avatar, offline)
  const hasReturningParticipant = (participants ?? []).some(
    (p) => !p.online && p.nickname === nickname.trim() && p.avatar.value === avatar
  );

  // Auto-select first available avatar (skip if we'd be reclaiming our old one, or already joining)
  useEffect(() => {
    if (!joining && takenAvatars.includes(avatar) && !hasReturningParticipant) {
      const firstAvailable = PRESET_AVATARS.find((a) => !takenAvatars.includes(a.id));
      if (firstAvailable) {
        setAvatar(firstAvailable.id);
      }
    }
  }, [takenAvatars.join(","), hasReturningParticipant, joining]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError(t("Please enter a nickname", language));
      return;
    }

    if (!room) {
      setError(t("Room not found", language));
      return;
    }

    if (room.status === "closed") {
      setError(t("This room has been closed", language));
      return;
    }

    setJoining(true);
    setError(null);

    try {
      // Derive display settings from language choice
      const displaySettings = {
        showEnglish: true,
        showJapanese: language === "ja",
        showRomaji: language === "ja",
      };
      const participantId = await joinRoom({
        roomId: room._id,
        nickname: nickname.trim(),
        platform: "web",
        avatar: { type: "preset", value: avatar },
        preferredLanguage: language,
        displaySettings,
      });

      localStorage.setItem("enchatto_lastNickname", nickname.trim());
      localStorage.setItem("enchatto_lastAvatarId", avatar);
      localStorage.setItem("enchatto_lastLanguage", language);

      const backend = isLegacy ? `&${LEGACY_PARAM}=${LEGACY_VALUE}` : "";
      router.push(`/room/${room._id}?pid=${participantId}${backend}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to join room", language));
      setJoining(false);
    }
  };

  const background = <RoomBackground texture={textureForRoom(room)} />;

  const awaitingLegacy = room === null && !isLegacy && hasLegacyBackend && !legacyChecked;

  // Loading state
  if (room === undefined || awaitingLegacy) {
    return (
      <main className="ec-center-state">
        {background}
        <Chatto size={96} shadow />
        <p style={{ display: "flex", alignItems: "center", gap: 8, opacity: 1 }}>
          {t("Looking up room...", language)}
          <span className="ec-dots"><i /><i /><i /></span>
        </p>
      </main>
    );
  }

  // Room not found / closed
  if (room === null || room.status === "closed") {
    const notFound = room === null;
    return (
      <main className="ec-center-state">
        {background}
        <Chatto size={96} bob={false} wave={false} shadow />
        <h1>{notFound ? t("Room not found", language) : t("Room closed", language)}</h1>
        <p>
          {notFound
            ? t("The room code is invalid or has expired.", language)
            : t("This conversation has ended. The host has closed the room.", language)}
        </p>
        <button className="ec-btn white sm" style={{ width: "auto", padding: "0 22px" }} onClick={() => router.push("/")}>
          {t("Back home", language)}
        </button>
      </main>
    );
  }

  const othersInRoom = takenAvatars.length;
  const displayName = nickname.trim() || "...";
  const joinLabel = joining
    ? t("Joining...", language)
    : t("JOIN AS {name}!", language).replace("{name}", language === "ja" ? displayName : displayName.toUpperCase());

  return (
    <main className="ec-join ec-col">
      {background}

      <div className="ec-join-head">
        <div style={{ minWidth: 0 }}>
          <span className="ec-chip ink">
            {t("ROOM", language)} {joinCode.toUpperCase()}
          </span>
          <div className="ec-join-title">{t("Who's joining?", language)}</div>
        </div>
        <Chatto size={78} shadow style={{ marginTop: 6 }} />
      </div>

      <div>
        <div className="ec-label">
          {t("Choose your avatar", language)}
          {othersInRoom > 0 && (
            <small>
              {othersInRoom}
              {language === "ja" ? "" : " "}
              {t("already in the room", language)}
            </small>
          )}
        </div>
        <AvatarPicker selected={avatar} onSelect={setAvatar} takenAvatars={takenAvatars} lang={language} />
      </div>

      <div>
        <label className="ec-label" htmlFor="ec-nickname">
          {t("Your nickname", language)}
        </label>
        <input
          id="ec-nickname"
          className="ec-field"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder={t("Enter your name", language)}
          maxLength={20}
          style={{ fontSize: 18 }}
        />
      </div>

      <div>
        <div className="ec-label">{t("Your language", language)}</div>
        <div className="ec-pick">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={language === lang.code ? "on" : undefined}
              aria-pressed={language === lang.code}
              onClick={() => setLanguage(lang.code)}
            >
              <LangBadge lang={lang.code} />
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="ec-error">{error}</div>}

      <button
        className={`ec-btn pink${nickname.trim() && !joining ? " wiggle" : ""}`}
        style={{ marginTop: "auto", minHeight: 64, fontSize: language === "ja" ? 19 : 21 }}
        onClick={handleJoin}
        disabled={joining}
      >
        <AvatarDisc id={avatar} size={42} border={2.5} shadow={false} />
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{joinLabel}</span>
      </button>

      <div className="ec-version">v{(process.env.NEXT_PUBLIC_GIT_SHA || "dev").slice(0, 7)}</div>
    </main>
  );
}
