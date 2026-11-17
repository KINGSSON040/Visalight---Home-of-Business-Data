"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PopBuilder } from "@/components/pop-builder";
import { NewsCards } from "@/components/pop-news";
import { ExampleBadge, StatsShowcase } from "@/components/pop-stats";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import type { NewsItem } from "@/lib/news";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, quote, SIGNATORY_ORE } from "@/lib/pricing";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import type { RegisterOverview } from "@/lib/register-stats";
import { linkedIndustries, topicBuilderHref } from "@/lib/topics";
import type { UrvalResult } from "@/lib/urval";

const BENEFITS = [
  "Färsk data från SCB:s företagsregister",
  "Nya bolag kommer med vid varje uppdatering",
  "Reklamspärrade bolag tas alltid bort",
  "Inget abonnemang, ingen bindning",
];

const PRICE_ROWS = [
  { title: "Företagsuppgifter (grunddata)", price: `${formatKronor(BASE_ORE)} kr/bolag`, text: "Namn, organisationsnummer, adress, ort, bransch och SNI-kod. Ingår i varje rad." },
  { title: "Kontaktnummer", price: `+${formatKronor(PHONE_ORE)} kr/rad`, text: "Bolagets växel- eller företagsnummer. Ni betalar bara för bolag som har ett nummer." },
  { title: "Beslutsfattare med direktnummer", price: `+${formatKronor(SIGNATORY_ORE)} kr/rad`, text: "Direktnummer till den som bestämmer. Ni betalar bara där numret finns." },
  { title: "E-post", price: `+${formatKronor(EMAIL_ORE)} kr/rad`, text: "Bolagets e-postadress. Ni betalar bara för bolag som har en adress." },
];

const STEPS = [
  {
    title: "Välj bransch och ort",
    text: "Skriv frisör, bygg eller Skåne. Förslagen är branscher, orter och län, aldrig enskilda bolag.",
    tone: "bg-[var(--pop-sun)] tilt-l",
  },
  {
    title: "Se antal och pris",
    text: "Siffran rullar fram direkt. Priset står under, exklusive moms, innan ni bestämmer er.",
    tone: "bg-[var(--pop-lime)] tilt-r",
  },
  {
    title: "Få filen",
    text: "CSV eller Excel. Ingen prenumeration, ingen bindningstid. Ni betalar för ett utdrag, en gång.",
    tone: "bg-[var(--pop-coral)] text-white tilt-l",
  },
];

const PRICE_EXAMPLES = [
  {
    title: "Frisörer i en stad",
    detail: "250 bolag, bara grunduppgifter",
    counts: { companies: 250, phones: 0, signatoryPhones: 0, emails: 0 },
    tone: "bg-white",
  },
  {
    title: "Restauranger med telefon",
    detail: "2 000 bolag och 1 400 telefonnummer",
    counts: { companies: 2_000, phones: 1_400, signatoryPhones: 0, emails: 0 },
    tone: "bg-[var(--pop-sun)]",
  },
  {
    title: "Byggbolag, allt med",
    detail: "20 000 bolag, 14 000 nummer, 6 000 beslutsfattare, 8 000 e-post",
    counts: { companies: 20_000, phones: 14_000, signatoryPhones: 6_000, emails: 8_000 },
    tone: "bg-[var(--pop-lime)]",
  },
];

const TRADE_TONES = [
  "bg-[var(--pop-sun)]",
  "bg-white",
  "bg-[var(--pop-lime)]",
  "bg-[var(--pop-coral)] text-white",
  "bg-white",
  "bg-[var(--pop-magenta)] text-white",
  "bg-[var(--pop-sun)]",
  "bg-[var(--pop-lime)]",
];

