"use client";

import { CITIES, INDUSTRIES, type Selection } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";

export function ListBuilder({
  selection,
  onChange,
  matchCount,
}: {
  selection: Selection;
  onChange: (patch: Partial<Selection>) => void;
  matchCount: number;
}) {
  return (
    <div id="urval" className="flex h-full flex-col bg-white px-5 py-6 text-ink sm:px-7 lg:px-8 lg:py-7">
      <div>
        <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Listbyggare</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Sökfält och filter. Antal och pris räknas i steg 2, på samma urval.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Sök</span>
          <input
            value={selection.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Namn eller organisationsnummer"
            className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Ort</span>
            <select
              value={selection.city}
              onChange={(event) => onChange({ city: event.target.value })}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
            >
              <option value="">Alla orter</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Bransch</span>
            <select
              value={selection.sni}
              onChange={(event) => onChange({ sni: event.target.value })}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
            >
              <option value="">Alla branscher</option>
              {INDUSTRIES.map((item) => (
                <option key={item.sni} value={item.sni}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <fieldset className="mt-4 lg:mt-auto">
        <legend className="text-sm font-medium">Kontaktfält i filen</legend>
        <div className="mt-2 grid gap-2">
          <Toggle
            pressed={selection.phones}
            onClick={() => onChange({ phones: !selection.phones })}
            label="Telefon"
            price={`${formatKronor(PHONE_ORE)} kr/nummer`}
          />
          <Toggle
            pressed={selection.emails}
            onClick={() => onChange({ emails: !selection.emails })}
            label="E-post"
            price={`${formatKronor(EMAIL_ORE)} kr/adress`}
          />
          <Toggle
            pressed={selection.signatory}
            onClick={() => onChange({ signatory: !selection.signatory })}
            label="Beslutsfattare"
            price={`${formatKronor(SIGNATORY_ORE)} kr/nummer`}
          />
        </div>
      </fieldset>

      <p className="mt-3 text-sm leading-6 text-muted">
        Grunduppgifter ingår alltid, {BASE_ORE} öre per komplett rad.{" "}
        {matchCount.toLocaleString("sv-SE")} exempelbolag med det här filtret.
      </p>
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
