"use client";
import { useAegis } from "@/hooks/useAegis";

export function PrivacyPanel() {
  const p = useAegis((s) => s.privacy);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Privacy</h2>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div><dd className="text-2xl font-semibold">{p.detected}</dd><dt className="text-[11px] text-neutral-500">personal details found</dt></div>
        <div><dd className="text-2xl font-semibold">{p.removed}</dd><dt className="text-[11px] text-neutral-500">removed on the phone</dt></div>
        <div><dd className="text-2xl font-semibold">{p.transmitted}</dd><dt className="text-[11px] text-neutral-500">sent anywhere</dt></div>
      </dl>
    </div>
  );
}
