// Small line icons (24px grid, stroke = currentColor), so the UI needs no emoji or icon font.
type P = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const HANDSET =
  "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z";

export const PhoneIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d={HANDSET} />
  </svg>
);

export const EndCallIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden style={{ transform: "rotate(135deg)" }}>
    <path d={HANDSET} />
  </svg>
);

export const ChatIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const MicIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
  </svg>
);

export const SpeakerIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const KeypadIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden fill="currentColor" stroke="none">
    {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
  </svg>
);

export const SendIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

export const BackIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const AlertIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const ShieldIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
