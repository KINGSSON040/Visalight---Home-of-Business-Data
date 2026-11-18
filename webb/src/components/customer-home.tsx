"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuroraBuilder } from "@/components/aurora-builder";
import { NaringslivSection } from "@/components/naringsliv-stats";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import { builderHrefForSni, formatCount, PRICE_EXAMPLES, type RegisterStats } from "@/lib/naringsliv";
import { formatNewsDate, type NewsPost } from "@/lib/nyheter";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { linkedIndustries } from "@/lib/topics";
import type { UrvalResult } from "@/lib/urval";

const FREE_ACCESS = "Ingen inloggning. Ingen prenumeration. Ingen bindningstid.";

const STEPS = [
  {
    no: "01",
    title: "Ange sökord",
    text: "Skriv bransch, ort eller SNI-kod i byggaren. Sökningen gäller aktiva företag som inte spärrat reklam.",
  },
  {
    no: "02",
    title: "Välj filter",
    text: "Begränsa med län, bolagsform eller storlek. Lägg till telefon, e-post eller beslutsfattare om ni behöver det.",
  },
  {
    no: "03",
    title: "Se pris direkt",
    text: "Antal och pris står under urvalet, exklusive moms, innan ni förhandsbokar. Ingen prenumeration krävs.",
  },
];

function sniLabel(sni: string) {
  return sni.length === 5 ? `${sni.slice(0, 2)}.${sni.slice(2)}` : sni;
}

const PRICE_ROWS = [
  {
    title: "Företagsuppgifter (grunddata)",
    price: `${formatKronor(BASE_ORE)} kr/bolag`,
    text: "Namn, organisationsnummer, adress, ort, bransch och SNI-kod. Ingår alltid.",
  },
  {
    title: "Telefon",
    price: `+${formatKronor(PHONE_ORE)} kr/nr`,
    text: "Bolagets växel- eller företagsnummer. Ni betalar bara för bolag som har ett nummer.",
  },
  {
    title: "Beslutsfattare",
    price: `+${formatKronor(SIGNATORY_ORE)} kr/nr`,
    text: "Direktnummer till den som bestämmer. Ni betalar bara där numret finns.",
  },
  {
    title: "E-post",
    price: `+${formatKronor(EMAIL_ORE)} kr/st`,
    text: "Bolagets e-postadress. Ni betalar bara för bolag som har en adress.",
  },
];

