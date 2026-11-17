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
import { linkedIndustries, topicBuilderHref } from "@/lib/topics";
import type { UrvalResult } from "@/lib/urval";

const FREE_ACCESS = "Ingen inloggning. Ingen prenumeration. Ingen bindningstid.";

const STEPS = [
  { title: "Välj vilka ni vill nå", text: "Skriv frisör, bygg eller en SNI-kod. Lägg till ort eller län om ni vill." },
  { title: "Se antal och pris direkt", text: "Talet räknas om medan ni väljer. Priset står under, innan ni bestämmer er." },
  { title: "Få filen", text: "CSV eller Excel med de fält ni valt. Ingen prenumeration, ingen bindningstid." },
];

const BENEFITS = [
  "Färsk data från officiella register",
  "Nya bolag kommer med vid varje uppdatering",
  "Reklamspärrade bolag tas alltid bort",
  "Ingen inloggning och ingen prenumeration",
];

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
  exampleData,
  stats,
  news,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string;
  exampleData: boolean;
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
  const stripItems = [...industries, ...industries];

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-x-10 gap-y-6 px-4 pt-6 pb-10 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:pt-10">
        <div className="float-in min-w-0 lg:pt-4">
          <p className="font-price text-xs font-bold tracking-[0.16em] text-magenta uppercase">Utdrag för sälj och marknad</p>
          <h1 className="mt-3 text-[3.2rem] leading-[0.92] font-extrabold tracking-[-0.04em] sm:text-7xl lg:text-[5.1rem]">
            Alla Sveriges företag.
            <span className="aurora-text block pb-1">Se antal och pris direkt.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-muted">
            Välj bransch och region i listbyggaren. Ni ser direkt hur många kunder ni når och vad utdraget kostar, innan ni bestämmer er.
          </p>
        </div>
        <div className="min-w-0 lg:row-span-2">
          <p className="promise-row mb-3">{FREE_ACCESS}</p>
          <AuroraBuilder draft={draft} onChange={patch} urval={urval} loading={loading} updatedLabel={updatedLabel} exampleData={exampleData} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-3">
            <a href="#urval" className="btn-neon inline-flex h-12 items-center gap-2 rounded-xl px-5 font-bold">
              Bygg ert utdrag <span aria-hidden="true">→</span>
            </a>
            <a href="#statistik" className="btn-ghost inline-flex h-12 items-center rounded-xl px-5 font-bold">
              Näringslivet i siffror
            </a>
          </div>
          <ul className="mt-6 grid max-w-xl gap-x-6 gap-y-2 text-sm font-medium sm:grid-cols-2">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neon text-[0.6rem] font-bold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="marquee border-y border-line bg-white py-3" aria-label="Populära branscher">
        <ul className="marquee-track gap-2">
          {stripItems.map((topic, index) => (
            <li key={`${topic.slug}-${index}`} aria-hidden={index >= industries.length}>
              <Link
                href={topicBuilderHref(topic)}
                tabIndex={index >= industries.length ? -1 : undefined}
                className="chip mx-1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap"
              >
                <span className="text-magenta" aria-hidden="true">
                  ✦
                </span>
                {topic.nav}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <NaringslivSection stats={stats} />

      <section id="sa-funkar-det" aria-labelledby="steg" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <h2 id="steg" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Tre steg. <span className="aurora-text">Typ en minut.</span>
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="glass relative overflow-hidden rounded-3xl p-5">
              <span aria-hidden="true" className="font-display pointer-events-none absolute -top-4 -right-1 text-[7rem] leading-none font-extrabold text-magenta opacity-15">
                {index + 1}
              </span>
              <h3 className="relative text-2xl font-bold">{step.title}</h3>
              <p className="relative mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <a href="#urval" className="btn-neon mt-8 inline-flex h-12 items-center rounded-full px-6 font-bold">
          Börja med steg ett
        </a>
      </section>

      <section id="branscher" aria-labelledby="branscher-rubrik" className="section-calm">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="branscher-rubrik" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Vilka vill ni sälja till?
          </h2>
          {stats.source === "example" ? <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-night">Antal: exempeldata</span> : null}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {industries.map((topic) => {
            const count = stats.byIndustry.find((item) => item.sni === topic.sni)?.count;
            return (
              <li key={topic.slug}>
                <Link
                  href={topic.sni ? builderHrefForSni(topic.sni) : "/#urval"}
                  className="glass group flex h-full flex-col rounded-3xl p-4 transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="text-xs font-semibold text-muted">SNI {topic.sni ? `${topic.sni.slice(0, 2)}.${topic.sni.slice(2)}` : ""}</span>
                  <span className="font-display mt-1 text-xl font-bold">{topic.nav}</span>
                  {count ? <span className="mt-2 text-2xl font-extrabold text-neon tabular-nums">{formatCount(count)}</span> : null}
                  <span className="mt-auto pt-3 text-sm font-semibold text-magenta group-hover:underline">Se pris →</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/bransch" className="text-magenta hover:underline">
            Alla branscher
          </Link>
          <Link href="/sni" className="text-magenta hover:underline">
            SNI-koder
          </Link>
        </p>
        </div>
      </section>

      <section id="pris" aria-labelledby="pris-rubrik" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="font-price text-xs font-bold tracking-[0.16em] text-magenta uppercase">Innehåll och pris</p>
            <h2 id="pris-rubrik" className="mt-3 text-4xl leading-[0.98] font-extrabold tracking-[-0.03em] sm:text-5xl">
              Ni betalar endast för det ni behöver.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Varje bolag har grunddata. Kontaktuppgifter väljer ni till per rad, och ett tomt fält kostar inget. Lägsta order{" "}
              {formatKronor(MINIMUM_ORE).replace(",00", "")} kr exkl. moms.
            </p>
            <p className="promise-row mt-5 max-w-md">{FREE_ACCESS}</p>
            <a href="#urval" className="btn-neon mt-5 inline-flex h-12 items-center gap-2 rounded-xl px-5 font-bold">
              Räkna på ert urval <span aria-hidden="true">→</span>
            </a>
          </div>
          <dl className="glass divide-y divide-line overflow-hidden rounded-3xl">
            {PRICE_ROWS.map((row) => (
              <div key={row.title} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-display text-lg font-bold">{row.title}</dt>
                  <dd className="font-price shrink-0 text-sm font-bold text-magenta uppercase">{row.price}</dd>
                </div>
                <dd className="mt-1 text-sm text-muted">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <h3 className="mt-12 text-2xl font-bold">Räkneexempel</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {PRICE_EXAMPLES.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="glass flex h-full flex-col rounded-3xl p-5 transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="font-display text-xl font-bold">{item.title}</span>
                <span className="mt-1 text-sm text-muted">{item.detail}</span>
                <span className="font-price mt-4 text-3xl font-bold text-ink">{formatKronor(item.quote.totalOre)} kr</span>
                <span className="text-xs text-muted">{item.quote.minimumApplied ? "Lägsta order. " : ""}Exkl. moms, engångspris.</span>
                <span className="mt-auto pt-4 text-sm font-bold text-magenta">Räkna på ert eget urval →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="nyheter" aria-labelledby="nyheter-rubrik" className="section-calm">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="nyheter-rubrik" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Nyheter och uppdateringar
          </h2>
          <Link href="/nyheter" className="btn-ghost rounded-full px-4 py-2 text-sm font-semibold">
            Alla nyheter →
          </Link>
        </div>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {news.map((post) => (
            <li key={post.slug}>
              <Link href={`/nyheter/${post.slug}`} className="glass group flex h-full flex-col rounded-3xl p-5">
                <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="text-magenta">{post.kind}</span>
                  <time dateTime={post.date} className="text-muted">
                    {formatNewsDate(post.date)}
                  </time>
                  {post.example ? <span className="rounded-full bg-foam px-2 py-0.5 text-muted">Exempeltext</span> : null}
                </span>
                <span className="font-display mt-2 text-xl leading-snug font-bold group-hover:underline">{post.title}</span>
                <span className="mt-2 text-sm text-muted">{post.lead}</span>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </section>

      <section id="fragor" aria-labelledby="fragor-rubrik" className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <h2 id="fragor-rubrik" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Vanliga frågor
        </h2>
        <div className="mt-6 space-y-2">
          {PUBLIC_FAQ.map((item) => (
            <details key={item.q} className="glass group rounded-2xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold">
                {item.q}
                <span aria-hidden="true" className="text-neon transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="sista" className="px-4 pt-6 pb-20">
        <div className="builder-card mx-auto max-w-5xl rounded-[2rem] px-6 py-12 text-center sm:py-16">
          <h2 id="sista" className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="aurora-text">Alla Sveriges företag.</span>
            <br />
            Ett utdrag bort.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            {formatCount(stats.total)} bolag{stats.source === "example" ? " (exempeldata)" : ""}. Välj de ni vill nå och se priset direkt.
          </p>
          <a href="#urval" className="btn-neon mt-7 inline-flex h-14 items-center rounded-full px-8 text-lg font-bold">
            Skapa ert utdrag
          </a>
        </div>
      </section>
    </main>
  );
}
