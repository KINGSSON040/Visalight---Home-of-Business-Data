"use client";

import { CompanySearch } from "@/components/company-search";
import { BASE_ORE, EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { suggestBranscher, type Selection } from "@/lib/catalog";

export function ListBuilder({
  draft,
  onChange,
  onSearch,
  dirty,
  matchCount,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  onSearch: () => void;
  dirty: boolean;
  matchCount: number;
}) {
  const hint = dirty
    ? "Filtren är ändrade. Tryck Sök bolag för att räkna om urvalet."
    : `${matchCount.toLocaleString("sv-SE")} exempelbolag i det senaste urvalet. Antal och pris står i steg 2.`;

  return (
    <div id="urval" className="rounded-[1.75rem] border border-line bg-white px-5 py-5 text-ink shadow-[0_24px_60px_-32px_rgba(16,42,54,0.45)] sm:px-6">
      <div>
        <h2 className="text-2xl tracking-tight">Skapa företagslista</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Skriv en bransch, till exempel frisör, restaurang eller revisionsbyrå. Förslagen är branscher, inte bolag.
        </p>
      </div>

      <div className="mt-4">
        <CompanySearch
          draft={draft}
          onChange={onChange}
          onSearch={onSearch}
          onClear={() => onChange({ query: "", city: "", bransch: "", sni: "", forms: [] })}
          queryPlaceholder="Branschnamn eller SNI-kod"
          querySuggestions={suggestBranscher}
          hint={hint}
        >
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Kontaktfält i filen</legend>
            <div className="mt-2 grid gap-2">
              <Toggle
                pressed={draft.phones}
                onClick={() => onChange({ phones: !draft.phones })}
                label="Telefon"
                price={`${formatKronor(PHONE_ORE)} kr/nummer`}
              />
              <Toggle
                pressed={draft.emails}
                onClick={() => onChange({ emails: !draft.emails })}
                label="E-post"
                price={`${formatKronor(EMAIL_ORE)} kr/adress`}
              />
              <Toggle
                pressed={draft.signatory}
                onClick={() => onChange({ signatory: !draft.signatory })}
                label="Beslutsfattare"
                price={`${formatKronor(SIGNATORY_ORE)} kr/nummer`}
              />
            </div>
          </fieldset>
          <p className="mt-3 text-sm leading-6 text-muted">
            Grunduppgifter ingår alltid, {BASE_ORE} öre per komplett rad. Tomma fält kostar inget.
          </p>
        </CompanySearch>
      </div>
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  label,
  price,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  price: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 text-left text-base ${
        pressed ? "border-sea bg-sea text-white" : "border-line bg-paper text-ink"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`text-sm ${pressed ? "text-white/80" : "text-muted"}`}>{price}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            pressed ? "bg-white/20 text-white" : "bg-white text-muted"
          }`}
        >
          {pressed ? "På" : "Av"}
        </span>
      </span>
    </button>
  );
}
