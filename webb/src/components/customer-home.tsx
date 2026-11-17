"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListBuilder } from "@/components/builder";
import { HomeMore } from "@/components/home-more";
import { SampleOffer } from "@/components/sample-offer";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import type { UrvalResult } from "@/lib/urval";
import { linkedIndustries, topicPath } from "@/lib/topics";

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
    text: "Betala som gäst. Filen skickas till er e-post, utan konto och utan abonnemang.",
  },
];

const QUESTIONS = [
  {
    q: "Vad kostar utdraget?",
    a: "Grunduppgifter kostar 10 öre per bolag. Telefon kostar 30 öre per nummer, e-post 40 öre per adress och beslutsfattare 40 öre per nummer. Ni betalar bara när uppgiften finns. Lägsta order är 399 kr, och priset visas alltid innan ni köper.",
  },
  {
    q: "Hur aktuellt är utdraget?",
    a: "Vi arbetar endast med aktuella uppgifter. Namn, adress, bransch och SNI kommer från SCB:s företagsregister, och utdraget tas alltid från den senaste uppdateringen. Äldre register används inte. Det är inte en direktuppdatering varje minut.",
  },
  {
    q: "Måste jag skapa ett konto?",
    a: "Nej. Ni betalar som gäst med kort eller faktura. Filen skickas till e-postadressen ni anger.",
  },
  {
    q: "Vilket format får jag?",
    a: "CSV och Excel med fasta kolumner: företagsnamn, organisationsnummer, adress, ort, bransch och SNI, plus de tillval ni har kryssat i. Ett smakprov med påhittade rader kan laddas ner innan köp.",
  },
];

export function CustomerHome({
  initial,
  initialUrval,
  updatedLabel,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  updatedLabel: string | null;
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
    window.history.replaceState(null, "", share ? `/?${share}` : "/");
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
      <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1fr)] lg:gap-12 lg:py-16">
        <article>
          <p className="text-sm uppercase tracking-[0.18em] text-sea">Företagsdata</p>
          <h1 className="mt-3 max-w-xl text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Skapa ert utdrag av företagsregistret.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Välj bransch och ort. Ni får namn, organisationsnummer, adress, bransch och SNI, och slipper hämta,
            rensa och uppdatera uppgifterna själva. Telefon, e-post och beslutsfattare läggs till där de finns.
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            Inget abonnemang och inget konto. Priset visas alltid innan ni köper. Lägsta order är 399 kr.
          </p>
          <dl id="pris" className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-foam px-3 py-3">
              <dt className="text-sm text-muted">Lägsta order</dt>
              <dd className="mt-1 text-2xl tracking-tight text-sea">{(MINIMUM_ORE / 100).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr</dd>
            </div>
            <PriceUnit label="Grunduppgifter" ore={BASE_ORE} detail="per komplett rad" tone="green" />
            <PriceUnit label="Telefon" ore={PHONE_ORE} detail="per nummer" tone="blue" />
            <PriceUnit label="E-post" ore={EMAIL_ORE} detail="per adress" tone="green" />
            <PriceUnit label="Beslutsfattare" ore={SIGNATORY_ORE} detail="per nummer" tone="yellow" />
          </dl>
        </article>

        <ListBuilder draft={draft} onChange={patch} urval={urval} loading={loading} />
      </section>

      <section id="sa-funkar-det" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <h2 className="text-2xl tracking-tight">Tre steg</h2>
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
              <li key={item.title} className="rounded-2xl border border-line bg-white/80 px-4 py-4">
                <h3 className={`text-lg tracking-tight ${item.title === "Konkurs och näringsförbud" ? "text-rust" : ""}`}>{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="fragor" className="band-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="fragor" className="text-4xl tracking-tight">Vanliga frågor</h2>
          <div className="mt-6 max-w-3xl divide-y divide-line rounded-3xl border border-line bg-white">
            {QUESTIONS.map((item) => (
              <details key={item.q} className="px-5 py-4">
                <summary className="cursor-pointer text-lg tracking-tight">{item.q}</summary>
                <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="band-lime">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <h2 className="text-3xl tracking-tight">Branscher och ord</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Välj en bransch och öppna samma urval i utdraget.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {linkedIndustries().map((topic) => (
            <li key={topic.slug}>
              <Link href={topicPath(topic)} className="inline-flex rounded-full border border-line bg-card px-3 py-2 text-sm">
                {topic.nav}
              </Link>
            </li>
          ))}
        </ul>
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
  const wash = tone === "green" ? "bg-green-soft" : tone === "yellow" ? "bg-amber-soft" : "bg-foam";
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

