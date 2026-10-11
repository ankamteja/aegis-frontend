"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAegis, MAX_RETRIES } from "@/hooks/useAegis";
import { sanitize } from "@/services/sanitize";
import { bankScam } from "@/demo/bankScam";
import { RealityPause } from "@/components/RealityPause/RealityPause";
import { AttackGraph } from "@/components/AttackGraph/AttackGraph";
import { RiskBanner } from "@/components/RiskEngine/RiskBanner";
import { StageBar } from "@/components/ManipulationState/StageBar";
import { ScamDNACard } from "@/components/ScamDNA/ScamDNACard";
import { ShadowPathCard } from "@/components/ShadowPath/ShadowPathCard";
import { PrivacyPanel } from "@/components/PrivacyGate/PrivacyPanel";

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS ?? "ws://localhost:8000/ws";

export default function Home() {
  const s = useAegis();
  const [speed, setSpeed] = useState(1);
  const [customText, setCustomText] = useState("");
  const [liveKind, setLiveKind] = useState<"replay" | "custom">("replay");

  const preview = useMemo(() => sanitize(customText), [customText]);
  const canSend = s.connection === "open";

  const send = (speaker: "caller" | "user") => {
    if (!customText.trim() || !canSend) return;
    s.sendTurn(speaker, customText.trim());
    setCustomText("");
  };

  const status = (() => {
    if (!s.live) {
      return s.running
        ? { text: "SIMULATED CALL IN PROGRESS", dot: "animate-pulse bg-red-500" }
        : { text: "IDLE", dot: "bg-slate-600" };
    }
    switch (s.connection) {
      case "connecting":
        return { text: "CONNECTING TO BACKEND…", dot: "animate-pulse bg-amber-400" };
      case "open":
        return { text: "LIVE FROM BACKEND", dot: "animate-pulse bg-emerald-400" };
      case "reconnecting":
        return {
          text: `RECONNECTING (${s.attempt}/${MAX_RETRIES})…`,
          dot: "animate-pulse bg-amber-400",
        };
      case "failed":
        return { text: "BACKEND UNREACHABLE", dot: "bg-red-600" };
      default:
        return { text: "IDLE", dot: "bg-slate-600" };
    }
  })();

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-slate-950 p-4 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold tracking-wide">AEGIS</h1>
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.text}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/patterns" className="text-sm text-slate-400 hover:text-slate-200">
            Pattern engine →
          </Link>
          <Link href="/bank" className="text-sm text-slate-400 hover:text-slate-200">
            Bank app view →
          </Link>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded bg-slate-800 px-2 py-1 text-sm"
          >
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
          <button
            className="rounded bg-emerald-600 px-3 py-1"
            onClick={() => s.play(bankScam, speed)}
          >
            Start demo
          </button>
          <button
            className="rounded bg-indigo-600 px-3 py-1"
            onClick={() => {
              setLiveKind("replay");
              s.connectLive(`${WS_URL}?replay=bank_scam&speed=${speed}`);
            }}
          >
            Live (replay)
          </button>
          <button
            className="rounded bg-fuchsia-600 px-3 py-1"
            onClick={() => {
              setLiveKind("custom");
              // Open the dashboard as /?session=<call id> to join the same call as the audio client.
              const sid = new URLSearchParams(window.location.search).get("session");
              s.connectLive(sid ? `${WS_URL}?session=${encodeURIComponent(sid)}` : WS_URL);
            }}
          >
            Live (custom)
          </button>
          <button className="rounded bg-slate-700 px-3 py-1" onClick={s.reset}>
            Reset
          </button>
        </div>
      </header>

      {(s.errors.length > 0 || s.notice) && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          <div className="space-y-1">
            {s.notice && <p className="text-amber-300">{s.notice}</p>}
            {s.errors.map((msg, i) => (
              <p key={i} className="text-red-300">
                Backend error: {msg}
              </p>
            ))}
          </div>
          <button
            onClick={s.clearErrors}
            className="shrink-0 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      )}

      <RiskBanner />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="max-h-[520px] space-y-4 overflow-auto rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div>
            <h2 className="mb-2 text-xs uppercase tracking-widest text-slate-400">
              Live interaction (redacted)
            </h2>
            {s.transcript.length === 0 && (
              <p className="text-sm text-slate-500">Press Start demo or a Live button.</p>
            )}
            {s.transcript.map((t, i) => (
              <p key={i} className="mb-2 text-sm text-slate-200">
                <span className="text-slate-500">{t.speaker}:</span> {t.text}
              </p>
            ))}

            {s.live && (
              <div className="mt-4">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send("caller");
                  }}
                >
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    disabled={!canSend}
                    placeholder={canSend ? "Type a message..." : "Waiting for connection..."}
                    className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200 outline-none focus:border-slate-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium disabled:opacity-50"
                  >
                    Caller
                  </button>
                  <button
                    type="button"
                    disabled={!canSend}
                    onClick={() => send("user")}
                    className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium disabled:opacity-50"
                  >
                    User
                  </button>
                </form>

                {customText && preview.count > 0 && (
                  <p className="mt-2 text-xs text-sky-300">
                    Will be sent as: {preview.text}
                  </p>
                )}

                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Typed text is redacted in this browser before it is sent (rule-based: names,
                  phone numbers, account numbers, UPI IDs, emails; unusual names can slip
                  through). Removed so far: {s.redactedBeforeSend}.
                  {liveKind === "replay" &&
                    " The replay scenario itself is read by the backend from its own file."}
                </p>
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-xs uppercase tracking-widest text-slate-400">Signals</h2>
            {s.signals.map((g, i) => (
              <div key={i} className="mb-2">
                <p
                  className={`text-sm ${
                    g.severity === "critical" ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {g.severity === "critical" ? "⚠" : "✓"} {g.label}
                </p>
                <p className="text-xs text-slate-500">{g.evidence}</p>
              </div>
            ))}
          </div>
        </div>
        <AttackGraph />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StageBar />
        <ScamDNACard />
        <ShadowPathCard />
        <PrivacyPanel />
      </section>

      {s.pause && (
        <RealityPause reasons={s.pause.reasons} explanation={s.pause.explanation} onClose={s.reset} />
      )}
    </main>
  );
}