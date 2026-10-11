export type Stage = "TRUST" | "AUTHORITY" | "URGENCY" | "ISOLATION" | "COMPLIANCE" | "MONEY_MOVEMENT";
export type RiskLevel = "NORMAL" | "WATCH" | "INTERVENE" | "CRITICAL";

// Plain-language alert produced by aegis-core (explain.py), in English and Hindi.
export type Bilingual = { en: string; hi: string };
export type Explanation = {
  headline: Bilingual;
  reasons: (Bilingual & { signal: string; quote: string })[];
  advice: Bilingual[];
  next_step: Bilingual;
};

export type AegisEvent =
  | { type: "transcript"; at: number; speaker: "caller" | "user"; text: string }
  | { type: "signal"; at: number; label: string; severity: "info" | "warn" | "critical"; evidence: string }
  | { type: "stage"; at: number; stage: Stage; progress: number; reason: string }
  | { type: "graph_node"; at: number; id: string; label: string; parent?: string; predicted?: boolean }
  | { type: "scam_dna"; at: number; matchPct: number; pattern: string; incidents: number }
  | { type: "shadowpath"; at: number; next: string; confidence: number; evidence: string[] }
  | { type: "risk"; at: number; level: RiskLevel; drivers: string[] }
  | { type: "privacy"; at: number; detected: number; removed: number; transmitted: number }
  | { type: "reality_pause"; at: number; reasons: string[]; explanation?: Explanation };