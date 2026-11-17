/** Norrsken i färgblock: korall, rosa och grönt band med en gul gnista, tjock mörk kontur. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="10" fill="#ffdcc2" stroke="#2b1710" strokeWidth="2.6" />
      <path d="M5.5 15.6c5-.6 8.4-2.7 12-3.9 2.2-.7 3.4-1.2 4.2-1.8" fill="none" stroke="#ff5a36" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M5 21c6-.8 9.6-3.8 13.6-5.2 2.8-.9 4.8-1.5 7-2.8" fill="none" stroke="#ff7eb6" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M6.4 25.8c5.2-1.3 8.6-4.3 12.6-6 2.8-1.1 4.8-1.7 7-3" fill="none" stroke="#12c26f" strokeWidth="3.2" strokeLinecap="round" />
      <path fill="#ffc93c" stroke="#2b1710" strokeWidth="1" strokeLinejoin="round" d="M25.6 3.6 26.5 6 28.9 6.9 26.5 7.8 25.6 10.2 24.7 7.8 22.3 6.9 24.7 6Z" />
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
          className={`font-display block truncate leading-none font-semibold ${compact ? "text-xl sm:text-2xl" : "text-2xl"} ${light ? "text-white" : "text-ink"}`}
        >
          VisaLight
        </span>
        {subtitle ? (
          <span className={`mt-0.5 block truncate text-[0.62rem] font-bold uppercase tracking-[0.14em] sm:text-[0.68rem] ${light ? "text-white/90" : "text-muted"}`}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
