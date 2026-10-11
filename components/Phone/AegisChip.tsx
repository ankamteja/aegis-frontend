"use client";
import type { RiskLevel } from "@/types/events";
import { ShieldIcon } from "./Icons";

const TEXT: Record<RiskLevel, string> = {
  NORMAL: "Protected by AEGIS",
  WATCH: "Careful: early warning signs",
  INTERVENE: "This looks like a scam pattern",
  CRITICAL: "Do not share or pay anything",
};

const STYLE: Record<RiskLevel, string> = {
  NORMAL: "bg-black/5 text-neutral-500",
  WATCH: "bg-amber-100 text-amber-900",
  INTERVENE: "bg-orange-200 text-orange-950",
  CRITICAL: "bg-red-600 text-white",
};

// The quiet, always-visible part of AEGIS: one line that gets louder as the risk rises.
export function AegisChip({ level, drivers, dark = false }: { level: RiskLevel; drivers: string[]; dark?: boolean }) {
  const style = level === "NORMAL" && dark ? "bg-white/10 text-white/70" : STYLE[level];
  return (
    <div className={`mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${style}`}>
      <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        {TEXT[level]}
        {level !== "NORMAL" && drivers[0] && <span className="opacity-75"> · {drivers[0]}</span>}
      </span>
    </div>
  );
}
