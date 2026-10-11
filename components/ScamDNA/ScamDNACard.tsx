"use client";
import { useAegis } from "@/hooks/useAegis";

export function ScamDNACard() {
  const dna = useAegis((s) => s.dna);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Matches a known scam</h2>
      {dna ? (
        <>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-neutral-900">{dna.matchPct}%</span>
            <span className="text-xs text-neutral-500">same steps</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full bg-neutral-900 transition-all duration-700" style={{ width: `${dna.matchPct}%` }} />
          </div>
          <p className="mt-3 text-sm font-medium text-neutral-800">{dna.pattern}</p>
          <p className="text-xs text-neutral-500">Seen in {dna.incidents} reported incidents (demo library)</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-neutral-400">Comparing with known scam workflows.</p>
      )}
    </div>
  );
}
