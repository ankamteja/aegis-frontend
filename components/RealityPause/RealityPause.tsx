"use client";
import { useState } from "react";
import type { Explanation } from "@/types/events";

type Lang = "en" | "hi";

const UI = {
  en: {
    title: "⚠️ Pause before continuing",
    fallback: "This interaction shows several patterns associated with financial scams.",
    said: "Caller said",
    unsure: "I'm Not Sure",
    cont: "Continue Anyway",
    verify: "Verify through your bank's official app before continuing.",
  },
  hi: {
    title: "⚠️ आगे बढ़ने से पहले रुकें",
    fallback: "इस बातचीत में वित्तीय धोखाधड़ी जैसे कई संकेत हैं।",
    said: "कॉलर ने कहा",
    unsure: "मुझे पक्का नहीं पता",
    cont: "फिर भी जारी रखें",
    verify: "आगे बढ़ने से पहले अपने बैंक के आधिकारिक ऐप से जांच करें।",
  },
};

export function RealityPause({
  reasons,
  explanation,
  onClose,
}: {
  reasons: string[];
  explanation?: Explanation;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const t = UI[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="alertdialog"
          aria-labelledby="pause-title"
          className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="pause-title" className="text-xl font-semibold text-amber-400">
              {t.title}
            </h2>
            <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-700 text-xs">
              {(["en", "hi"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-2 py-1 ${lang === l ? "bg-amber-500 font-semibold text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-100">
            {explanation ? explanation.headline[lang] : t.fallback}
          </p>

          {explanation ? (
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {explanation.reasons.map((r) => (
                <li key={r.signal}>
                  <div>• {r[lang]}</div>
                  <div className="ml-3 text-xs italic text-slate-400">
                    {t.said}: &ldquo;{r.quote}&rdquo;
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 space-y-1 text-sm text-slate-200">
              {reasons.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}

          {explanation && explanation.advice.length > 0 ? (
            <div className="mt-4 space-y-1 rounded-lg bg-slate-800/60 p-3 text-sm text-slate-100">
              {explanation.advice.map((a) => (
                <p key={a.en}>{a[lang]}</p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-slate-100">{t.verify}</p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-emerald-600 px-3 py-2 font-medium hover:bg-emerald-500"
            >
              {explanation ? explanation.next_step[lang] : "Verify Safely"}
            </button>
            <button onClick={onClose} className="rounded-lg bg-slate-700 py-2 hover:bg-slate-600">
              {t.unsure}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              {t.cont}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