export function CustomerHome({
  initial,
  initialUrval,
  updatedLabel,
  exampleDate = false,
  stats,
  news,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string;
  exampleDate?: boolean;
  stats: RegisterStats;
  news: NewsPost[];
}) {
  const [draft, setDraft] = useState(initial);
  const [urval, setUrval] = useState(initialUrval);
  const [loading, setLoading] = useState(false);
  const counted = selectionForCount(draft);
  const share = selectionToQuery({ ...(counted ?? draft), query: draft.query });
  const searchKey = counted ? selectionToQuery({ ...counted, phones: false, emails: false, signatory: false }) : "";

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/urval?${searchKey}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Kunde inte räkna urvalet.");
          return response.json() as Promise<UrvalResult>;
        })
        .then((next) => setUrval(next))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchKey]);

  useEffect(() => {
    window.history.replaceState(null, "", `/?${share}${window.location.hash}`);
  }, [share]);

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  const industries = linkedIndustries();

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-start gap-x-12 gap-y-8 px-4 pt-8 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:pt-12">
        <div className="min-w-0 lg:pt-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Företagsdata</p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Alla Sveriges företag.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Ni hämtar ett utdrag med de aktiva bolag ni vill nå: namn, adress, bransch och de kontaktfält ni väljer. Antal och pris syns direkt.
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            Ingen prenumeration och ingen inloggning. Välj <strong className="font-bold text-ink">bransch</strong>, <strong className="font-bold text-ink">ort</strong> och <strong className="font-bold text-ink">SNI</strong>, och se vad utdraget kostar innan ni bestämmer er.
          </p>
          <p className="access-line mt-4 max-w-xl">{FREE_ACCESS}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#urval" className="btn-neon inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
              Hämta ett utdrag
            </a>
            <a href="#fortroende" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
              Källa och uppdatering
            </a>
          </div>
        </div>
        <div className="min-w-0">
          <AuroraBuilder draft={draft} onChange={patch} urval={urval} loading={loading} updatedLabel={updatedLabel} exampleDate={exampleDate} />
        </div>
      </section>

      <section id="sa-funkar-det" aria-labelledby="steg" className="mx-auto max-w-6xl px-4 pt-2 pb-12">
        <h2 id="steg" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Så fungerar det
        </h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.no} className="border-t border-line pt-4">
              <p className="font-price text-xs font-bold text-ink">{step.no}</p>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="fortroende" aria-labelledby="fortroende-rubrik" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <h2 id="fortroende-rubrik" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Vad utdraget bygger på
          </h2>
          <p className="soft-copy mt-2 max-w-2xl text-sm text-muted">Tre saker som gäller varje fil, oavsett vilket urval ni gör.</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold">Källa</h3>
              <p className="soft-copy mt-2 text-sm text-muted">
                Namn, adress, ort, län, bolagsform och SNI hämtas från SCB:s allmänna företagsregister, och bara för företag som är verksamma. Telefon, e-post och beslutsfattare skrivs bara in när källan har värdet. Saknas uppgiften lämnas fältet tomt.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Uppdatering</h3>
              <p className="soft-copy mt-2 text-sm text-muted">
                {exampleDate
                  ? "När registret är inkopplat synkas det en gång i veckan. Siffrorna ni ser nu är exempel och räknar aktiva företag som inte spärrat reklam."
                  : "Registret synkas en gång i veckan. Siffran på sidan följer den senaste uppdateringen och räknar bara aktiva företag som inte spärrat reklam. Utdraget tas från samma uppdatering, inte från en fil från förra året."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Reklamspärr</h3>
              <p className="soft-copy mt-2 text-sm text-muted">
                Vilande, inaktiva, avregistrerade och bolag som spärrat reklam tas bort vid varje uppdatering. De ingår inte i siffran och följer inte med i filen ni köper.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm">
            <Link href="/kallor" className="soft-copy text-ink hover:underline">
              Så hämtas uppgifterna
            </Link>
          </p>
        </div>
      </section>

      <NaringslivSection stats={stats} />

      <section id="branscher" aria-labelledby="branscher-rubrik" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="branscher-rubrik" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Vanliga urval
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Ett färdigt urval per bransch. Antalet är aktiva företag som inte spärrat reklam, och det följer den senaste uppdateringen. Öppna raden om ni vill se priset i byggaren.
              </p>
            </div>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {industries.map((topic) => {
              const count = stats.byIndustry.find((item) => item.sni === topic.sni)?.count;
              return (
                <li key={topic.slug}>
                  <Link
                    href={topic.sni ? builderHrefForSni(topic.sni) : "/#urval"}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[minmax(0,1.4fr)_6.5rem_7rem_auto]"
                  >
                    <span className="font-semibold">{topic.nav}</span>
                    <span className="col-start-1 text-xs text-muted sm:col-start-auto sm:text-sm">SNI {topic.sni ? sniLabel(topic.sni) : ""}</span>
                    <span className="text-right text-sm font-semibold text-ink tabular-nums">{count ? formatCount(count) : ""}</span>
                    <span className="hidden text-sm font-semibold text-ink sm:inline">Se pris</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/bransch" className="text-ink hover:underline">
              Alla branscher
            </Link>
            <Link href="/sni" className="text-ink hover:underline">
              SNI-koder
            </Link>
          </p>
        </div>
      </section>

      <section id="pris" aria-labelledby="pris-rubrik" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Innehåll och pris</p>
            <h2 id="pris-rubrik" className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Ni betalar för det utdrag ni väljer.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted">
              Grunddata ingår alltid: namn, organisationsnummer, adress, ort, bransch och SNI. Telefon, e-post och beslutsfattare lägger ni till bara om ni behöver dem. Ett tomt fält kostar inget.
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">
              Priset är ett engångspris per utdrag, exklusive moms. Lägsta order {formatKronor(MINIMUM_ORE).replace(",00", "")} kr. Samma styckpris oavsett om urvalet är en bransch i en stad eller hela landet.
            </p>
            <p className="access-line mt-4 max-w-md">{FREE_ACCESS}</p>
            <a href="#urval" className="btn-neon mt-5 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
              Räkna på ert urval
            </a>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {PRICE_ROWS.map((row) => (
              <div key={row.title} className="py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-semibold">{row.title}</dt>
                  <dd className="font-price shrink-0 text-sm font-bold text-ink">{row.price}</dd>
                </div>
                <dd className="mt-1 text-sm leading-6 text-muted">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <h3 className="mt-10 text-lg font-bold">Räkneexempel</h3>
        <p className="mt-1 text-sm text-muted">Så ser priset ut för tre vanliga urval. Ert eget tal räknas i byggaren.</p>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {PRICE_EXAMPLES.map((item) => (
            <li key={item.title} className="bg-white">
              <Link href={item.href} className="flex h-full flex-col p-5">
                <span className="font-semibold">{item.title}</span>
                <span className="mt-1 text-sm text-muted">{item.detail}</span>
                <span className="font-price mt-4 text-2xl font-bold text-ink">{formatKronor(item.quote.totalOre)} kr</span>
                <span className="text-xs text-muted">{item.quote.minimumApplied ? "Lägsta order. " : ""}Exkl. moms, engångspris.</span>
                <span className="mt-4 text-sm font-semibold text-ink">Öppna i byggaren</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Filen har fasta kolumner.{" "}
          <Link href="/smakprov" className="font-semibold text-ink hover:underline">
            Ladda ner ett smakprov
          </Link>{" "}
          om ni vill se formatet innan ni förhandsbokar.
        </p>
      </section>

      <section id="nyheter" aria-labelledby="nyheter-rubrik" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="nyheter-rubrik" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Nyheter och uppdateringar
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Vad som ändrats i registret och sådant som påverkar hur ett utdrag ska läsas. Inlägg märkta exempeltext byts ut när underlaget finns.
              </p>
            </div>
            <Link href="/nyheter" className="text-sm font-semibold text-ink hover:underline">
              Alla nyheter
            </Link>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {news.map((post) => (
              <li key={post.slug}>
                <Link href={`/nyheter/${post.slug}`} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                  <span className="text-xs font-semibold text-muted">
                    <span className="uppercase tracking-wide">{post.kind}</span>
                    <time dateTime={post.date} className="mt-1 block font-medium normal-case tracking-normal">
                      {formatNewsDate(post.date)}
                    </time>
                    {post.example ? <span className="mt-2 inline-flex rounded-full bg-gold px-2 py-0.5 text-[0.68rem] font-bold text-night">Exempeltext</span> : null}
                  </span>
                  <span>
                    <span className="block font-semibold">{post.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">{post.lead}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="fragor" aria-labelledby="fragor-rubrik" className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h2 id="fragor-rubrik" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Vanliga frågor
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">Pris, aktualitet, format och vad som gäller när ni kontaktar bolagen.</p>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {PUBLIC_FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {item.q}
                <span aria-hidden="true" className="text-muted">+</span>
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="sista" className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
          <div>
            <h2 id="sista" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Alla Sveriges företag, i ett utdrag.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {stats.source === "example" ? "Exempelsiffror. Registret är inte inkopplat. " : ""}
              {formatCount(stats.total)} aktiva företag i dag. {stats.source === "example" ? "Antalet är ett exempel." : "Siffran följer den senaste uppdateringen."} Välj vilka ni vill nå och se priset direkt.
            </p>
          </div>
          <a href="#urval" className="btn-neon inline-flex h-11 shrink-0 items-center rounded-lg px-5 text-sm font-semibold">
            Skapa ert utdrag
          </a>
        </div>
      </section>
    </main>
  );
}
