"use client";
import { useState } from "react";
import Link from "next/link";
import { useAegis } from "@/hooks/useAegis";
import { bankScam } from "@/demo/bankScam";
import { AegisChip } from "@/components/Phone/AegisChip";
import { PhonePause } from "@/components/Phone/PhonePause";

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS ?? "ws://localhost:8000/ws";

type Outcome = "none" | "stopped" | "paid";

// Bank / UPI app view: the Reality Pause lands on the payment screen itself,
// before the user enters the UPI PIN. This is where an SDK inside the bank app would act.
export default function BankApp() {
  const s = useAegis();
  const [outcome, setOutcome] = useState<Outcome>("none");
  const [dismissed, setDismissed] = useState(false);
  const [pin, setPin] = useState("");
  const [run, setRun] = useState(0);

  const paused = !!s.pause && !dismissed && outcome === "none";
  const lastCaller = [...s.transcript].reverse().find((t) => t.speaker === "caller");

  const start = (live: boolean) => {
    setOutcome("none");
    setDismissed(false);
    setPin("");
    setRun((n) => n + 1);
    if (live) s.connectLive(`${WS_URL}?replay=bank_scam&speed=1`);
    else s.play(bankScam, 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-[#f5f5f4] p-4 text-neutral-900 md:p-6">
      <header className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">AEGIS in a bank app</h1>
          <p className="text-xs text-neutral-500">The pause lands on the payment screen, before the UPI PIN</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => start(false)} className="rounded-full bg-neutral-900 px-4 py-1.5 font-medium text-white hover:bg-neutral-700">
            Play scam call
          </button>
          <button onClick={() => start(true)} className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 hover:bg-neutral-100">
            Use AEGIS server
          </button>
          <Link href="/" className="px-2 text-neutral-500 hover:text-neutral-900">
            ← Back
          </Link>
        </nav>
      </header>

      <div className="relative h-[720px] w-full max-w-[380px] overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-white text-neutral-900 shadow-xl">
        {/* Ongoing call strip */}
        <div className="bg-[#34c759] px-4 pb-3 pt-8 text-white">
          <div className="flex items-center justify-between text-xs">
            <span>{s.running ? "On call · +91 98•••• ••210" : "No call"}</span>
            <span>Tap to return</span>
          </div>
          {lastCaller && <p className="mt-1 line-clamp-2 text-xs italic text-white/90">“{lastCaller.text}”</p>}
        </div>
        <div className="border-b border-neutral-100 px-3 py-1.5">
          <AegisChip level={s.risk.level} drivers={s.risk.drivers} />
        </div>

        {/* UPI payment screen */}
        <div className="px-5 pb-6 pt-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Send money · UPI</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-700">
              R
            </div>
            <div>
              <p className="font-medium">RBI Safe Account</p>
              <p className="text-xs text-neutral-500">safe.verify@ybl · not in your contacts</p>
            </div>
          </div>
          <p className="mt-5 text-4xl font-bold">₹49,999</p>
          <p className="text-xs text-neutral-500">From savings ••4821 · Note: “account verification”</p>

          <label className="mt-6 block text-xs text-neutral-500" htmlFor="pin">
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
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 tracking-[0.5em] disabled:bg-neutral-100"
          />
          <button
            disabled={paused || outcome !== "none" || pin.length < 4}
            onClick={() => setOutcome("paid")}
            className="mt-4 w-full rounded-lg bg-neutral-900 py-3 font-semibold text-white disabled:bg-neutral-300"
          >
            Pay ₹49,999
          </button>

          {outcome === "stopped" && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">
              Payment cancelled and call ended. Call your bank on the number printed on your card, or 1930.
            </p>
          )}
          {outcome === "paid" && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Demo only: no money moved. The user chose to continue after the warning; that dismissal is counted as a
              possible false alarm.
            </p>
          )}
        </div>

        {paused && (
          <div className="absolute inset-x-0 bottom-0 top-[6.5rem] overflow-hidden rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
          <PhonePause
            key={run}
            channel="payment"
            explanation={s.pause?.explanation}
            reasons={s.pause?.reasons ?? []}
            onStop={() => {
              setOutcome("stopped");
              s.reset();
            }}
            onContinue={() => setDismissed(true)}
          />
          </div>
        )}
      </div>

      <p className="max-w-md text-center text-xs text-neutral-500">
        Mock UPI screen. Nothing is blocked automatically: the user decides, after a short wait.
      </p>
    </main>
  );
}
