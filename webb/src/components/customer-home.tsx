"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuroraBuilder } from "@/components/aurora-builder";
import { NaringslivSection } from "@/components/naringsliv-stats";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import { builderHrefForSni, formatCount, type RegisterStats } from "@/lib/naringsliv";
import { formatNewsDate, type NewsPost } from "@/lib/nyheter";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { linkedIndustries } from "@/lib/topics";
import type { UrvalResult } from "@/lib/urval";

const STEPS = [
  {
    no: "01",
    title: "Ange sökord",
    text: "Skriv bransch, ort eller SNI-kod i byggaren. Sökningen visar endast aktiva företag som inte spärrat reklam.",
    icon: "search",
    tone: "text-[#9a1458]",
    wash: "bg-[#fdeef6]",
  },
  {
    no: "02",
    title: "Välj filter",
    text: "Avgränsa med län, bolagsform eller storlek. Lägg till telefon, e-postadress eller beslutsfattare om ni behöver det.",
    icon: "filter",
    tone: "text-[#8a5a00]",
    wash: "bg-[#fff6dc]",
  },
  {
    no: "03",
    title: "Se pris direkt",
    text: "Antal och pris visas direkt i byggaren, exklusive moms.",
    icon: "price",
    tone: "text-[#0f6b45]",
    wash: "bg-[#e8f7ef]",
  },
] as const;

const ACCESS_POINTS = ["Inget konto krävs.", "Ingen prenumeration.", "Ingen bindningstid."];

