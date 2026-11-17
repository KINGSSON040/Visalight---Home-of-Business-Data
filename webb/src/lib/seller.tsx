/** Fylls i på ett ställe när bolaget finns. Inget här är ett riktigt organisationsnummer, en adress eller ett momsnummer. */
export const SELLER = {
  tradeName: "VisaLight",
  registered: false,
  orgNr: "[Organisationsnummer]",
  address: "[Adress]",
  vatNr: "[Momsregistreringsnummer]",
} as const;

export function Mark({ children }: { children: string }) {
  return (
    <span className="rounded bg-amber-soft px-1.5 py-0.5 font-mono text-[0.92em] text-ink">{children}</span>
  );
}
