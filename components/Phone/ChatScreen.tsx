"use client";
import { useEffect, useRef, useState } from "react";
import type { RiskLevel } from "@/types/events";
import { AegisChip } from "./AegisChip";
import { BackIcon, SendIcon } from "./Icons";

type Line = { speaker: string; text: string };

function stamp(i: number) {
  const m = 30 + i; // 7:30 PM onwards, one message a minute
  return `7:${String(m % 60).padStart(2, "0")} PM`;
}

// A messaging app thread. Typed messages go to AEGIS after this browser removes personal details.
export function ChatScreen({
  contact,
  lines,
  level,
  drivers,
  onSend,
  canType,
}: {
  contact: { name: string; number: string };
  lines: Line[];
  level: RiskLevel;
  drivers: string[];
  onSend: (text: string, as: "caller" | "user") => void;
  canType: boolean;
}) {
  const [text, setText] = useState("");
  const [as, setAs] = useState<"caller" | "user">("caller");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t, as);
    setText("");
  };

  return (
    <div className="flex h-full flex-col bg-[#efeae2] text-neutral-900">
      <div className="flex items-center gap-3 bg-[#f0f2f5] px-3 pb-3 pt-9 border-b border-black/5">
        <BackIcon className="h-5 w-5 text-neutral-500" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-400 font-semibold text-white">
          {contact.name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{contact.name}</p>
          <p className="truncate text-[11px] text-neutral-500">{contact.number} · not in your contacts</p>
        </div>
      </div>

      <div className="px-3 pt-2">
        <AegisChip level={level} drivers={drivers} />
      </div>

      <div ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {lines.length === 0 && (
          <p className="mx-auto mt-6 w-fit rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-[11px] text-neutral-600">
            Play the demo chat, or type a message below
          </p>
        )}
        {lines.map((l, i) => (
          <div key={i} className={`flex ${l.speaker === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-[13px] leading-snug shadow-sm ${
                l.speaker === "user" ? "rounded-tr-none bg-[#d9fdd3]" : "rounded-tl-none bg-white"
              }`}
            >
              {l.text}
              <span className="ml-2 align-bottom text-[10px] text-neutral-500">{stamp(i)}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#f0f2f5] px-3 pb-6 pt-2">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-neutral-500">
          Typing as
          {(["caller", "user"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setAs(w)}
              aria-pressed={as === w}
              className={`rounded-full px-2 py-0.5 ${as === w ? "bg-neutral-900 text-white" : "bg-white"}`}
            >
              {w === "caller" ? "Scammer" : "Me"}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!canType}
            placeholder={as === "caller" ? "Message from the scammer" : "Your reply"}
            className="flex-1 rounded-full bg-white px-4 py-2 text-sm outline-none placeholder:text-neutral-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canType || !text.trim()}
            aria-label="Send"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-white disabled:opacity-40"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
