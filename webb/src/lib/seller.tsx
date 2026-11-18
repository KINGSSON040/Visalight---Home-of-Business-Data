/** Kort saklig presentation. Inget organisationsnummer eller någon gatuadress är ifyllt här. */
export const SELLER = {
  tradeName: "VisaLight",
  line: "VisaLight är ett svenskt företag och varumärke med säte i Malmö.",
  orgNr: "[FYLL I]",
  street: "[FYLL I]",
  phone: "[FYLL I]",
} as const;

export function SellerFacts({ className = "mt-3 space-y-2 text-sm leading-6" }: { className?: string }) {
  return (
    <dl className={className}>
      <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2">
        <dt className="text-muted">Organisationsnummer</dt>
        <dd>{SELLER.orgNr}</dd>
      </div>
      <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2">
        <dt className="text-muted">Adress</dt>
        <dd>{SELLER.street}</dd>
      </div>
      <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2">
        <dt className="text-muted">Telefon</dt>
        <dd>{SELLER.phone}</dd>
      </div>
      <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2">
        <dt className="text-muted">Säte</dt>
        <dd>Malmö</dd>
      </div>
    </dl>
  );
}

/** Tilltal med ni. Löftet först, färsk och verifierad information som skäl under. */
export const OFFER_LINE = "Hitta er nästa kund idag.";
export const OFFER_WHY = "Det går för att informationen är verifierad, uppdaterad och färsk.";
export const OFFER_FRESH = "Det går för att informationen är verifierad, uppdaterad och färsk.";
