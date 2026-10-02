"use client";

import { useEffect } from "react";

const BUILD = process.env.NEXT_PUBLIC_GIT_SHA;
const CHECK_MS = 60_000;
const RELOADED_KEY = "enchatto_reloadedFor";

/** Mid-message, mid-recording, mid-drawing or mid-playback: reloading now would lose something */
function isBusy() {
  if (document.querySelector(".ec-voice-pill, canvas")) return true;
  if ([...document.querySelectorAll("audio")].some((a) => !a.paused)) return true;
  return [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("textarea, input[type=text], input:not([type])")].some(
    (el) => el.value.trim() !== ""
  );
}

/** Moves open pages onto a new deploy without anyone refreshing, at a moment that costs nothing */
export function DeployRefresh() {
  useEffect(() => {
    if (!BUILD || BUILD === "dev") return;
    let latest: string | null = null;

    const reloadIfStale = () => {
      if (!latest || latest === BUILD) return;
      // Guards against a reload loop if the new deploy somehow still serves this build's code
      if (sessionStorage.getItem(RELOADED_KEY) === latest) return;
      if (document.visibilityState === "visible" && isBusy()) return;
      sessionStorage.setItem(RELOADED_KEY, latest);
      window.location.reload();
    };

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (res.ok) latest = ((await res.json()) as { sha?: string }).sha ?? null;
      } catch {
        return;
      }
      reloadIfStale();
    };

    void check();
    const timer = setInterval(check, CHECK_MS);
    const onVisibility = () => void check();
    document.addEventListener("visibilitychange", onVisibility);
    // Retry soon after the user finishes whatever kept the page busy
    const busyRetry = setInterval(reloadIfStale, 5_000);
    return () => {
      clearInterval(timer);
      clearInterval(busyRetry);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
