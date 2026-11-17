"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { legalFormLabel, lookupCompanies, type Company } from "@/lib/catalog";

export function CompanyLookup() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const matches = useMemo(() => lookupCompanies(query), [query]);
  const company = matches.find((item) => item.orgNr === picked) ?? matches[0] ?? null;
  const ready = query.trim().length >= 2;

  return (
    <section id="uppslag" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Gratis uppslag</p>
        <h2 className="mt-3 max-w-3xl text-4xl tracking-tight">Slå upp ett bolag och se grunduppgifterna.</h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Skriv organisationsnummer eller företagsnamn. Namn, adress, ort, bransch och SNI visas direkt. Telefon,
          e-post och beslutsfattare följer med först i den köpta filen.
        </p>
        <label className="mt-6 block max-w-xl text-sm">
          <span className="mb-1.5 block font-medium">Sök</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPicked(null);
            }}
            placeholder="Namn eller organisationsnummer"
            className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base placeholder:text-ink/40"
            autoComplete="off"
          />
        </label>
        {!ready ? (
          <p className="mt-4 text-sm text-muted">Minst två tecken. Prova 559100-1001 eller Kajplatsen.</p>
        ) : matches.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Inget exempelbolag matchar. Prova ett annat namn eller nummer.</p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
              {matches.map((item) => (
                <li key={item.orgNr}>
                  <button
                    type="button"
                    onClick={() => setPicked(item.orgNr)}
                    className={`w-full px-4 py-3 text-left ${company?.orgNr === item.orgNr ? "bg-foam" : "bg-white"}`}
                    aria-pressed={company?.orgNr === item.orgNr}
                  >
                    <span className="block font-medium">{item.name}</span>
                    <span className="text-sm text-muted">
                      {item.orgNr} · {item.city}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {company ? <Preview company={company} /> : null}
          </div>
        )}
      </div>
    </section>
  );
}

function Preview({ company }: { company: Company }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-sea">Grunduppgifter, utan kostnad</p>
      <h3 className="mt-2 text-2xl tracking-tight">{company.name}</h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Fact label="Organisationsnummer" value={company.orgNr} />
        <Fact label="Bolagsform" value={legalFormLabel(company.form)} />
        <Fact label="Adress" value={`${company.street}, ${company.postalCode} ${company.city}`} />
        <Fact label="Län" value={company.county} />
        <Fact label="Bransch" value={company.industry} />
        <Fact label="SNI" value={company.sni} />
        <Fact label="Anställda" value={company.employees || "Saknas i exemplet"} />
      </dl>
      <div className="mt-5 space-y-2 border-t border-line pt-4">
        <Locked label="Telefon" present={company.phones.length > 0} price="0,30 kr/nummer" />
        <Locked label="E-post" present={company.emails.length > 0} price="0,40 kr/adress" />
        <Locked label="Beslutsfattare" present={company.signatoryPhones.length > 0} price="0,40 kr/nummer" />
      </div>
      <Link href="/#urval" className="mt-5 inline-flex text-sm font-medium text-sea">
        Ta med bolaget i en lista
      </Link>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function Locked({ label, present, price }: { label: string; present: boolean; price: string }) {
  return (
    <p className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {present ? (
        <span className="text-muted">
          <span className="mr-2 inline-block select-none rounded bg-paper px-2 py-0.5 tracking-widest text-ink/30">
            •••• ••••
          </span>
          Finns i filen, {price}
        </span>
      ) : (
        <span className="text-muted">Tomt i källan. Kostar inget.</span>
      )}
    </p>
  );
}
