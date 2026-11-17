"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListBuilder } from "@/components/builder";
import { HomeMore } from "@/components/home-more";
import {
  describeSelection,
  sameSearch,
  selectionToQuery,
  type Selection,
} from "@/lib/catalog";
import {
  BASE_ORE,
  EMAIL_ORE,
  formatKronor,
  MINIMUM_ORE,
  PHONE_ORE,
  SIGNATORY_ORE,
} from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";
import { linkedIndustries, topicPath } from "@/lib/topics";

const LEFT_OUT = [
  {
    title: "Avregistrerade bolag",
    text: "Bolag som har avregistrerats tas bort när registret uppdateras. De ligger inte kvar i nästa fil.",
  },
  {
    title: "Konkurs och näringsförbud",
    text: "Bolag i konkurs, inaktiva bolag och bolag med näringsförbud följer inte med i det du köper.",
  },
  {
    title: "Reklamspärr",
    text: "Bolag som har spärrat reklam säljs inte. Du behöver inte rensa filen själv.",
  },
  {
    title: "Uppgifter som saknas",
    text: "Finns inget telefonnummer eller ingen e-post lämnas fältet tomt. Ett tomt fält kostar inget.",
  },
];

const QUESTIONS = [
  {
    q: "Vad kostar listan?",
    a: "Grunduppgifter kostar 10 öre per bolag. Telefon kostar 30 öre per nummer, e-post 40 öre per adress och beslutsfattare 40 öre per nummer. Du betalar bara när uppgiften finns. Lägsta order är 399 kr, och priset visas innan du betalar.",
  },
  {
    q: "Hur aktuell är listan?",
    a: "Namn, adress, bransch och SNI kommer från SCB:s företagsregister. Registret byts ut när det uppdateras. Det är inte en direktuppdatering varje minut, och det är inte en fil som ligger kvar från förra året.",
  },
  {
    q: "Måste jag skapa ett konto?",
    a: "Nej. Du betalar som gäst med kort eller faktura. Filen skickas till e-postadressen du anger.",
  },
  {
    q: "Vilket format får jag?",
    a: "CSV och Excel med fasta kolumner: företagsnamn, organisationsnummer, adress, ort, bransch och SNI, plus de tillval du har kryssat i. Ett smakprov med påhittade rader kan laddas ner innan köp.",
  },
];

