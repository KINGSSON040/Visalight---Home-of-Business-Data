export function StatusChip({
  updatedLabel,
  registerReady = false,
  exampleData = false,
}: {
  updatedLabel: string | null;
  registerReady?: boolean;
  exampleData?: boolean;
}) {
  const when = updatedLabel ?? "12 mars 2026 kl. 09.00";
  const example = exampleData || !updatedLabel;
  const fresh = `Registret senast uppdaterat: ${when}${example ? " (exempeldata)" : ""}. Siffran följer den senaste uppdateringen och räknar bara aktiva företag som går att sälja. ${
    registerReady && !example ? "Urvalet gäller den datan." : "Utan register är talet ett märkt exempel, inte hela registret."
  }`;

  return (
    <p className="flex max-w-xl flex-wrap gap-2">
      <span className="inline-flex max-w-full items-center rounded-full bg-foam px-3 py-1 text-xs font-medium leading-5 text-ink">
        {fresh}
      </span>
      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-sea ring-1 ring-inset ring-sea/30">
        Beställning öppnar snart
      </span>
    </p>
  );
}
