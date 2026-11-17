/** Norrsken på ljus himmel: grönt, magenta och en gul stjärna. Inget blått. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vl-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eafff3" />
        </linearGradient>
        <filter id="vl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="10" fill="url(#vl-sky)" stroke="#ff3dbb" strokeWidth="1.4" />
      <g filter="url(#vl-glow)" fill="none" strokeLinecap="round">
        <path d="M5 16.2c5.4-.4 8.6-2.6 12.2-3.8 2.2-.7 3.2-1.2 3.8-1.6" stroke="#e0007a" strokeWidth="2.6" />
        <path d="M4.4 21.4c6.2-.6 9.8-3.8 13.8-5.2 2.8-.9 5-1.5 7.2-2.8" stroke="#ff8fd2" strokeWidth="2.3" />
        <path d="M6 26.2c5.4-1.3 8.8-4.4 12.8-6.1 2.8-1.1 5-1.7 7.2-3" stroke="#00c26e" strokeWidth="2.5" />
      </g>
      <path fill="#ffc400" d="M26.6 4.2 27.3 6.1 29.2 6.8 27.3 7.5 26.6 9.4 25.9 7.5 24 6.8 25.9 6.1Z" />
    </svg>
  );
}

export function BrandLockup({
  tone = "ink",
  subtitle,
  compact = false,
}: {
  tone?: "ink" | "white";
  subtitle?: string;
  compact?: boolean;
}) {
  const light = tone === "white";
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <LogoMark className={`shrink-0 ${compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9"}`} />
      <span className="min-w-0">
        <span
          className={`font-display block truncate leading-none font-extrabold tracking-tight ${compact ? "text-xl sm:text-2xl" : "text-2xl"} ${light ? "text-white" : "text-ink"}`}
        >
          Visa<span className="text-neon">Light</span>
        </span>
        {subtitle ? (
          <span className={`mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.18em] sm:text-[0.68rem] ${light ? "text-white/80" : "text-ink/70"}`}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