export function CustomerHome({ initial, initialUrval }: { initial: Selection; initialUrval: UrvalResult }) {
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [urval, setUrval] = useState(initialUrval);
  const [loading, setLoading] = useState(false);
  const priced: Selection = {
    ...applied,
    phones: draft.phones,
    emails: draft.emails,
    signatory: draft.signatory,
  };
  const share = selectionToQuery(priced);
  const dirty = !sameSearch(draft, applied);
  const searchKey = selectionToQuery({ ...applied, phones: false, emails: false, signatory: false });

  useEffect(() => {
    const controller = new AbortController();
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
    return () => controller.abort();
  }, [searchKey]);

  useEffect(() => {
    window.history.replaceState(null, "", share ? `/?${share}` : "/");
  }, [share]);

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,1fr)] lg:gap-12 lg:py-16">
        <article>
          <p className="text-sm uppercase tracking-[0.18em] text-sea">Företagslistor</p>
          <h1 className="mt-3 max-w-xl text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl">
            Välj bolagen. Se priset. Få filen.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Sök på bransch och ort och ladda ner en lista med svenska bolag. I grundpriset ingår namn,
            organisationsnummer, adress, bransch och SNI. Telefon, e-post och beslutsfattare lägger du till där
            uppgiften finns.
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            Inget abonnemang och inget konto. Lägsta order är 399 kr.
          </p>
          <dl id="pris" className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Lägsta order</dt>
              <dd className="mt-1 text-2xl tracking-tight">{(MINIMUM_ORE / 100).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr</dd>
            </div>
            <PriceUnit label="Grunduppgifter" ore={BASE_ORE} detail="per komplett rad" />
            <PriceUnit label="Telefon" ore={PHONE_ORE} detail="per nummer" />
            <PriceUnit label="E-post" ore={EMAIL_ORE} detail="per adress" />
            <PriceUnit label="Beslutsfattare" ore={SIGNATORY_ORE} detail="per nummer" />
          </dl>
        </article>

        <ListBuilder
          draft={draft}
          onChange={patch}
          onSearch={() => setApplied(draft)}
          dirty={dirty}
          urval={urval}
          loading={loading}
        />
      </section>

      <section id="sa-funkar-det">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-4xl tracking-tight">Så köper du en lista</h2>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
            Du ser hur många bolag det blir, och vad det kostar, innan du betalar.
          </p>
          <ol className="mt-8 grid gap-4">
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="1" />
              <h3 className="mt-3 text-2xl tracking-tight">Välj vilka bolag</h3>
              <p className="mt-2 max-w-2xl leading-7 text-muted">
                Skriv en bransch, till exempel frisör, restaurang eller revisionsbyrå. Lägg till ort och bolagsform
                om listan ska vara smalare. Förslagen är branscher, inte enskilda bolag.
              </p>
            </li>
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="2" />
              <h3 className="mt-3 text-2xl tracking-tight">Se antal och pris</h3>
              <Result selection={priced} dirty={dirty} urval={urval} />
            </li>
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="3" />
              <h3 className="mt-3 text-2xl tracking-tight">Betala och få filen</h3>
              <p className="mt-2 max-w-2xl leading-7 text-muted">
                Betala som gäst med kort eller faktura. Filen skickas till din e-post när betalningen är klar.
                Du behöver inget konto.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <HomeMore />

      <section aria-labelledby="utanfor" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 id="utanfor" className="max-w-3xl text-4xl tracking-tight">
            Det som inte ska med i filen
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Listan ska gå att använda direkt. Därför tar vi bort bolag du inte ska kontakta, och gissar inte när en
            uppgift saknas.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {LEFT_OUT.map((item) => (
              <li key={item.title} className="rounded-3xl border border-line bg-foam/50 p-5">
                <h3 className="text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="fragor" className="border-t border-line">
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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-4xl tracking-tight">Branscher och ord</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Välj en bransch och öppna samma urval i listan.
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
          <Link href="/ord" className="text-sea">
            Ord om företagsdata
          </Link>
        </p>
      </section>
    </main>
  );
}

function StepNumber({ n }: { n: string }) {
  return (
    <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sea text-sm font-medium text-white">
      {n}
    </p>
  );
}

function PriceUnit({ label, ore, detail }: { label: string; ore: number; detail: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl tracking-tight text-sea">{formatKronor(ore)} kr</dd>
      <p className="text-xs text-muted">
        {ore} öre {detail}
      </p>
    </div>
  );
}

function Result({ selection, dirty, urval }: { selection: Selection; dirty: boolean; urval: UrvalResult }) {
  const counts = pricedCounts(urval, selection);
  const price = priceForUrval(urval, selection);
  const href = `/kassa?${selectionToQuery(selection)}`;
  const noun = urval.source === "register" ? "bolag" : "exempelbolag";

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]" aria-live="polite">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-sea">
          {urval.source === "register" ? "Registret" : "Exempelbolag"}
        </p>
        <p className="mt-2 text-4xl tracking-tight">
          {urval.status === "ready" ? counts.companies.toLocaleString("sv-SE") : "—"}{" "}
          <span className="text-xl text-muted">{noun}</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{describeSelection(selection)}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {dirty ? "Filtren är ändrade. Tryck Sök bolag för att räkna om det här resultatet." : urval.note}
        </p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="font-medium">Kompletta rader med grunduppgifter</dt>
            <dd className="mt-1 text-sm leading-6 text-muted">
              {counts.companies.toLocaleString("sv-SE")} har en komplett rad, {BASE_ORE} öre styck (
              {formatKronor(BASE_ORE)} kr). {counts.companies.toLocaleString("sv-SE")} ×{" "}
              {formatKronor(BASE_ORE)} kr = {formatKronor(counts.companies * BASE_ORE)} kr.
            </dd>
          </div>
          {selection.phones ? (
            <ContactLine title="Telefonnummer" values={counts.phones} valueLabel="nummer" ore={PHONE_ORE} />
          ) : null}
          {selection.emails ? (
            <ContactLine title="E-post" values={counts.emails} valueLabel="adresser" ore={EMAIL_ORE} />
          ) : null}
          {selection.signatory ? (
            <ContactLine title="Beslutsfattarnummer" values={counts.signatoryPhones} valueLabel="nummer" ore={SIGNATORY_ORE} />
          ) : null}
        </dl>
        {urval.preview.length > 0 ? (
          <>
            <h4 className="mt-6 font-medium">Bolagsnamn</h4>
            <ul className="mt-2 space-y-1 text-sm leading-6">
              {urval.preview.map((company) => (
                <li key={company.orgNr}>
                  {company.name} · {company.city} · {company.orgNr}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <h4 className="mt-6 font-medium">Specifikation</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
          <li>Namn, organisationsnummer, gatuadress, postnummer, ort, bransch och SNI.</li>
          {selection.phones ? <li>Telefonnummer där källan har ett nummer.</li> : null}
          {selection.emails ? <li>E-post där källan har en adress.</li> : null}
          {selection.signatory ? <li>Beslutsfattarnummer där källan har ett nummer.</li> : null}
        </ul>
        <p className="mt-3 text-sm leading-6">Tomma fält kostar inget.</p>
      </div>

      <div className="flex h-fit flex-col rounded-2xl bg-sea-deep p-5 text-white">
        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Att betala</p>
        <p className="mt-2 text-4xl tracking-tight">
          {formatKronor(price.totalOre)} <span className="text-xl">kr</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-white/75">
          {counts.companies === 0
            ? "Urvalet är tomt."
            : price.minimumApplied
              ? `Beräknat ${formatKronor(price.rawOre)} kr. Lägsta order är ${formatKronor(MINIMUM_ORE)} kr.`
              : `Beräknat pris ${formatKronor(price.rawOre)} kr, över lägsta order.`}
        </p>
        {counts.companies > 0 ? (
          <Link
            href={href}
            className="mt-5 flex h-12 items-center justify-center rounded-full bg-amber font-medium text-ink"
          >
            Till kassan
          </Link>
        ) : (
          <p className="mt-5 flex h-12 items-center justify-center rounded-full bg-white/10 text-sm text-white/70">
            Inget att beställa
          </p>
        )}
      </div>
    </div>
  );
}

function ContactLine({
  title,
  values,
  valueLabel,
  ore,
}: {
  title: string;
  values: number;
  valueLabel: string;
  ore: number;
}) {
  return (
    <div>
      <dt className="font-medium">{title}</dt>
      <dd className="mt-1 text-sm leading-6 text-muted">
        {values.toLocaleString("sv-SE")} {valueLabel} × {formatKronor(ore)} kr ({ore} öre) ={" "}
        {formatKronor(values * ore)} kr.
      </dd>
    </div>
  );
}
