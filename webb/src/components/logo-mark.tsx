/** Norrsken: vit platta, tre täta band och en gnista. Läsbar vid 24–32 px på vitt och på blå header. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#ffffff" stroke="#0036d6" strokeWidth="1.75" />
      <path
        d="M4.8 15.6C10.6 15.1 14.4 12.4 18.2 11.2 20.6 10.4 21.6 9.9 22.2 9.4"
        fill="none"
        stroke="#5a2de0"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M4.2 21C10.8 20.3 14.8 16.6 19.2 15.2 22.4 14.2 24.8 13.6 27.2 12.2"
        fill="none"
        stroke="#008fc4"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M5.8 26.2C11.6 24.8 15.2 21.2 19.6 19.4 22.8 18.2 25.2 17.6 27.6 16.2"
        fill="none"
        stroke="#008f52"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        fill="#ffbf00"
        stroke="#152033"
        strokeWidth="0.65"
        strokeLinejoin="round"
        d="M26.8 3.5 27.55 5.35 29.3 6 27.55 6.65 26.8 8.5 26.05 6.65 24.3 6 26.05 5.35Z"
      />
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
        <span
          className={`block truncate leading-none tracking-tight ${compact ? "text-lg sm:text-2xl" : "text-2xl"} ${light ? "text-white" : "text-ink"}`}
        >
          VisaLight
        </span>
        {subtitle ? (
          <span
            className={`mt-0.5 block truncate text-[0.62rem] uppercase tracking-[0.14em] sm:text-[0.68rem] sm:tracking-[0.16em] ${light ? "text-white/90" : "text-ink/70"}`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
