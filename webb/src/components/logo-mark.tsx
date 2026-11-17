/** Norrsken utan blått: grönt, korall och magenta, med en gul gnista. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="10" fill="#fff7f2" stroke="#ff2d95" strokeWidth="1.6" />
      <path d="M5 16.2c5.4-.4 8.6-2.6 12.2-3.8 2.2-.7 3.2-1.2 3.8-1.6" fill="none" stroke="#ff2d95" strokeWidth="2.7" strokeLinecap="round" />
      <path d="M4.4 21.4c6.2-.6 9.8-3.8 13.8-5.2 2.8-.9 5-1.5 7.2-2.8" fill="none" stroke="#ff6b4a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 26.2c5.4-1.3 8.8-4.4 12.8-6.1 2.8-1.1 5-1.7 7.2-3" fill="none" stroke="#00a86b" strokeWidth="2.45" strokeLinecap="round" />
      <path fill="#ffc107" d="M26.6 4.2 27.3 6.1 29.2 6.8 27.3 7.5 26.6 9.4 25.9 7.5 24 6.8 25.9 6.1Z" />
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
      <LogoMark className={`shrink-0 ${compact ? "h-7 w-7 sm:h-8 sm:w-8" : "h-8 w-8"}`} />
      <span className="min-w-0">
        <span className={`block truncate leading-none tracking-tight ${compact ? "text-lg sm:text-2xl" : "text-2xl"} ${light ? "text-white" : "text-ink"}`}>
          VisaLight
        </span>
        {subtitle ? (
          <span className={`mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.14em] sm:text-[0.68rem] sm:tracking-[0.16em] ${light ? "text-white/90" : "text-ink/70"}`}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
