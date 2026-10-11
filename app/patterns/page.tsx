"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  incidents as demoIncidents,
  newIncident,
  stepLabel,
  stepColor,
  type Incident,
} from "@/demo/incidents";
import { averagePairSimilarity, predictNext, similarity } from "@/services/patterns";

const HTTP_URL = process.env.NEXT_PUBLIC_BACKEND_HTTP;

function clean(data: unknown): Incident[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (d) =>
        d &&
        typeof d.id !== "undefined" &&
        Array.isArray(d.steps) &&
        d.steps.length >= 2 &&
        d.steps.every((x: unknown) => typeof x === "string")
    )
    .map((d) => ({
      id: String(d.id),
      label: String(d.label ?? `Incident ${d.id}`),
      surface: String(d.surface ?? ""),
      steps: d.steps,
    }));
}

// Greedy pick of up to n incidents with the most different step sequences.
function pickDistinct(list: Incident[], n = 3): Incident[] {
  const unique: Incident[] = [];
  const seen = new Set<string>();
  for (const inc of list) {
    const key = inc.steps.join(">");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(inc);
    }
  }
  if (unique.length <= n) return unique;
  const chosen = [unique[0]];
  while (chosen.length < n) {
    let best: Incident | null = null;
    let bestScore = -1;
    for (const cand of unique) {
      if (chosen.includes(cand)) continue;
      const minDist = Math.min(...chosen.map((c) => 1 - similarity(cand.steps, c.steps)));
      if (minDist > bestScore) {
        bestScore = minDist;
        best = cand;
      }
    }
    if (!best) break;
    chosen.push(best);
  }
  return chosen;
}

function Row({ inc, predicted }: { inc: Incident; predicted?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{inc.label}</span>
        <span className="text-xs text-neutral-500">{inc.surface}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {inc.steps.map((st, i) => (
          <span key={st + i} className="flex items-center gap-2">
            <span className={`rounded border px-2 py-1 text-xs ${stepColor(st)}`}>
              {stepLabel(st)}
            </span>
            {(i < inc.steps.length - 1 || predicted) && <span className="text-neutral-400">→</span>}
          </span>
        ))}
        {predicted && (
          <span className="rounded border-2 border-dashed border-amber-500 px-2 py-1 text-xs text-amber-900">
            {predicted}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Patterns() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [library, setLibrary] = useState<Incident[]>(demoIncidents);
  const [fromBackend, setFromBackend] = useState(false);

  useEffect(() => {
    if (!HTTP_URL) return;
    const ctrl = new AbortController();
    fetch(`${HTTP_URL}/library/incidents`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const valid = clean(data);
        if (valid.length >= 2) {
          setLibrary(valid);
          setFromBackend(true);
        }
      })
      .catch(() => {
        /* backend down: keep demo data */
      });
    return () => ctrl.abort();
  }, []);

  const shown = useMemo(
    () => (fromBackend ? pickDistinct(library, 3) : demoIncidents),
    [fromBackend, library]
  );
  const n = shown.length;
  const last = n + 2; // incidents..., similarity, new incident

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 2200);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  const sim = Math.round(averagePairSimilarity(shown) * 100);
  const pred = predictNext(newIncident.steps, fromBackend ? library : demoIncidents);

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-4 bg-[#f5f5f4] p-4 text-neutral-900">
      <header className="flex items-center justify-between">
        <h1 className="font-semibold tracking-wide">AEGIS · Pattern engine</h1>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Back
          </Link>
          <button
            className="rounded bg-neutral-900 text-white px-3 py-1"
            onClick={() => {
              setStep(1);
              setPlaying(true);
            }}
          >
            Start
          </button>
          <button
            className="rounded bg-neutral-200 px-3 py-1"
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <p className="text-sm text-neutral-500">
        Different brands, languages and channels. Same underlying workflow. Anonymized incidents.
        <span className="ml-2 text-xs text-neutral-400">
          Source: {fromBackend ? `backend library (${library.length} incidents)` : "demo data"}
        </span>
      </p>

      {shown.slice(0, Math.min(step, n)).map((inc) => (
        <Row key={inc.id} inc={inc} />
      ))}

      {step >= n + 1 && (
        <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5 text-center">
          <div className="text-xs uppercase tracking-widest text-neutral-900">
            Structural similarity
          </div>
          <div className="mt-1 text-5xl font-semibold text-neutral-700">{sim}%</div>
          <div className="text-sm text-neutral-700">average across the incidents above</div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Computed from step order (longest common subsequence), ignoring brand and channel names.
          </div>
        </div>
      )}

      {step >= n + 2 && (
        <>
          <Row
            inc={newIncident}
            predicted={pred ? stepLabel(pred.next) : undefined}
          />
          {pred && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              AEGIS recognizes the pattern <b>before the money step</b>. Likely next:{" "}
              <b>{stepLabel(pred.next)}</b>, matched in {pred.votes} of {pred.total} known
              incidents. Early warning would trigger now.
            </div>
          )}
        </>
      )}
    </main>
  );
}