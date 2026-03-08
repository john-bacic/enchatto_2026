"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AvatarPicker } from "@/components/avatar-picker";
import { LANGUAGES, PRESET_AVATARS, PresetAvatarId, LanguageCode } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = params.joinCode as string;

  const [nickname, setNickname] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("enchatto_lastNickname") ?? "";
    return "";
  });
  const [avatar, setAvatar] = useState<PresetAvatarId>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("enchatto_lastAvatarId") as PresetAvatarId) ?? "cat";
    return "cat";
  });
  const [language, setLanguage] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("enchatto_lastLanguage") as LanguageCode) ?? "ja";
    return "ja";
  });
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const room = useQuery(api.rooms.getRoomByJoinCode, { joinCode });
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

  // Auto-select first available avatar (skip if we'd be reclaiming our old one)
  useEffect(() => {
    if (takenAvatars.includes(avatar) && !hasReturningParticipant) {
      const firstAvailable = PRESET_AVATARS.find((a) => !takenAvatars.includes(a.id));
      if (firstAvailable) {
        setAvatar(firstAvailable.id);
      }
    }
  }, [takenAvatars.join(","), hasReturningParticipant]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEmoji =
    PRESET_AVATARS.find((a) => a.id === avatar)?.emoji ?? "🐱";

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
      const participantId = await joinRoom({
        roomId: room._id,
        nickname: nickname.trim(),
        platform: "web",
        avatar: { type: "preset", value: avatar },
        preferredLanguage: language,
      });

      localStorage.setItem("enchatto_lastNickname", nickname.trim());
      localStorage.setItem("enchatto_lastAvatarId", avatar);
      localStorage.setItem("enchatto_lastLanguage", language);

      router.push(`/room/${room._id}?pid=${participantId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to join room", language));
      setJoining(false);
    }
  };

  // Loading state
  if (room === undefined) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          color: "var(--muted)",
        }}
      >
        {t("Looking up room...", language)}
      </main>
    );
  }

  // Room not found
  if (room === null) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {t("Room not found", language)}
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {t("The room code is invalid or has expired.", language)}
        </p>
      </main>
    );
  }

  // Room closed
  if (room.status === "closed") {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {t("Room closed", language)}
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {t("This conversation has ended. The host has closed the room.", language)}
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {t("Join Conversation", language)}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {t("Room code:", language)} <strong>{joinCode}</strong>
        </p>

        {/* Nickname */}
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          {t("Nickname", language)}
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("Enter your name", language)}
          maxLength={20}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            marginBottom: "1.25rem",
            outline: "none",
          }}
        />

        {/* Avatar */}
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          {t("Choose an avatar", language)}
        </label>
        <div style={{ marginBottom: "1.25rem" }}>
          <AvatarPicker selected={avatar} onSelect={setAvatar} takenAvatars={takenAvatars} />
        </div>

        {/* Language */}
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          {t("Your language", language)}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            marginBottom: "1.5rem",
            background: "var(--surface)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {error}
          </p>
        )}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            background: joining ? "var(--muted)" : "var(--primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {joining ? t("Joining...", language) : `${t("Join as", language)} ${selectedEmoji} ${nickname || "..."}`}
        </button>
      </div>
    </main>
  );
}
