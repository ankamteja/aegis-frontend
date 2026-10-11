"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAegis } from "@/hooks/useAegis";
import { bankScam } from "@/demo/bankScam";
import { chatScam, chatScamContact } from "@/demo/chatScam";
import { AttackGraph } from "@/components/AttackGraph/AttackGraph";
import { RiskBanner } from "@/components/RiskEngine/RiskBanner";
import { StageBar } from "@/components/ManipulationState/StageBar";
import { ScamDNACard } from "@/components/ScamDNA/ScamDNACard";
import { ShadowPathCard } from "@/components/ShadowPath/ShadowPathCard";
import { PrivacyPanel } from "@/components/PrivacyGate/PrivacyPanel";
import { CallScreen } from "@/components/Phone/CallScreen";
import { ChatScreen } from "@/components/Phone/ChatScreen";
import { PhonePause } from "@/components/Phone/PhonePause";
import { ChatIcon, PhoneIcon } from "@/components/Phone/Icons";

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS ?? "ws://localhost:8000/ws";
const CALL_CONTACT = { name: "Unknown", number: "+91 98•••• ••210" };
const LIVE_CONTACT = { name: "Unknown", number: "Number hidden by AEGIS" };

type Mode = "call" | "chat";
type Pending = { text: string; as: "caller" | "user" } | null;

