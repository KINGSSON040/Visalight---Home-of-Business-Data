import type { Metadata } from "next";
import { BuilderLink } from "@/components/builder-link";
import {
  BASE_ORE,
  EMAIL_ORE,
  formatKronor,
  MINIMUM_ORE,
  PHONE_ORE,
  quote,
  SIGNATORY_ORE,
  VOLUME_TALK_LINE,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Priser — VisaLight",
  description:
    "Se vad det kostar att nå er nästa kund. Grunduppgifter 0,10 kr, telefon 0,30 kr, e-post och beslutsfattare 0,40 kr. Lägsta order 399 kr. Ingen prenumeration.",
  alternates: { canonical: "/priser" },
};

const ROWS = [
  { title: "Grunduppgifter", price: `${formatKronor(BASE_ORE)} kr/bolag`, text: "Namn, organisationsnummer, adress, ort, bransch och SNI." },
  { title: "Telefon", price: `+${formatKronor(PHONE_ORE)} kr/nr`, text: "Ni betalar bara för bolag som har ett nummer." },
  { title: "Beslutsfattare", price: `+${formatKronor(SIGNATORY_ORE)} kr/nr`, text: "Direktnummer där källan har det." },
  { title: "E-post", price: `+${formatKronor(EMAIL_ORE)} kr/st`, text: "Ni betalar bara där en adress finns." },
];

export default function PricesPage() {
  const small = quote({ companies: 200, phones: 0, signatoryPhones: 0, emails: 0 });
  const withPhone = quote({ companies: 2000, phones: 2000, signatoryPhones: 0, emails: 0 });
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Priser</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Se priset innan ni ringer.</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Hitta er nästa kund idag. Se priset innan ni ringer. Det är ett engångspris per utdrag, exklusive moms. Ingen prenumeration och ingen bindningstid.
      </p>
      <dl className="mt-8 rounded-3xl bg-white px-6 py-2">
        {ROWS.map((row) => (
          <div key={row.title} className="border-b border-line py-5 last:border-b-0">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-semibold">{row.title}</dt>
              <dd className="font-price shrink-0 text-xl font-bold">{row.price}</dd>
            </div>
            <dd className="mt-1 text-sm leading-6 text-muted">{row.text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm leading-6 text-muted">Lägsta order {formatKronor(MINIMUM_ORE).replace(",00", "")} kr. {VOLUME_TALK_LINE}</p>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight">Räkneexempel</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Exemplet räknas från prislistan. Det är inte ett urval ur bolagsregistret.</p>
        <ul className="mt-4 space-y-3 text-sm leading-6">
          <li>
            200 bolag med bara grunduppgifter: 200 × {formatKronor(BASE_ORE)} kr. Lägsta order gör att exemplet blir {formatKronor(small.totalOre)} kr.
          </li>
          <li>
            2 000 bolag med telefon: 2 000 × {formatKronor(BASE_ORE)} kr + 2 000 × {formatKronor(PHONE_ORE)} kr = {formatKronor(withPhone.totalOre)} kr.
          </li>
        </ul>
      </section>
      <BuilderLink className="btn-neon mt-10 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">Bygg din lista</BuilderLink>
    </main>
  );
}
