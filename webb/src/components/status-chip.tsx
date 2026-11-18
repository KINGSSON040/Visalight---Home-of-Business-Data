export function StatusChip({
  registerReady = false,
  plain = false,
}: {
  updatedLabel?: string | null;
  registerReady?: boolean;
  exampleData?: boolean;
  plain?: boolean;
}) {
  const fresh = `Siffran följer den senaste uppdateringen och räknar bara aktiva företag som inte spärrat reklam.${
    registerReady ? " Urvalet gäller den datan." : ""
  }`;

  if (plain) {
    return (
      <div className="space-y-2 text-sm leading-6">
        <p>{fresh}</p>
        <p className="font-semibold">Beställning öppnar snart</p>
      </div>
    );
  }

  return (
    <p className="flex max-w-xl flex-wrap gap-2">
      <span className="inline-flex max-w-full items-center rounded-full bg-foam px-3 py-1 text-xs font-medium leading-5 text-ink">
        {fresh}
      </span>
      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-ink ring-1 ring-inset ring-ink/15">
        Beställning öppnar snart
      </span>
    </p>
  );
}
