// Chatto Dash's practice screen as a page of its own, with nothing fetched from anywhere: the iPhone app
// carries it (apps/ios/Resources/DashOffline, built from here by offline/build.mjs: `npm run build:dash-offline`)
// and shows it in a web view from its own files, so that a course can be run with no connection at all. The
// app serves the page under its own scheme (apps/ios/Views/DashPracticeView.swift), with the avatar pictures at
// /icons and the app's fonts at /fonts, as the web app has them.
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import "./dash-practice.css";
import { DashPractice } from "@/components/dash/practice";
import { PRESET_AVATARS } from "@/lib/types";

type Told = { type: "ready" | "close" };
function tellApp(message: Told) {
  const handlers = (window as unknown as { webkit?: { messageHandlers?: Record<string, { postMessage(m: unknown): void }> } }).webkit?.messageHandlers;
  handlers?.enchattoDash?.postMessage(message);
}

const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "ja" ? "ja" : "en";
document.documentElement.lang = lang;
createRoot(document.getElementById("root")!).render(
  <DashPractice avatar={params.get("avatar") ?? PRESET_AVATARS[0].id} lang={lang} coarse onClose={() => tellApp({ type: "close" })} />
);
tellApp({ type: "ready" });