function StepIcon({ name }: { name: (typeof STEPS)[number]["icon"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      {name === "search" ? <circle cx="11" cy="11" r="6" {...common} /> : null}
      {name === "search" ? <path d="M16 16.5 20 20.5" {...common} /> : null}
      {name === "filter" ? <path d="M4 6h16M7 12h10M10 18h4" {...common} /> : null}
      {name === "price" ? <path d="M6 5.5h12v13l-6-2.5-6 2.5Z" {...common} /> : null}
      {name === "price" ? <path d="M9 10h6" {...common} /> : null}
    </svg>
  );
}

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
  fresh,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string;
  exampleDate?: boolean;
  stats: RegisterStats;
  news: NewsPost[];
  fresh: { companies: number; example: boolean };
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
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-start gap-x-8 gap-y-6 px-4 pt-4 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:pt-5 lg:pb-8">
        <div className="min-w-0 lg:pt-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Företagsdata</p>
          <h1 className="hero-title mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Alla Sveriges företag.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink">
            Välj bransch. Se priset. Köp direkt.
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            {stats.source === "register"
              ? `Vårt register innehåller ${formatCount(stats.total)} företag. Välj vilka ni vill nå idag. Ingen prenumeration. Inga dolda avgifter.`
              : "Välj vilka ni vill nå idag. Ingen prenumeration. Inga dolda avgifter."}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-ink/80">
            {ACCESS_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-[#9a1458]">✓</span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            <Link href="/konto" className="underline-offset-4 hover:underline">
              Skapa konto för köphistorik
            </Link>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#urval" className="btn-neon inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
              Skapa utdrag
            </a>
            <a href="#fortroende" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
              Källa och uppdatering
            </a>
          </div>
        </div>
        <div className="min-w-0">
          <AuroraBuilder draft={draft} onChange={patch} urval={urval} loading={loading} updatedLabel={updatedLabel} exampleDate={exampleDate} />
        </div>
        </div>
      </section>

      <section id="sa-funkar-det" aria-labelledby="steg" className="mx-auto max-w-6xl px-4 pt-16 pb-20">
        <h2 id="steg" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          Så fungerar det
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.no}
              data-step={index + 1}
              className="step-card flex flex-col rounded-3xl bg-white px-7 py-8 shadow-[0_18px_40px_-32px_rgba(27,16,35,0.45)] ring-1 ring-ink/8"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${step.wash} ${step.tone}`}>
                  <StepIcon name={step.icon} />
                </span>
                <p className={`step-index font-display text-5xl leading-none font-extrabold tracking-[-0.04em] ${step.tone}`}>{step.no}</p>
              </div>
              <h3 className="mt-8 text-xl font-extrabold tracking-tight text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/80">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="fortroende" aria-labelledby="fortroende-rubrik" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 id="fortroende-rubrik" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Vad utdraget bygger på
          </h2>
          <p className="soft-copy mt-3 max-w-2xl text-sm leading-6 text-muted">Tre saker som gäller varje fil, oavsett vilket urval ni gör.</p>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            <div className="border-t-2 border-ink pt-6">
              <h3 className="text-xl font-extrabold tracking-tight">Källa</h3>
              <p className="soft-copy mt-3 text-sm leading-7 text-ink/80">
                Namn, adress, ort, län, bolagsform och SNI hämtas från SCB:s allmänna företagsregister, och bara för företag som är verksamma. Telefon, e-post och beslutsfattare skrivs bara in när källan har värdet. Saknas uppgiften lämnas fältet tomt.
              </p>
            </div>
            <div className="border-t-2 border-[#c4892a] pt-6">
              <h3 className="text-xl font-extrabold tracking-tight">Uppdatering</h3>
              <p className="soft-copy mt-3 text-sm leading-7 text-ink/80">
                {exampleDate
                  ? "Registret är inte inkopplat. När det är inkopplat synkas det en gång i veckan och räknar bara aktiva företag som inte spärrat reklam."
                  : "Registret synkas en gång i veckan. Siffran på sidan följer den senaste uppdateringen och räknar bara aktiva företag som inte spärrat reklam. Utdraget tas från samma uppdatering, inte från en fil från förra året."}
              </p>
            </div>
            <div className="border-t-2 border-[#0f6b45] pt-6">
              <h3 className="text-xl font-extrabold tracking-tight">Reklamspärr</h3>
              <p className="soft-copy mt-3 text-sm leading-7 text-ink/80">
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

      <section id="nystartade" aria-labelledby="nystartade-rubrik" className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-20">
          <div>
            <h2 id="nystartade-rubrik" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              Nystartade bolag
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Nya bolag kommer in från Bolagsverket, och filen uppdateras varje vecka. De behöver ofta bank, redovisning, försäkring, telefoni, webb och lokal.
            </p>
            {fresh.example ? (
              <p className="mt-3 text-sm font-semibold">Registret är inte inkopplat.</p>
            ) : (
              <p className="mt-3 text-sm font-semibold">
                <span className="font-display text-4xl font-extrabold tracking-tight text-ink">{fresh.companies.toLocaleString("sv-SE")}</span> bolag de senaste 30 dagarna.
              </p>
            )}
          </div>
          <Link href="/nystartade-bolag" className="btn-neon inline-flex h-11 shrink-0 items-center rounded-lg px-5 text-sm font-semibold">
            Se antal och pris
          </Link>
        </div>
      </section>

      <section id="branscher" aria-labelledby="branscher-rubrik" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="branscher-rubrik" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
                Vanliga urval
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {stats.source === "register"
                  ? "Ett färdigt urval per bransch. Antalet är aktiva företag som inte spärrat reklam, och det följer den senaste uppdateringen. Öppna raden om ni vill se priset i byggaren."
                  : "Ett färdigt urval per bransch. Registret är inte inkopplat, så antalet visas inte."}
              </p>
            </div>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {industries.map((topic) => {
              const count = stats.source === "register" ? stats.byIndustry.find((item) => item.sni === topic.sni)?.count : undefined;
              return (
                <li key={topic.slug}>
                  <Link
                    href={topic.sni ? builderHrefForSni(topic.sni) : "/#urval"}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-4 sm:grid-cols-[minmax(0,1.4fr)_6.5rem_7rem_auto]"
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

      <section id="pris" aria-labelledby="pris-rubrik" className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Innehåll och pris</p>
            <h2 id="pris-rubrik" className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              Ni betalar för det utdrag ni väljer.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted">
              Grunddata ingår alltid: namn, organisationsnummer, adress, ort, bransch och SNI. Telefon, e-post och beslutsfattare lägger ni till bara om ni behöver dem. Ett tomt fält kostar inget.
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">
              Priset är ett engångspris per utdrag, exklusive moms. Lägsta order {formatKronor(MINIMUM_ORE).replace(",00", "")} kr. Samma styckpris oavsett om urvalet är en bransch i en stad eller hela landet.
            </p>
            <p className="mt-4 max-w-md text-sm text-ink/80">Inget konto krävs. Ingen prenumeration. Ingen bindningstid.</p>
            <a href="#urval" className="btn-neon mt-5 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
              Räkna på ert urval
            </a>
          </div>
          <dl className="rounded-3xl bg-white px-6 py-2 sm:px-8">
            {PRICE_ROWS.map((row) => (
              <div key={row.title} className="border-b border-line py-5 last:border-b-0">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-semibold">{row.title}</dt>
                  <dd className="font-price shrink-0 text-xl font-bold tracking-tight text-ink">{row.price}</dd>
                </div>
                <dd className="mt-1 text-sm leading-6 text-muted">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted">
          Summan räknas i byggaren från registret. {stats.source === "register" ? "Siffran följer den senaste uppdateringen." : "Registret är inte inkopplat, så ingen summa visas."}
        </p>
        <p className="mt-4 text-sm text-muted">
          Filen har fasta kolumner.{" "}
          <Link href="/smakprov" className="font-semibold text-ink hover:underline">
            Ladda ner ett smakprov
          </Link>{" "}
          om ni vill se formatet.
        </p>
      </section>

      <section id="nyheter" aria-labelledby="nyheter-rubrik" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="nyheter-rubrik" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
                Nyheter och uppdateringar
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Vad som ändrats i registret. Uppdateringen skrivs från registret, och utan det visas inga antal.
              </p>
            </div>
            <Link href="/nyheter" className="text-sm font-semibold text-ink hover:underline">
              Alla nyheter
            </Link>
          </div>
          <ul className="mt-10 grid gap-4">
            {news.map((post) => (
              <li key={post.slug}>
                <Link href={`/nyheter/${post.slug}`} className="grid gap-3 rounded-3xl border-l-4 border-[#1b1023] bg-white px-6 py-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:px-8">
                  <span className="text-xs font-semibold text-muted">
                    <span className="uppercase tracking-[0.14em]">{post.kind}</span>
                    <time dateTime={post.date} className="mt-2 block font-price text-sm font-medium normal-case tracking-normal text-ink">
                      {formatNewsDate(post.date)}
                    </time>
                    {post.example ? <span className="mt-3 inline-flex rounded-full bg-gold px-2 py-0.5 text-[0.68rem] font-bold text-night">Exempeltext</span> : null}
                  </span>
                  <span>
                    <span className="block text-xl font-extrabold tracking-tight">{post.title}</span>
                    <span className="mt-2 block text-sm leading-7 text-muted">{post.lead}</span>
                    <span className="mt-2 block text-sm leading-7 text-ink/80">{post.body.find((line) => !line.startsWith("Exempeltext"))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="fragor" aria-labelledby="fragor-rubrik" className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h2 id="fragor-rubrik" className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
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
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
          <div>
            <h2 id="sista" className="max-w-xl text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
              Alla Sveriges företag, i ett utdrag.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {stats.source === "register"
                ? `${formatCount(stats.total)} aktiva företag i dag. Siffran följer den senaste uppdateringen. Välj vilka ni vill nå och se priset direkt.`
                : "Registret är inte inkopplat. Välj vilka ni vill nå och se priset när det finns."}
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