export default function Home() {
  const s = useAegis();
  const [mode, setMode] = useState<Mode>("call");
  const [run, setRun] = useState(0); // remounts the phone so timers start fresh
  const [dismissed, setDismissed] = useState(false);
  const [ended, setEnded] = useState<string | null>(null);
  const [typed, setTyped] = useState(false); // chat is being typed live, not the scripted demo
  const pending = useRef<Pending>(null);

  const fresh = (m: Mode) => {
    setMode(m);
    setRun((n) => n + 1);
    setDismissed(false);
    setEnded(null);
  };

  const playCall = () => {
    fresh("call");
    setTyped(false);
    s.play(bankScam, 1);
  };
  const playChat = () => {
    fresh("chat");
    setTyped(false);
    s.play(chatScam, 1);
  };

  // A dashboard opened as /?session=<id> follows a real call captured by the audio client.
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session");
    if (sid) useAegis.getState().connectLive(`${WS_URL}?session=${encodeURIComponent(sid)}`);
  }, []);

  // Typing in the chat talks to the AEGIS server; the first message opens the connection.
  const sendChat = (text: string, as: "caller" | "user") => {
    if (s.live && s.connection === "open" && typed) {
      s.sendTurn(as, text);
      return;
    }
    fresh("chat");
    setTyped(true);
    pending.current = { text, as };
    s.connectLive(WS_URL);
  };
  useEffect(() => {
    if (s.connection === "open" && pending.current) {
      const p = pending.current;
      pending.current = null;
      useAegis.getState().sendTurn(p.as, p.text);
    }
  }, [s.connection]);

  const stop = (msg: string) => {
    s.reset();
    setTyped(false);
    setEnded(msg);
  };

  const live = s.live && !typed; // following a real call from the audio client
  const contact = mode === "chat" ? (typed ? LIVE_CONTACT : chatScamContact) : live ? LIVE_CONTACT : CALL_CONTACT;
  const showPause = !!s.pause && !dismissed;
  const failed = s.connection === "failed" || s.errors.length > 0;

  return (
    <main className="min-h-screen bg-[#f5f5f4] p-4 text-neutral-900 md:p-6">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">AEGIS</h1>
          <p className="text-xs text-neutral-500">Stops scam calls and chats before the OTP or the payment</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={playCall} className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 font-medium text-white hover:bg-neutral-700">
            <PhoneIcon className="h-4 w-4" /> Play scam call
          </button>
          <button onClick={playChat} className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-1.5 font-medium text-white hover:bg-neutral-700">
            <ChatIcon className="h-4 w-4" /> Play scam chat
          </button>
          <button
            onClick={() => {
              s.reset();
              setTyped(false);
              fresh(mode);
            }}
            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 hover:bg-neutral-100"
          >
            Reset
          </button>
          <Link href="/bank" className="px-2 text-neutral-500 hover:text-neutral-900">
            Bank app view
          </Link>
          <Link href="/patterns" className="px-2 text-neutral-500 hover:text-neutral-900">
            Patterns
          </Link>
        </nav>
      </header>

      {failed && (
        <div className="mx-auto mt-4 flex max-w-7xl items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          <p>
            {s.errors.length > 0
              ? s.errors[s.errors.length - 1]
              : "Can't reach the AEGIS server. The demo call and chat still work; typing your own messages needs the backend running."}
          </p>
          <button onClick={s.clearErrors} className="shrink-0 text-xs text-red-700 hover:text-red-900">
            Dismiss
          </button>
        </div>
      )}

      <div className="mx-auto mt-5 grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        {/* The user's phone */}
        <section className="mx-auto w-full max-w-[380px]">
          <div className="mb-3 flex justify-center gap-1 rounded-full border border-neutral-200 bg-white p-1 text-sm">
            {(["call", "chat"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m !== mode) {
                    s.reset();
                    setTyped(false);
                    fresh(m);
                  }
                }}
                className={`flex-1 rounded-full py-1.5 ${mode === m ? "bg-neutral-900 font-medium text-white" : "text-neutral-500"}`}
              >
                {m === "call" ? "Phone call" : "Chat"}
              </button>
            ))}
          </div>
          <div className="relative h-[720px] overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-black shadow-xl">
            <div className="absolute left-1/2 top-2 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            {mode === "call" ? (
              <CallScreen
                key={run}
                contact={contact}
                lines={s.transcript}
                active={s.running}
                level={s.risk.level}
                drivers={s.risk.drivers}
                onEnd={() => stop("Call ended.")}
              />
            ) : (
              <ChatScreen
                key={run}
                contact={contact}
                lines={s.transcript}
                level={s.risk.level}
                drivers={s.risk.drivers}
                onSend={sendChat}
                canType
              />
            )}
            {showPause && (
              <PhonePause
                channel={mode}
                explanation={s.pause?.explanation}
                reasons={s.pause?.reasons ?? []}
                onStop={() =>
                  stop(mode === "call" ? "You hung up before sharing anything." : "You stopped replying and blocked the number.")
                }
                onContinue={() => setDismissed(true)}
              />
            )}
            {ended && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white px-8 text-center">
                <p className="text-lg font-medium">{ended}</p>
                <p className="text-sm text-neutral-500">
                  Call your bank on the number printed on your card, or the cyber-fraud helpline 1930.
                </p>
                <button onClick={() => setEnded(null)} className="mt-2 rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white">
                  Close
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-[11px] text-neutral-500">
            Names, numbers, UPI IDs and OTPs are removed on the phone before AEGIS analyses anything.
          </p>
        </section>

        {/* What AEGIS sees */}
        <section className="space-y-4">
          <RiskBanner />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StageBar />
            <div className="max-h-[260px] overflow-auto rounded-xl border border-neutral-200 bg-white p-4">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">What the scammer did</h2>
              {s.signals.length === 0 && <p className="text-sm text-neutral-400">Nothing suspicious yet.</p>}
              {s.signals.map((g, i) => (
                <div key={i} className="mb-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${g.severity === "critical" ? "bg-red-600" : "bg-amber-500"}`} />
                    {g.label}
                  </p>
                  <p className="pl-4 text-xs italic text-neutral-500">“{g.evidence}”</p>
                </div>
              ))}
            </div>
            <ScamDNACard />
            <ShadowPathCard />
          </div>
          <AttackGraph />
          <PrivacyPanel />
        </section>
      </div>
    </main>
  );
}
