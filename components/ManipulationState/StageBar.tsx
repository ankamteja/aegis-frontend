"use client";
import { useAegis } from "@/hooks/useAegis";
import type { Stage } from "@/types/events";

const STAGES: Stage[] = ["TRUST", "AUTHORITY", "URGENCY", "ISOLATION", "COMPLIANCE", "MONEY_MOVEMENT"];
const NAME: Record<Stage, string> = {
  TRUST: "Trust",
  AUTHORITY: "Authority",
  URGENCY: "Urgency",
  ISOLATION: "Isolation",
  COMPLIANCE: "Compliance",
  MONEY_MOVEMENT: "Money",
};

export function StageBar() {
  const stage = useAegis((s) => s.stage);
  const current = stage ? STAGES.indexOf(stage.stage) : -1;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Where the scam is</h2>
      <ol className="mt-3 grid grid-cols-6 gap-1">
        {STAGES.map((st, i) => (
          <li key={st} className="text-center">
            <div
              className={`h-1.5 rounded-full ${
                i < current ? "bg-neutral-400" : i === current ? (st === "MONEY_MOVEMENT" ? "bg-red-600" : "bg-neutral-900") : "bg-neutral-200"
              }`}
            />
            <span className={`mt-1 block text-[10px] ${i === current ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>
              {NAME[st]}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 min-h-[2.5rem] text-sm text-neutral-700">{stage?.reason ?? "Waiting for the conversation."}</p>
      <p className="text-[10px] text-neutral-400">From what the caller says, not a guess about the user.</p>
    </div>
  );
}
