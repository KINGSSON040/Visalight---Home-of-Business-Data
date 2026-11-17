export function StatusChip({
  updatedLabel,
  registerReady = false,
}: {
  updatedLabel: string | null;
  registerReady?: boolean;
}) {
  const fresh = updatedLabel
    ? `Senast uppdaterat ${updatedLabel}. Äldre årgångar används inte.`
    : registerReady
      ? "Utdraget tas från den senaste uppdateringen. Äldre årgångar används inte."
      : "Utdraget tas alltid från den senaste uppdateringen. Äldre årgångar används inte.";

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
