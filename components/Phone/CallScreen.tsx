"use client";
import { useEffect, useRef, useState } from "react";
import type { RiskLevel } from "@/types/events";
import { AegisChip } from "./AegisChip";
import { EndCallIcon, KeypadIcon, MicIcon, SpeakerIcon } from "./Icons";

type Line = { speaker: string; text: string };

function clock(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

// A phone call as the user sees it, with live captions that AEGIS reads on the device.
export function CallScreen({
  contact,
  lines,
  active,
  level,
  drivers,
  onEnd,
}: {
  contact: { name: string; number: string };
  lines: Line[];
  active: boolean;
  level: RiskLevel;
  drivers: string[];
  onEnd: () => void;
}) {
  const [sec, setSec] = useState(0);
  const started = lines.length > 0;
  const capRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !started) return;
    const t = setInterval(() => setSec((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active, started]);

  useEffect(() => {
    capRef.current?.scrollTo({ top: capRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  return (
    <div className="flex h-full flex-col bg-[#1c1c1e] text-white">
      <div className="px-5 pt-10 text-center">
        <AegisChip level={level} drivers={drivers} dark />
        <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-600 text-3xl">
          {contact.name.slice(0, 1)}
        </div>
        <p className="mt-3 text-2xl font-light">{contact.name}</p>
        <p className="text-sm text-neutral-400">{contact.number}</p>
        <p className="mt-1 text-sm text-neutral-300">{active && started ? clock(sec) : active ? "Calling…" : "Call ended"}</p>
      </div>

      <div ref={capRef} className="mt-4 flex-1 space-y-2 overflow-y-auto px-4">
        {lines.slice(-6).map((l, i) => (
          <div key={`${lines.length}-${i}`} className={`flex ${l.speaker === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                l.speaker === "user" ? "bg-white/20" : "bg-white/10"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide text-white/50">
                {l.speaker === "user" ? "You" : "Caller"}
              </span>
              {l.text}
            </p>
          </div>
        ))}
        {!started && <p className="pt-6 text-center text-xs text-neutral-500">Live captions appear here</p>}
      </div>

      <div className="grid grid-cols-3 gap-y-4 px-8 pb-4 pt-4 text-center text-[11px] text-neutral-300">
        {(
          [
            ["Mute", MicIcon],
            ["Keypad", KeypadIcon],
            ["Speaker", SpeakerIcon],
          ] as const
        ).map(([b, Icon]) => (
          <div key={b} className="flex flex-col items-center gap-1">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Icon className="h-6 w-6" />
            </span>
            {b}
          </div>
        ))}
      </div>
      <div className="flex justify-center pb-8">
        <button
          onClick={onEnd}
          aria-label="End call"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff3b30] hover:bg-red-500"
        >
          <EndCallIcon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
