"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListBuilder } from "@/components/builder";
import { UrvalWalkthrough } from "@/components/urval-walkthrough";
import { HomeMore } from "@/components/home-more";
import { SampleOffer } from "@/components/sample-offer";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import type { UrvalResult } from "@/lib/urval";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { linkedIndustries, topicBuilderHref } from "@/lib/topics";
import { StatusChip } from "@/components/status-chip";

const LEFT_OUT = [
  {
    title: "Avregistrerade bolag",
    text: "Bolag som har avregistrerats tas bort när registret uppdateras. De ligger inte kvar i nästa utdrag.",
  },
  {
    title: "Konkurs och näringsförbud",
    text: "Bolag i konkurs, inaktiva bolag och bolag med näringsförbud följer inte med i det ni köper.",
  },
  {
    title: "Reklamspärr",
    text: "Bolag som har spärrat reklam säljs inte. Ni behöver inte rensa filen själva.",
  },
  {
    title: "Uppgifter som saknas",
    text: "Finns inget telefonnummer eller ingen e-post lämnas fältet tomt. Ett tomt fält kostar inget.",
  },
];

const STEPS = [
  {
    title: "Välj bransch och ort",
    text: "Skriv frisör, restaurang eller revisionsbyrå. Förslagen är branscher, inte enskilda bolag.",
  },
  {
    title: "Se antal och pris",
    text: "Antalet och priset står i utdraget direkt. Priset visas alltid innan ni köper.",
  },
  {
    title: "Få filen",
    text: "Förhandsboka med e-post. Beställning öppnar snart. Ingen betalning dras.",
  },
];

