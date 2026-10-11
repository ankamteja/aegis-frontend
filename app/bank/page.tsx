"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAegis } from "@/hooks/useAegis";
import { bankScam } from "@/demo/bankScam";

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS ?? "ws://localhost:8000/ws";
const HOLD_SECONDS = 10; // friction before "continue anyway" unlocks

type Lang = "en" | "hi";
type Outcome = "none" | "hung_up" | "paid";

const LEVEL_STYLE: Record<string, string> = {
  NORMAL: "bg-emerald-500/20 text-emerald-300",
  WATCH: "bg-amber-500/20 text-amber-300",
  INTERVENE: "bg-orange-500/20 text-orange-300",
  CRITICAL: "bg-red-500/30 text-red-200",
};

// Bank / UPI app view: the Reality Pause lands on the payment screen itself,
// before the user enters the UPI PIN. This is where an SDK inside the bank app would act.
export default function BankApp() {
  const s = useAegis();
  const [lang, setLang] = useState<Lang>("en");
  const [outcome, setOutcome] = useState<Outcome>("none");
  const [pin, setPin] = useState("");
  const [left, setLeft] = useState(HOLD_SECONDS);

  const paused = !!s.pause && outcome === "none";
  const ex = s.pause?.explanation;
  const lastCaller = [...s.transcript].reverse().find((t) => t.speaker === "caller");

  // Countdown runs only while the pause is on screen.
  useEffect(() => {
    if (!paused || left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [paused, left]);

  const start = (live: boolean) => {
    setOutcome("none");
    setPin("");
    setLeft(HOLD_SECONDS);
    if (live) s.connectLive(`${WS_URL}?replay=bank_scam&speed=1`);
    else s.play(bankScam, 1);
  };

  const hangUp = () => {
    setOutcome("hung_up");
    s.reset();
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-slate-950 p-4 text-slate-100">
      <header className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-2">
        <h1 className="font-semibold tracking-wide">AEGIS · bank app view</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-slate-200">
            ← Dashboard
          </Link>
          <button className="rounded bg-emerald-600 px-3 py-1" onClick={() => start(false)}>
            Start demo call
          </button>
          <button className="rounded bg-indigo-600 px-3 py-1" onClick={() => start(true)}>
            Live (replay)
          </button>
        </div>
      </header>

      {/* Phone */}
      <div className="relative min-h-[720px] w-full max-w-[380px] overflow-hidden rounded-[2rem] border-4 border-slate-700 bg-white text-slate-900 shadow-2xl">
        {/* Ongoing call strip */}
        <div className="bg-slate-900 px-4 py-3 text-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${s.running ? "animate-pulse bg-red-500" : "bg-slate-500"}`} />
              {s.running ? "On call · Unknown number" : "No active call"}
            </span>
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${LEVEL_STYLE[s.risk.level]}`}>
              AEGIS {s.risk.level}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs italic text-slate-300">
            {lastCaller ? `“${lastCaller.text}”` : "Caller audio is turned into text on this phone only."}
          </p>
        </div>

        {/* UPI payment screen */}
        <div className="px-5 pb-6 pt-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Send money · UPI</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              R
            </div>
            <div>
              <p className="font-medium">RBI Safe Account</p>
              <p className="text-xs text-slate-500">safe.verify@ybl · not in your contacts</p>
            </div>
          </div>
          <p className="mt-5 text-4xl font-bold">₹49,999</p>
          <p className="text-xs text-slate-500">From savings ••4821 · Note: “account verification”</p>

          <label className="mt-6 block text-xs text-slate-500" htmlFor="pin">
            Enter UPI PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            disabled={paused || outcome !== "none"}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tracking-[0.5em] disabled:bg-slate-100"
          />
          <button
            disabled={paused || outcome !== "none" || pin.length < 4}
            onClick={() => setOutcome("paid")}
            className="mt-4 w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white disabled:bg-slate-300"
          >
            Pay ₹49,999
          </button>

          {outcome === "hung_up" && (
            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              Payment cancelled and call ended. Call your bank on the number printed on your card, or 1930.
            </p>
          )}
          {outcome === "paid" && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Demo only: no money moved. In a real app the user chose to continue after the warning; that dismissal is
              counted as a possible false alarm.
            </p>
          )}
        </div>

        {/* Reality Pause over the payment screen */}
        {paused && (
          <div
            role="alertdialog"
            aria-labelledby="bank-pause-title"
            className="absolute inset-x-0 bottom-0 top-[5.5rem] overflow-y-auto bg-white/95 px-5 py-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="bank-pause-title" className="text-lg font-bold text-red-700">
                {lang === "en" ? "Payment paused" : "भुगतान रोका गया"}
              </h2>
              <div className="flex overflow-hidden rounded border border-slate-300 text-xs">
                {(["en", "hi"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`px-2 py-0.5 ${lang === l ? "bg-red-600 font-semibold text-white" : "text-slate-600"}`}
                  >
                    {l === "en" ? "EN" : "हिं"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm font-medium">
              {ex
                ? ex.headline[lang]
                : lang === "en"
                  ? "This call shows the pattern of a scam."
                  : "इस कॉल में धोखाधड़ी जैसे संकेत हैं।"}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {ex
                ? ex.reasons.map((r) => (
                    <li key={r.signal}>
                      • {r[lang]}
                      <span className="block pl-3 text-xs italic text-slate-500">“{r.quote}”</span>
                    </li>
                  ))
                : s.pause?.reasons.map((r) => <li key={r}>• {r}</li>)}
            </ul>
            {ex && ex.advice[0] && (
              <p className="mt-3 rounded bg-red-50 p-2 text-xs text-red-800">{ex.advice[0][lang]}</p>
            )}
            <button onClick={hangUp} className="mt-4 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white">
              {ex ? ex.next_step[lang] : lang === "en" ? "Hang up and call my bank" : "कॉल काटें, बैंक को कॉल करें"}
            </button>
            <button
              disabled={left > 0}
              onClick={() => setOutcome("paid")}
              className="mt-2 w-full rounded-lg py-2 text-sm text-slate-500 disabled:text-slate-300"
            >
              {left > 0
                ? lang === "en"
                  ? `Continue anyway (wait ${left}s)`
                  : `फिर भी जारी रखें (${left} सेकंड रुकें)`
                : lang === "en"
                  ? "Continue anyway"
                  : "फिर भी जारी रखें"}
            </button>
          </div>
        )}
      </div>

      <p className="max-w-md text-center text-xs text-slate-500">
        Mock UPI screen. AEGIS runs inside the bank app, so the pause appears before the UPI PIN is entered. Nothing is
        blocked automatically: the user decides, after a short wait.
      </p>
    </main>
  );
}
