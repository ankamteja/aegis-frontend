import { create } from "zustand";
import { AegisEvent, Stage, RiskLevel, Explanation } from "@/types/events";
import { sanitize } from "@/services/sanitize";

export type Connection = "idle" | "connecting" | "open" | "reconnecting" | "failed";

export const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 3000, 5000, 5000];

type State = {
  transcript: { speaker: string; text: string }[];
  signals: { label: string; severity: string; evidence: string }[];
  nodes: { id: string; label: string; parent?: string; predicted?: boolean }[];
  stage?: { stage: Stage; progress: number; reason: string };
  dna?: { matchPct: number; pattern: string; incidents: number };
  path?: { next: string; confidence: number; evidence: string[] };
  risk: { level: RiskLevel; drivers: string[] };
  privacy: { detected: number; removed: number; transmitted: number };
  pause?: { reasons: string[]; explanation?: Explanation };
  running: boolean;
  live: boolean;
  connection: Connection;
  attempt: number;
  errors: string[]; // backend {"type":"error"} messages
  notice?: string; // connection notices
  redactedBeforeSend: number; // PII items removed in this browser from typed text
  apply: (e: AegisEvent) => void;
  play: (events: AegisEvent[], speed?: number) => void;
  connectLive: (url: string) => void;
  sendTurn: (speaker: "caller" | "user", text: string) => void;
  clearErrors: () => void;
  reset: () => void;
};

// State that comes from the event stream. Cleared when a new session starts.
const eventState = {
  transcript: [],
  signals: [],
  nodes: [],
  stage: undefined,
  dna: undefined,
  path: undefined,
  pause: undefined,
  risk: { level: "NORMAL" as RiskLevel, drivers: [] },
  privacy: { detected: 0, removed: 0, transmitted: 0 },
};

const initial = {
  ...eventState,
  running: false,
  live: false,
  connection: "idle" as Connection,
  attempt: 0,
  errors: [] as string[],
  notice: undefined as string | undefined,
  redactedBeforeSend: 0,
};

let timers: ReturnType<typeof setTimeout>[] = [];
let ws: WebSocket | null = null;
let gen = 0; // bumps on every connect/reset so stale sockets and timers are ignored
let retries = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

export const useAegis = create<State>((set, get) => {
  const handleMessage = (raw: string) => {
    let msg: unknown;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;
    const m = msg as { type?: string; message?: unknown };
    if (m.type === "error") {
      const text = typeof m.message === "string" ? m.message : "Unknown backend error";
      set((s) => ({ errors: [...s.errors.slice(-4), text] }));
      return;
    }
    get().apply(msg as AegisEvent);
  };

  function scheduleReconnect(url: string, myGen: number) {
    if (retries >= MAX_RETRIES) {
      set({
        running: false,
        connection: "failed",
        notice: "Backend unreachable. Press a Live button to try again.",
      });
      return;
    }
    const delay = RETRY_DELAYS[Math.min(retries, RETRY_DELAYS.length - 1)];
    retries += 1;
    set({ connection: "reconnecting", attempt: retries });
    retryTimer = setTimeout(() => {
      if (myGen === gen) openSocket(url, myGen, true);
    }, delay);
  }

  function openSocket(url: string, myGen: number, isReconnect: boolean) {
    let sock: WebSocket;
    try {
      sock = new WebSocket(url);
    } catch {
      set({ running: false, live: true, connection: "failed", notice: "Invalid backend URL." });
      return;
    }
    ws = sock;

    sock.onopen = () => {
      if (myGen !== gen) return;
      retries = 0;
      if (isReconnect) {
        // The backend starts a fresh session on every connection, so old state no longer matches.
        set({
          ...eventState,
          running: true,
          live: true,
          connection: "open",
          attempt: 0,
          notice: "Reconnected. The backend started a new session.",
        });
      } else {
        set({ connection: "open", attempt: 0, notice: undefined });
      }
    };

    sock.onmessage = (m) => {
      if (myGen !== gen) return;
      handleMessage(m.data);
    };

    // onerror is always followed by onclose, so reconnect handling lives there.
    sock.onclose = () => {
      if (myGen !== gen) return;
      ws = null;
      scheduleReconnect(url, myGen);
    };
  }

  return {
    ...initial,

    // One event in. Used by the scripted demo and the live backend.
    // Live transcripts arrive already redacted, so nothing is sanitized here.
    apply: (e) =>
      set((s) => {
        switch (e.type) {
          case "transcript":
            return { transcript: [...s.transcript, { speaker: e.speaker, text: e.text }] };
          case "signal":
            return { signals: [...s.signals, e] };
          case "graph_node": {
            // Upsert by id. A real node ("n...") replaces any predicted node ("p...").
            const isReal = !e.id.startsWith("p");
            const kept = s.nodes.filter(
              (n) => (isReal ? !n.id.startsWith("p") : true) && n.id !== e.id
            );
            return { nodes: [...kept, e] };
          }
          case "stage":
            return { stage: e };
          case "scam_dna":
            return { dna: e };
          case "shadowpath":
            return { path: e };
          case "risk":
            return { risk: { level: e.level, drivers: e.drivers } };
          case "privacy":
            return { privacy: e };
          case "reality_pause":
            return { pause: e };
          default:
            return {}; // unknown event types are ignored
        }
      }),

    // Scripted demo: sanitizes locally and computes the privacy counts itself.
    play: (events, speed = 1) => {
      get().reset();
      set({ running: true, live: false });
      timers = events.map((e) =>
        setTimeout(() => {
          if (e.type === "transcript") {
            const r = sanitize(e.text);
            get().apply({ ...e, text: r.text });
            set((s) => ({
              privacy: {
                detected: s.privacy.detected + r.count,
                removed: s.privacy.removed + r.count,
                transmitted: 0,
              },
            }));
          } else {
            get().apply(e);
          }
        }, e.at / speed)
      );
    },

    connectLive: (url) => {
      get().reset();
      gen += 1;
      retries = 0;
      set({ running: true, live: true, connection: "connecting", attempt: 0 });
      openSocket(url, gen, false);
    },

    // Typed text is redacted here, in the browser, before it goes on the wire.
    sendTurn: (speaker, text) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        set({ notice: "Not connected. Nothing was sent." });
        return;
      }
      const r = sanitize(text);
      ws.send(JSON.stringify({ speaker, text: r.text }));
      set((s) => ({ redactedBeforeSend: s.redactedBeforeSend + r.count }));
    },

    clearErrors: () => set({ errors: [], notice: undefined }),

    reset: () => {
      gen += 1;
      retries = 0;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      timers.forEach(clearTimeout);
      timers = [];
      if (ws) {
        const old = ws;
        ws = null; // cleared first; the old socket's handlers are ignored via gen
        old.close();
      }
      set({ ...initial });
    },
  };
});