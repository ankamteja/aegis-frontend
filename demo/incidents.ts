export type Step =
  | "AUTHORITY" | "URGENCY" | "CHANNEL_SHIFT" | "ISOLATION"
  | "REMOTE_ACCESS" | "CREDENTIALS" | "TRANSFER" | "LURE" | "TRUST";

export type Incident = { id: string; label: string; surface: string; steps: Step[] };

export const STEP_LABEL: Record<Step, string> = {
  AUTHORITY: "Authority claim",
  URGENCY: "Urgency",
  CHANNEL_SHIFT: "Channel shift",
  ISOLATION: "Isolation",
  REMOTE_ACCESS: "Remote access",
  CREDENTIALS: "Credential request",
  TRANSFER: "Money transfer",
  LURE: "Reward lure",
  TRUST: "Rapport building",
};

export const STEP_COLOR: Record<Step, string> = {
  AUTHORITY: "bg-neutral-100 text-neutral-800 border-neutral-300",
  URGENCY: "bg-neutral-100 text-neutral-800 border-neutral-300",
  CHANNEL_SHIFT: "bg-neutral-100 text-neutral-800 border-neutral-300",
  ISOLATION: "bg-neutral-100 text-neutral-800 border-neutral-300",
  REMOTE_ACCESS: "bg-red-50 text-red-800 border-red-200",
  CREDENTIALS: "bg-red-50 text-red-800 border-red-200",
  TRANSFER: "bg-red-50 text-red-800 border-red-200",
  LURE: "bg-neutral-100 text-neutral-800 border-neutral-300",
  TRUST: "bg-neutral-100 text-neutral-800 border-neutral-300",
};

// Safe lookups: never crash on a step name we don't know.
export const stepLabel = (s: string): string =>
  STEP_LABEL[s as Step] ??
  s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export const stepColor = (s: string): string =>
  STEP_COLOR[s as Step] ?? "bg-neutral-100 text-neutral-800 border-neutral-300";

export const incidents: Incident[] = [
  { id: "A", label: "Incident A", surface: "Bank · WhatsApp",
    steps: ["AUTHORITY", "URGENCY", "CHANNEL_SHIFT", "REMOTE_ACCESS", "CREDENTIALS", "TRANSFER"] },
  { id: "B", label: "Incident B", surface: "Courier · Telegram",
    steps: ["AUTHORITY", "URGENCY", "CHANNEL_SHIFT", "ISOLATION", "REMOTE_ACCESS", "TRANSFER"] },
  { id: "C", label: "Incident C", surface: "UPI support · WhatsApp",
    steps: ["AUTHORITY", "URGENCY", "CHANNEL_SHIFT", "REMOTE_ACCESS", "TRANSFER"] },
];

export const newIncident: Incident = {
  id: "D", label: "New incident", surface: "Telecom KYC · Telegram (in progress)",
  steps: ["AUTHORITY", "URGENCY", "CHANNEL_SHIFT"],
};