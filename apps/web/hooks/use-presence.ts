"use client";

import { useEffect } from "react";
import type { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { tokenFor, useAuthedMutation } from "@/lib/convex";

export function usePresence({
  participantId,
  convexUrl,
  router,
}: {
  participantId: string;
  convexUrl: string;
  router: ReturnType<typeof useRouter>;
}) {
  const setParticipantOnline = useAuthedMutation(api.participants.setParticipantOnline);

  // Mark online on mount, heartbeat, offline on leave
  useEffect(() => {
    if (!participantId) return;
    const pid = participantId as Id<"participants">;

    // Mark online
    setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});

    // Heartbeat every 15s to keep lastSeenAt fresh
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});
      }
    }, 15_000);

    // Fire-and-forget "away" on page close via sendBeacon + fetch keepalive
    const markLeftBeacon = () => {
      const url = `${convexUrl}/api/mutation`;
      const body = JSON.stringify({
        path: "participants:leaveRoom",
        // Read now, not when the effect ran. JSON drops the field when this browser holds no token
        args: { participantId, token: tokenFor(participantId) },
      });
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      try {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };

    // Mark away/online on tab visibility change
    const handleVisibility = () => {
      if (document.hidden) {
        setParticipantOnline({ participantId: pid, online: true, presence: "away" }).catch(() => {});
      } else {
        setParticipantOnline({ participantId: pid, online: true, presence: "online" }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", markLeftBeacon);
    window.addEventListener("pagehide", markLeftBeacon);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", markLeftBeacon);
      window.removeEventListener("pagehide", markLeftBeacon);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [participantId, setParticipantOnline, convexUrl]);

  const handleLeave = async () => {
    if (!participantId) return;
    try {
      await setParticipantOnline({
        participantId: participantId as Id<"participants">,
        online: false,
      });
    } catch {}
    router.push("/");
  };

  return { handleLeave };
}
