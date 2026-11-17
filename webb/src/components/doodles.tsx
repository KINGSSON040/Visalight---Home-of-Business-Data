/** Handritade detaljer: understrykning, pil, gnista och mjuka färgklumpar. Alla är dekor och döljs för skärmläsare. */

export function Squiggle({ className = "", color = "var(--coral)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M4 16c22-9 40-10 58-3s34 8 52 0 36-11 56-3 38 9 58 1 34-9 68-4"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Arrow({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      <path d="M8 14c26-6 58 0 74 22 8 11 10 22 8 32" fill="none" stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M74 58l16 12 10-18" fill="none" stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sparkle({ className = "", color = "var(--sun)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 2l4.6 13.4L38 20l-13.4 4.6L20 38l-4.6-13.4L2 20l13.4-4.6z"
        fill={color}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BLOBS = [
  "M44 -38C58 -24 70 -10 68 6C66 22 50 38 32 48C14 58 -6 62 -24 54C-42 46 -58 26 -62 4C-66 -18 -58 -42 -40 -56C-22 -70 6 -74 22 -66C38 -58 30 -52 44 -38Z",
  "M38 -50C50 -40 60 -26 64 -8C68 10 66 30 52 44C38 58 12 66 -10 62C-32 58 -50 42 -60 22C-70 2 -72 -22 -60 -38C-48 -54 -22 -62 -2 -62C18 -62 26 -60 38 -50Z",
];

export function Blob({ className = "", color, shape = 0, slow = false }: { className?: string; color: string; shape?: 0 | 1; slow?: boolean }) {
  return (
    <svg viewBox="-80 -80 160 160" className={`blob ${slow ? "slow" : ""} ${className}`} aria-hidden="true">
      <path d={BLOBS[shape]} fill={color} />
    </svg>
  );
}
