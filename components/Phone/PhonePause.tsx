"use client";
import { useEffect, useState } from "react";
import type { Explanation } from "@/types/events";
import { AlertIcon } from "./Icons";

export type Lang = "en" | "hi";
export type Channel = "call" | "chat" | "payment";

const HOLD_SECONDS = 10; // friction before "continue anyway" unlocks

const TITLE: Record<Channel, Record<Lang, string>> = {
  call: { en: "Stop. This call looks like a scam", hi: "रुकिए। यह कॉल धोखाधड़ी लग रही है" },
  chat: { en: "Stop. This chat looks like a scam", hi: "रुकिए। यह चैट धोखाधड़ी लग रही है" },
  payment: { en: "Payment paused", hi: "भुगतान रोका गया" },
};

// Core's alert text is written for calls; in a chat the next step is to stop replying.
const CHAT_NEXT = {
  en: "Stop replying and block this number. If money is involved, call your bank or 1930.",
  hi: "जवाब देना बंद करें और इस नंबर को ब्लॉक करें। पैसे की बात हो तो बैंक या 1930 पर कॉल करें।",
};

function forChannel(text: string, channel: Channel) {
  if (channel !== "chat") return text;
  return text.replace(/\bcall\b/g, "chat").replace(/कॉल/g, "चैट");
}

// Reality Pause drawn inside the phone, over whatever the user is looking at.
export function PhonePause({
  channel,
  explanation,
  reasons,
  onStop,
  onContinue,
}: {
  channel: Channel;
  explanation?: Explanation;
  reasons: string[];
  onStop: () => void;
  onContinue: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [left, setLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const next = explanation
    ? channel === "chat"
      ? CHAT_NEXT[lang]
      : explanation.next_step[lang]
    : lang === "en"
      ? "Stop and call your bank on the number printed on your card, or 1930."
      : "रुकिए, कार्ड पर छपे नंबर पर बैंक को या 1930 पर कॉल करें।";

  return (
    <div
      role="alertdialog"
      aria-labelledby="phone-pause-title"
      className="absolute inset-0 z-20 flex flex-col overflow-y-auto bg-white px-5 pb-5 pt-10 text-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertIcon className="h-5 w-5" />
        </span>
        <div className="flex overflow-hidden rounded-full border border-neutral-300 text-xs">
          {(["en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-3 py-1 ${lang === l ? "bg-neutral-900 font-semibold text-white" : "text-neutral-600"}`}
            >
              {l === "en" ? "EN" : "हिं"}
            </button>
          ))}
        </div>
      </div>
      <h2 id="phone-pause-title" className="mt-3 text-xl font-bold leading-tight text-red-700">
        {TITLE[channel][lang]}
      </h2>
      {explanation && (
        <p className="mt-1 text-sm text-neutral-600">{forChannel(explanation.headline[lang], channel)}</p>
      )}

      <ul className="mt-4 space-y-3 text-sm">
        {explanation
          ? explanation.reasons.map((r) => (
              <li key={r.signal} className="rounded-xl bg-neutral-100 px-3 py-2">
                <p className="font-medium">{r[lang]}</p>
                <p className="mt-0.5 text-xs italic text-neutral-500">“{r.quote}”</p>
              </li>
            ))
          : reasons.map((r) => (
              <li key={r} className="rounded-xl bg-neutral-100 px-3 py-2 font-medium">
                {r}
              </li>
            ))}
      </ul>

      {explanation && explanation.advice[0] && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">{explanation.advice[0][lang]}</p>
      )}

      <div className="mt-auto pt-5">
        <button onClick={onStop} className="w-full rounded-2xl bg-neutral-900 px-3 py-3 font-semibold text-white">
          {next}
        </button>
        <button
          disabled={left > 0}
          onClick={onContinue}
          className="mt-2 w-full py-2 text-sm text-neutral-500 disabled:text-neutral-300"
        >
          {lang === "en" ? "Continue anyway" : "फिर भी जारी रखें"}
          {left > 0 && (lang === "en" ? ` (${left}s)` : ` (${left} सेकंड)`)}
        </button>
      </div>
    </div>
  );
}
