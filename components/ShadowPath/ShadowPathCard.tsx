"use client";
import { useAegis } from "@/hooks/useAegis";

export function ShadowPathCard() {
  const path = useAegis((s) => s.path);
  const signals = useAegis((s) => s.signals);
  const current = signals.length ? signals[signals.length - 1].label : null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">What the scammer will ask next</h2>
      {path ? (
        <>
          <p className="mt-3 text-xs text-neutral-500">Now: {current}</p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">{path.next}</p>
          <p className="text-xs text-neutral-500">{path.confidence}% likely</p>
          <ul className="mt-2 space-y-0.5 text-xs text-neutral-500">
            {path.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-neutral-400">Not enough to predict yet.</p>
      )}
    </div>
  );
}
