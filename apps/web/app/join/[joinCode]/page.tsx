"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AvatarPicker } from "@/components/avatar-picker";
import { LANGUAGES, PRESET_AVATARS, PresetAvatarId, LanguageCode } from "@/lib/types";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = params.joinCode as string;

  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<PresetAvatarId>("cat");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const room = useQuery(api.rooms.getRoomByJoinCode, { joinCode });
  const participants = useQuery(
    api.participants.getRoomParticipants,
    room ? { roomId: room._id as Id<"rooms"> } : "skip"
  );
  const joinRoom = useMutation(api.participants.joinRoom);

  const takenAvatars = (participants ?? []).filter((p) => p.online).map((p) => p.avatar.value);

  // Auto-select first available avatar
  useEffect(() => {
    if (takenAvatars.includes(avatar)) {
      const firstAvailable = PRESET_AVATARS.find((a) => !takenAvatars.includes(a.id));
      if (firstAvailable) {
        setAvatar(firstAvailable.id);
      }
    }
  }, [takenAvatars.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedEmoji =
    PRESET_AVATARS.find((a) => a.id === avatar)?.emoji ?? "🐱";

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError("Please enter a nickname");
      return;
    }

    if (!room) {
      setError("Room not found");
      return;
    }

    if (room.status === "closed") {
      setError("This room has been closed");
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

      router.push(`/room/${room._id}?pid=${participantId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
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
        Looking up room...
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
          Room not found
        </h1>
        <p style={{ color: "var(--muted)" }}>
          The room code <strong>{joinCode}</strong> is invalid or has expired.
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
          Room closed
        </h1>
        <p style={{ color: "var(--muted)" }}>
          This conversation has ended. The host has closed the room.
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
          Join Conversation
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Room code: <strong>{joinCode}</strong>
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
          Nickname
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your name"
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
          Choose an avatar
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
          Your language
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
          {joining ? "Joining..." : `Join as ${selectedEmoji} ${nickname || "..."}`}
        </button>
      </div>
    </main>
  );
}
