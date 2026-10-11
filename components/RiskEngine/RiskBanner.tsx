"use client";
import { useAegis } from "@/hooks/useAegis";

const STYLE = {
  NORMAL: "border-neutral-200 bg-white text-neutral-900",
  WATCH: "border-amber-300 bg-amber-50 text-amber-950",
  INTERVENE: "border-orange-300 bg-orange-50 text-orange-950",
  CRITICAL: "border-red-300 bg-red-50 text-red-900",
} as const;

const DOT = {
  NORMAL: "bg-neutral-300",
  WATCH: "bg-amber-500",
  INTERVENE: "bg-orange-500",
  CRITICAL: "bg-red-600",
} as const;

const MESSAGE = {
  NORMAL: "No scam pattern so far.",
  WATCH: "Early warning signs. AEGIS keeps watching quietly.",
  INTERVENE: "The pattern is escalating. A warning is shown on the phone.",
  CRITICAL: "A payment or OTP request is close. The user is paused now.",
} as const;

const LABEL = { NORMAL: "Normal", WATCH: "Watch", INTERVENE: "Intervene", CRITICAL: "Critical" } as const;

export function RiskBanner() {
  const risk = useAegis((s) => s.risk);
  return (
    <div className={`rounded-xl border px-4 py-3 transition-colors duration-500 ${STYLE[risk.level]}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT[risk.level]}`} />
        <span className="text-lg font-semibold">{LABEL[risk.level]}</span>
        <span className="text-sm opacity-80">{MESSAGE[risk.level]}</span>
      </div>
      {risk.drivers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {risk.drivers.map((d) => (
            <span key={d} className="rounded-full border border-current/20 bg-white/60 px-2 py-0.5">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