export function CustomerHome({
  initial,
  initialUrval,
  updatedLabel,
  exampleData,
  overview,
  news,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string;
  exampleData: boolean;
  overview: RegisterOverview;
  news: NewsItem[];
}) {
  const [draft, setDraft] = useState(initial);
  const [urval, setUrval] = useState(initialUrval);
  const [loading, setLoading] = useState(false);
  const counted = selectionForCount(draft);
  const share = selectionToQuery({ ...(counted ?? draft), query: draft.query, phones: draft.phones, emails: draft.emails, signatory: draft.signatory });
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
    const next = share.replace(/(^|&)(tel|firma|epost)=1/g, "").replace(/^&/, "");
    window.history.replaceState(null, "", `${next ? `/?${next}` : "/"}${window.location.hash}`);
  }, [share]);

  function patch(next: Partial<Selection>) {
    setDraft((current) => {
      const merged = { ...current, ...next };
      const typing =
        typeof next.query === "string" &&
        next.sni === undefined &&
        next.bransch === undefined &&
        next.query !== current.query &&
        next.query.trim().length > 0;
      if (typing) {
        merged.sni = "";
        merged.bransch = "";
      }
      return merged;
    });
  }

  return (
    <main>
      <section className="pop-dots relative overflow-x-clip">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-5 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-10 lg:pt-6 lg:pb-8">
          <div className="relative min-w-0">
            <p className="eyebrow text-[var(--pop-magenta-deep)]">Företagslistor · utdrag ur registret</p>
            <h1 className="mt-4 text-[clamp(3rem,6.2vw,5.9rem)] leading-[0.9]">
              <span className="block">Alla Sveriges</span>
              <span className="block">företag.</span>
              <span className="mt-1 block text-[var(--pop-magenta)]">
                Se antal och pris <span className="relative inline-block">direkt.<span aria-hidden="true" className="absolute right-0 -bottom-1 left-0 h-[0.12em] -rotate-1 rounded-full bg-[var(--pop-sun)]" /></span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 font-medium text-[#3d2440] sm:mt-6 sm:text-lg">
              Fyll i listbyggaren: bransch, region och vilka kontaktuppgifter ni vill ha. Antalet och priset syns direkt. Ingen prenumeration, ingen bindningstid.
            </p>
            <div className="mt-6 hidden flex-wrap gap-3 sm:flex">
              <button
                type="button"
                onClick={() => document.querySelector<HTMLInputElement>("#urval input[role=combobox]")?.focus()}
                className="pop-btn pop-btn--magenta h-13 px-6 text-base"
              >
                Bygg en företagslista <span aria-hidden="true">→</span>
              </button>
              <Link href="/statistik" className="pop-btn pop-btn--white h-13 px-6 text-base">
                Se näringslivet i siffror
              </Link>
            </div>
            <ul className="mt-6 hidden max-w-xl gap-x-6 gap-y-2 text-sm font-semibold sm:grid sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[var(--pop-ink)] bg-[var(--pop-lime)] text-[0.7rem] font-black">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-w-0">
            <p aria-hidden="true" className="sticker-sm tilt-r font-display absolute -top-4 right-4 z-10 hidden bg-[var(--pop-sun)] px-3 py-1 text-sm sm:block">
              Ingen bindningstid!
            </p>
            <PopBuilder
              draft={draft}
              onChange={patch}
              urval={urval}
              loading={loading}
              registerTotal={overview.total}
              registerReal={overview.real}
              updatedLabel={updatedLabel}
              exampleData={exampleData}
            />
            <ul className="mt-5 grid gap-2 text-sm font-semibold sm:hidden">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[var(--pop-ink)] bg-[var(--pop-lime)] text-[0.7rem] font-black">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="marquee border-y-[3px] border-[var(--pop-ink)] bg-[var(--pop-ink)] py-3 text-[var(--pop-sun)]" aria-hidden="true">
        <div className="marquee-track font-display text-2xl uppercase">
          {[0, 1].map((round) => (
            <span key={round} className="inline-flex gap-10">
              {["Restauranger", "Frisörer", "Byggföretag", "Redovisning", "Åkerier", "Vårdcentraler", "Datakonsulter", "Livsmedel"].map((word, index) => (
                <span key={word} className={index % 2 ? "text-[var(--pop-lime)]" : ""}>
                  {word} ✦
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section id="statistik" aria-labelledby="statistik-rubrik" className="band-mint">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="sticker-sm tilt-r-sm inline-flex bg-[var(--pop-sun)] px-3 py-1 text-xs font-extrabold tracking-[0.14em] uppercase">Uppdateras med registret</p>
              <h2 id="statistik-rubrik" className="mt-4 max-w-3xl text-4xl leading-[0.95] sm:text-6xl">
                Sveriges näringsliv <span className="text-[var(--pop-magenta)]">i siffror</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ExampleBadge real={overview.real} />
              <Link href="/statistik" className="pop-btn pop-btn--white h-11 px-4 text-sm">
                All statistik <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          {!overview.real ? (
            <p className="mt-3 max-w-2xl text-sm font-semibold text-muted">
              Registret är inte inkopplat i den här körningen. Talen nedan är exempeldata och inte verkliga siffror.
            </p>
          ) : null}
          <div className="mt-8">
            <StatsShowcase overview={overview} />
          </div>
        </div>
      </section>

      <section id="sa-funkar-det" aria-labelledby="steg-rubrik" className="band-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 id="steg-rubrik" className="text-4xl sm:text-6xl">
            Tre steg. <span className="text-[var(--pop-coral)]">Klart.</span>
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className={`sticker relative p-6 pt-10 ${step.tone}`}>
                <span className="font-display absolute -top-6 left-5 grid h-14 w-14 place-items-center rounded-full border-[3px] border-[var(--pop-ink)] bg-white text-2xl text-[var(--pop-ink)]">
                  {index + 1}
                </span>
                <h3 className="font-display text-2xl leading-tight">{step.title}</h3>
                <p className="mt-2 text-base leading-7 font-semibold">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/#urval" className="pop-btn pop-btn--magenta mt-10 h-14 px-7 text-lg">
            Starta listbyggaren <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section id="branscher" aria-labelledby="bransch-rubrik" className="band-lime">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 id="bransch-rubrik" className="max-w-4xl text-4xl sm:text-6xl">
            Vilka vill ni sälja till?
          </h2>
          <p className="mt-3 max-w-2xl text-lg font-semibold">Tryck på en bransch. Listbyggaren öppnas med den ifylld och räknar direkt.</p>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {linkedIndustries()
              .slice(0, 8)
              .map((topic, index) => (
                <li key={topic.slug}>
                  <Link
                    href={topicBuilderHref(topic)}
                    className={`sticker hover-wiggle flex h-full min-h-28 flex-col justify-between p-4 ${TRADE_TONES[index % TRADE_TONES.length]} ${index % 2 ? "tilt-r-sm" : "tilt-l-sm"}`}
                  >
                    <span className="font-display text-xl leading-tight sm:text-2xl">{topic.nav}</span>
                    <span className="mt-3 text-sm font-extrabold">Se antal och pris →</span>
                  </Link>
                </li>
              ))}
          </ul>
          <p className="mt-6 flex flex-wrap gap-4 text-sm font-extrabold">
            <Link href="/bransch" className="underline decoration-[3px] underline-offset-4">
              Alla branscher
            </Link>
            <Link href="/sni" className="underline decoration-[3px] underline-offset-4">
              SNI-koder
            </Link>
          </p>
        </div>
      </section>

      <section id="pris" aria-labelledby="pris-rubrik" className="band-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="eyebrow text-[var(--pop-magenta-deep)]">Innehåll och pris</p>
            <h2 className="mt-3 text-4xl leading-[0.95] sm:text-6xl">
              Ni betalar endast för <span className="text-[var(--pop-magenta)]">det ni behöver.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-7 font-medium">
              Varje bolag har grunddata. Kontaktuppgifter väljer ni till per rad. Lägsta order {formatKronor(MINIMUM_ORE)} kr exkl. moms.
            </p>
            <ul className="mt-8 grid gap-3">
              {PRICE_EXAMPLES.map((example) => {
                const price = quote(example.counts);
                return (
                  <li key={example.title} className={`sticker flex items-center justify-between gap-4 px-4 py-3 ${example.tone}`}>
                    <span className="min-w-0">
                      <span className="block font-extrabold">{example.title}</span>
                      <span className="block text-xs font-semibold opacity-90">{example.detail}</span>
                    </span>
                    <span className="mono shrink-0 text-lg font-medium tabular-nums">{formatKronor(price.totalOre)} kr</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs font-semibold text-muted">Räkneexempel exkl. moms. Antalen är påhittade.</p>
            <Link href="/#urval" className="pop-btn pop-btn--magenta mt-6 h-12 px-5 text-base">
              Räkna på ert utdrag <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="sticker divide-y-[2.5px] divide-[var(--pop-ink)] self-start overflow-hidden bg-white">
            {PRICE_ROWS.map((row, index) => (
              <li key={row.title} className={`px-5 py-5 ${index === 0 ? "bg-[var(--pop-cream)]" : ""}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-lg font-extrabold">{row.title}</h3>
                  <span className="mono text-sm font-medium tracking-[0.08em] text-[var(--pop-magenta-deep)] uppercase">{row.price}</span>
                </div>
                <p className="mt-2 text-sm leading-6 font-medium text-muted">{row.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="nyheter" aria-labelledby="nyheter-rubrik" className="band-mint">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="nyheter-rubrik" className="text-4xl sm:text-6xl">
              Nyheter och <span className="text-[var(--pop-coral)]">uppdateringar</span>
            </h2>
            <Link href="/nyheter" className="pop-btn pop-btn--white h-11 px-4 text-sm">
              Alla nyheter <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10">
            <NewsCards items={news.slice(0, 3)} />
          </div>
        </div>
      </section>

      <section id="fragor" aria-labelledby="fragor-rubrik" className="band-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 id="fragor-rubrik" className="text-4xl sm:text-6xl">
              Frågor? <span className="text-[var(--pop-magenta)]">Svar.</span>
            </h2>
            <p className="mt-4 max-w-sm text-lg font-semibold">Det folk brukar undra innan de bygger sitt första utdrag.</p>
          </div>
          <div className="space-y-3">
            {PUBLIC_FAQ.map((item) => (
              <details key={item.q} className="sticker bg-white px-5 py-4 open:bg-[#fff2a6]">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-extrabold">
                  {item.q}
                  <span aria-hidden="true" className="faq-plus font-display grid h-8 w-8 shrink-0 place-items-center rounded-full border-[2.5px] border-[var(--pop-ink)] bg-[var(--pop-lime)]">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-base leading-7 font-medium">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="sista-rubrik" className="border-t-[3px] border-[var(--pop-ink)] bg-[var(--pop-magenta)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24">
          <h2 id="sista-rubrik" className="text-5xl leading-[0.95] sm:text-7xl">
            Alla Sveriges företag.
            <br />
            <span className="text-[var(--pop-sun)]">Ett klick bort.</span>
          </h2>
          <p className="max-w-xl text-xl font-semibold">Se antalet och priset innan ni bestämmer er. Ingen prenumeration, ingen bindningstid.</p>
          <Link href="/#urval" className="pop-btn pop-btn--sun h-16 px-8 text-xl">
            Bygg ert utdrag nu <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