export function CustomerHome({
  initial,
  initialUrval,
  updatedLabel,
  registerReady = false,
  exampleData = false,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string | null;
  registerReady?: boolean;
  exampleData?: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [urval, setUrval] = useState(initialUrval);
  const [loading, setLoading] = useState(false);
  const counted = selectionForCount(draft);
  const priced: Selection = {
    ...(counted ?? draft),
    query: draft.query,
    phones: draft.phones,
    emails: draft.emails,
    signatory: draft.signatory,
  };
  const share = selectionToQuery(priced);
  const searchKey = counted
    ? selectionToQuery({ ...counted, phones: false, emails: false, signatory: false })
    : "";

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
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchKey]);

  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = new URLSearchParams(share);
    const tema = current.get("tema");
    const filter = current.get("filter");
    if (tema) next.set("tema", tema);
    if (filter) next.set("filter", filter);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `/?${query}` : "/");
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
      <section className="home-hero mx-auto grid max-w-6xl items-start gap-6 px-4 py-3 sm:py-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1fr)] lg:gap-8 lg:py-4">
        <article className="min-w-0">
          <p className="text-sm uppercase tracking-[0.18em] text-sea">Utan prenumeration</p>
          <h1 className="mt-3 max-w-xl text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Fyll i utdraget. Se antal kunder och pris direkt.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Ingen prenumeration och ingen bindningstid. Ni ser hur många bolag som matchar, och vad filen kostar, innan ni går vidare.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            <li className="promise bg-foam px-3 py-1 font-medium">Fyll i utdraget</li>
            <li className="promise bg-green-soft px-3 py-1 font-medium text-green">Se antal och pris direkt</li>
            <li className="promise bg-amber-soft px-3 py-1 font-medium">Ingen bindningstid</li>
          </ul>
          <div className="mt-4">
            <StatusChip updatedLabel={updatedLabel} registerReady={registerReady} exampleData={exampleData} />
          </div>
          <Link href="/#urval" className="btn-fade-sea mt-5 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Skapa ert utdrag
          </Link>
          <dl id="pris" className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="wash-sea rounded-2xl px-3 py-3">
              <dt className="text-sm text-muted">Lägsta order</dt>
              <dd className="mt-1 text-2xl tracking-tight text-sea">{(MINIMUM_ORE / 100).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr</dd>
            </div>
            <PriceUnit label="Grunduppgifter" ore={BASE_ORE} detail="per komplett rad" tone="green" />
            <PriceUnit label="Kontaktnummer" ore={PHONE_ORE} detail="per nummer" tone="blue" />
            <PriceUnit label="E-postkontakt" ore={EMAIL_ORE} detail="per adress" tone="green" />
            <PriceUnit label="Beslutsfattare" ore={SIGNATORY_ORE} detail="per nummer" tone="yellow" />
          </dl>
          <p className="mt-2 text-xs text-muted">Priser exklusive moms. Lägsta order 399 kr.</p>
        </article>

        <div className="builder-slot min-w-0">
          <ListBuilder draft={draft} onChange={patch} urval={urval} loading={loading} updatedLabel={updatedLabel} exampleData={exampleData} />
        </div>
      </section>

      <UrvalWalkthrough onUse={patch} />

      <section id="sa-funkar-det" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <h2 className="text-2xl tracking-tight">Tre steg till filen</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3 rounded-2xl bg-foam px-4 py-3">
                <StepNumber n={String(index + 1)} />
                <div>
                  <h3 className="font-medium leading-7">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/#urval" className="btn-fade-sea mt-5 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Börja med bransch och ort
          </Link>
        </div>
      </section>

      <SampleOffer selection={counted ?? draft} />

      <HomeMore updatedLabel={updatedLabel} />

      <section aria-labelledby="utanfor" className="band-mint">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <h2 id="utanfor" className="max-w-3xl text-3xl tracking-tight">
            Det som inte ska med i filen
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Utdraget ska gå att använda direkt. Därför tas bolag ni inte ska kontakta bort, och en uppgift som saknas
            lämnas tom.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {LEFT_OUT.map((item) => (
              <li
                key={item.title}
                className={`rounded-2xl border px-4 py-4 ${
                  item.title === "Konkurs och näringsförbud" ? "wash-rust border-rust/25" : "border-line bg-white/80"
                }`}
              >
                <h3 className={`text-lg tracking-tight ${item.title === "Konkurs och näringsförbud" ? "text-rust" : ""}`}>{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/#urval" className="btn-fade-sea mt-6 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Se antalet i utdraget
          </Link>
        </div>
      </section>

      <section aria-labelledby="fragor" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="fragor" className="text-4xl tracking-tight">Vanliga frågor</h2>
          <div className="mt-6 max-w-3xl divide-y divide-line rounded-3xl border border-line bg-white">
            {PUBLIC_FAQ.map((item) => (
              <details key={item.q} className="px-5 py-4">
                <summary className="cursor-pointer text-lg tracking-tight">{item.q}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <Link href="/#urval" className="btn-fade-sea mt-6 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
            Skapa ert utdrag
          </Link>
        </div>
      </section>

      <section id="branscher" className="band-lime">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <h2 className="text-3xl tracking-tight">Välj en bransch och se priset</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Varje bransch öppnar utdraget med den SNI-koden ifylld. Antalet räknas direkt.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {linkedIndustries().map((topic) => (
            <li key={topic.slug}>
              <Link href={topicBuilderHref(topic)} className="inline-flex rounded-full border border-line bg-card px-3 py-2 text-sm">
                {topic.nav}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/#urval" className="btn-fade-amber mt-6 inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink">
          Skapa ert utdrag
        </Link>
        <p className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
          <Link href="/bransch" className="text-sea">
            Alla branscher
          </Link>
          <Link href="/sni" className="text-sea">
            SNI-koder
          </Link>
          <Link href="/ord" className="text-sea">
            Ord om företagsdata
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}

function StepNumber({ n }: { n: string }) {
  return (
    <p className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea text-sm font-medium text-white">
      {n}
    </p>
  );
}

function PriceUnit({
  label,
  ore,
  detail,
  tone,
}: {
  label: string;
  ore: number;
  detail: string;
  tone: "blue" | "green" | "yellow";
}) {
  const wash = tone === "green" ? "wash-green" : tone === "yellow" ? "wash-amber" : "wash-sea";
  const number = tone === "green" ? "text-green" : tone === "yellow" ? "text-ink" : "text-sea";
  return (
    <div className={`rounded-2xl px-3 py-3 ${wash}`}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`mt-1 text-2xl tracking-tight ${number}`}>{formatKronor(ore)} kr</dd>
      <p className="text-xs text-muted">
        {ore} öre {detail}
      </p>
    </div>
  );
}

