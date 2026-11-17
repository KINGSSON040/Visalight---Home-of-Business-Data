"use client";

import { useEffect, useState } from "react";
import { PricePanel } from "@/components/price-panel";
import {
  CITIES,
  INDUSTRIES,
  describeSelection,
  selectionToQuery,
  summarize,
  type Selection,
} from "@/lib/catalog";
import { formatKronor } from "@/lib/pricing";

const PREVIEW_LIMIT = 8;

export function Builder({ initial }: { initial: Selection }) {
  const [selection, setSelection] = useState(initial);
  const summary = summarize(selection);
  const preview = summary.rows.slice(0, PREVIEW_LIMIT);

  useEffect(() => {
    const query = selectionToQuery(selection);
    window.history.replaceState(null, "", query ? `/?${query}` : "/");
  }, [selection]);

  function patch(next: Partial<Selection>) {
    setSelection((current) => ({ ...current, ...next }));
  }

  return (
    <section id="urval" className="mx-auto max-w-6xl px-4 pb-28 lg:pb-16">
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 rounded-3xl border border-line bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl tracking-tight">Bygg urvalet</h2>
              <p className="mt-1 text-sm text-muted">{describeSelection(selection)}</p>
            </div>
            <p className="text-sm text-muted">
              {summary.rows.length.toLocaleString("sv-SE")} exempelbolag
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Namn eller org.nr</span>
              <input
                value={selection.query}
                onChange={(event) => patch({ query: event.target.value })}
                placeholder="Till exempel bageri"
                className="h-11 w-full rounded-xl border border-line bg-white px-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Ort</span>
              <select
                value={selection.city}
                onChange={(event) => patch({ city: event.target.value })}
                className="h-11 w-full rounded-xl border border-line bg-white px-3"
              >
                <option value="">Alla orter</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Bransch</span>
              <select
                value={selection.sni}
                onChange={(event) => patch({ sni: event.target.value })}
                className="h-11 w-full rounded-xl border border-line bg-white px-3"
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

          <fieldset className="mt-4">
            <legend className="text-sm text-muted">Kontaktfält som ska med i filen</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <Toggle
                pressed={selection.phones}
                onClick={() => patch({ phones: !selection.phones })}
                label="Telefon"
                price="0,30 kr/nummer"
              />
              <Toggle
                pressed={selection.signatory}
                onClick={() => patch({ signatory: !selection.signatory })}
                label="Firmatecknare"
                price="0,40 kr/nummer"
              />
              <Toggle
                pressed={selection.emails}
                onClick={() => patch({ emails: !selection.emails })}
                label="E-post"
                price="0,40 kr/adress"
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              Grunduppgifter ingår alltid: namn, organisationsnummer, adress, ort, bransch och SNI.
            </p>
          </fieldset>

          {summary.rows.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center">
              <p className="font-serif text-2xl">Inget exempelbolag matchar</p>
              <p className="mt-2 text-sm text-muted">
                Prova en annan ort eller bransch. Raderna här är exempel tills det riktiga registret är kopplat.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <p className="mb-2 text-sm text-muted sm:hidden">Dra i sidled för att se alla kolumner.</p>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[880px] border-collapse text-sm">
                  <thead className="bg-foam text-left text-xs uppercase tracking-wide text-sea">
                    <tr>
                      <th className="px-3 py-3 font-medium">Bolag</th>
                      <th className="px-3 py-3 font-medium">Adress</th>
                      <th className="px-3 py-3 font-medium">SNI</th>
                      <th className="px-3 py-3 font-medium">Telefon</th>
                      <th className="px-3 py-3 font-medium">Firmatecknare</th>
                      <th className="px-3 py-3 font-medium">E-post</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row) => (
                      <tr key={row.orgNr} className="border-t border-line bg-white align-top">
                        <td className="px-3 py-3">
                          <span className="block font-medium">{row.name}</span>
                          <span className="font-mono text-xs text-muted">{row.orgNr}</span>
                        </td>
                        <td className="px-3 py-3">
                          {row.street}
                          <span className="block text-muted">
                            {row.postalCode} {row.city}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {row.industry}
                          <span className="block font-mono text-xs text-muted">{row.sni}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Contact values={row.phones} included={selection.phones} />
                        </td>
                        <td className="px-3 py-3">
                          <Contact values={row.signatoryPhones} included={selection.signatory} />
                        </td>
                        <td className="px-3 py-3">
                          <Contact values={row.emails} included={selection.emails} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm text-muted">
                Visar {preview.length} av {summary.rows.length} exempelrader. Så här ser kolumnerna ut i filen.
              </p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28">
          <PricePanel selection={selection} showAction />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-sea-deep px-4 py-3 text-white lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/60">
              {summary.counts.companies.toLocaleString("sv-SE")} bolag
            </p>
            <p className="font-serif text-2xl leading-none">{formatKronor(summary.price.totalOre)} kr</p>
          </div>
          {summary.counts.companies > 0 ? (
            <a
              href={`/kassa?${selectionToQuery(selection)}`}
              className="rounded-full bg-amber px-4 py-2 text-sm font-medium text-ink"
            >
              Till kassan
            </a>
          ) : (
            <span className="text-sm text-white/60">Inget att beställa</span>
          )}
        </div>
      </div>
    </section>
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
      className={`rounded-full border px-3 py-2 text-left text-sm ${
        pressed ? "border-sea bg-sea text-white" : "border-line bg-white text-ink"
      }`}
    >
      <span className="block font-medium">{label}</span>
      <span className={pressed ? "text-white/70" : "text-muted"}>{price}</span>
    </button>
  );
}

function Contact({ values, included }: { values: string[]; included: boolean }) {
  if (!included) return <span className="text-muted">Köps inte</span>;
  if (values.length === 0) return <span className="text-muted">—</span>;
  return (
    <span>
      {values[0]}
      {values.length > 1 ? <span className="text-muted"> +{values.length - 1}</span> : null}
    </span>
  );
}
