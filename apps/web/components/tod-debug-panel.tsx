"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// ─── Client-side trace log ───────────────────────────────────────────────────

export type TodTraceEntry = {
  ts: number;
  source: "client" | "server";
  action: string;
  detail?: string;
  latencyMs?: number;
  ok?: boolean;
};

let _traceLog: TodTraceEntry[] = [];
let _listeners: Set<() => void> = new Set();

export function todTrace(entry: Omit<TodTraceEntry, "ts">) {
  _traceLog.push({ ...entry, ts: Date.now() });
  if (_traceLog.length > 500) _traceLog = _traceLog.slice(-300);
  _listeners.forEach((fn) => fn());
  // Also log to console for Safari/Chrome DevTools
  const icon = entry.ok === false ? "❌" : entry.source === "server" ? "🔵" : "🟢";
  console.log(
    `%c[T/D] ${icon} ${entry.action}${entry.latencyMs ? ` ${entry.latencyMs}ms` : ""}${entry.detail ? ` — ${entry.detail}` : ""}`,
    entry.ok === false ? "color: red" : "color: gray"
  );
}

function useTraceLog() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);
  return _traceLog;
}

/** Wrap a T/D mutation call with automatic tracing */
export function tracedMutation<T>(
  actionName: string,
  detail: string,
  fn: () => Promise<T>,
): Promise<T> {
  todTrace({ source: "client", action: `${actionName}:start`, detail });
  const t0 = performance.now();
  return fn().then(
    (result) => {
      todTrace({ source: "client", action: `${actionName}:ok`, latencyMs: Math.round(performance.now() - t0), ok: true, detail });
      return result;
    },
    (err) => {
      todTrace({ source: "client", action: `${actionName}:error`, latencyMs: Math.round(performance.now() - t0), ok: false, detail: err?.message?.slice(0, 100) });
      throw err;
    },
  );
}

// ─── Debug panel component ───────────────────────────────────────────────────

export function TodDebugPanel({ roomId, embedded }: { roomId: string; embedded?: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"client" | "server" | "em-server">("client");
  const clientLog = useTraceLog();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Server-side trace (reactive via Convex subscription)
  const serverTrace = useQuery(
    api.truthOrDare.getTraceByRoom,
    open && tab === "server" ? { roomId: roomId as Id<"rooms">, limit: 100 } : "skip",
  );
  const emServerTrace = useQuery(
    api.emojiMatch.getEmTraceByRoom,
    open && tab === "em-server" ? { roomId: roomId as Id<"rooms">, limit: 100 } : "skip",
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [clientLog.length, serverTrace]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          ...(embedded ? {} : {
            position: "fixed" as const,
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }),
          background: "rgba(0,0,0,0.7)",
          color: "#0f0",
          border: "1px solid #0f0",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: "0.7rem",
          fontFamily: "monospace",
          cursor: "pointer",
          opacity: embedded ? 0.8 : 0.6,
          width: embedded ? "100%" : undefined,
        }}
      >
        Game Debug
      </button>
    );
  }

  const formatTs = (ts: number) => new Date(ts).toISOString().slice(11, 23);

  const serverData = tab === "em-server" ? emServerTrace : serverTrace;
  const entries: TodTraceEntry[] = tab === "client"
    ? [...clientLog].reverse().slice(0, 200)
    : (serverData ?? []).map((e: any) => ({
        ts: e.ts,
        source: "server" as const,
        action: e.action,
        detail: [e.participantId?.slice(-6), e.detail].filter(Boolean).join(" "),
        latencyMs: e.serverMs,
      }));

  return (
    <div
      style={{
        ...(embedded ? {
          borderRadius: 10,
          maxHeight: "40vh",
        } : {
          position: "fixed" as const,
          bottom: 0,
          right: 0,
          width: "min(420px, 100vw)",
          maxHeight: "50vh",
          zIndex: 9999,
          borderTopLeftRadius: 10,
        }),
        background: "rgba(0,0,0,0.92)",
        border: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        fontSize: "0.7rem",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #333", flexWrap: "wrap", gap: 4 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setTab("client")}
            style={{
              background: tab === "client" ? "#0f0" : "transparent",
              color: tab === "client" ? "#000" : "#0f0",
              border: "1px solid #0f0",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "0.65rem",
            }}
          >
            Client
          </button>
          <button
            onClick={() => setTab("server")}
            style={{
              background: tab === "server" ? "#0af" : "transparent",
              color: tab === "server" ? "#000" : "#0af",
              border: "1px solid #0af",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "0.65rem",
            }}
          >
            T/D Server
          </button>
          <button
            onClick={() => setTab("em-server")}
            style={{
              background: tab === "em-server" ? "#f0a" : "transparent",
              color: tab === "em-server" ? "#000" : "#f0a",
              border: "1px solid #f0a",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "0.65rem",
            }}
          >
            EM Server
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#666" }}>{entries.length} entries</span>
          <button
            onClick={() => { _traceLog = []; _listeners.forEach((fn) => fn()); }}
            style={{ background: "transparent", color: "#f66", border: "none", cursor: "pointer", fontSize: "0.65rem" }}
          >
            Clear
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "transparent", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} style={{ overflow: "auto", flex: 1, padding: "4px 8px" }}>
        {entries.length === 0 && (
          <div style={{ color: "#666", padding: "1rem", textAlign: "center" }}>
            {tab === "server" ? "Loading server trace..." : "No events yet. Play the game!"}
          </div>
        )}
        {entries.map((e: TodTraceEntry, i: number) => {
          const isError = e.ok === false || e.action?.includes("error");
          const isStart = e.action?.includes("start");
          const color = isError ? "#f66" : isStart ? "#ff0" : tab === "server" ? "#0af" : tab === "em-server" ? "#f0a" : "#0f0";
          return (
            <div key={i} style={{ color, padding: "1px 0", lineHeight: 1.4, borderBottom: "1px solid #1a1a1a" }}>
              <span style={{ color: "#555" }}>{formatTs(e.ts)}</span>{" "}
              <span style={{ fontWeight: isError ? 700 : 400 }}>{e.action}</span>
              {e.latencyMs != null && <span style={{ color: "#888" }}> {e.latencyMs}ms</span>}
              {e.detail && <span style={{ color: "#777" }}> {e.detail}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
