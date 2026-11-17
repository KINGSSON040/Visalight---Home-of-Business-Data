"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListBuilder } from "@/components/builder";
import { HomeMore } from "@/components/home-more";
import {
  describeSelection,
  hasCompleteBasics,
  sameSearch,
  selectionToQuery,
  summarize,
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
import { linkedIndustries, topicPath } from "@/lib/topics";

const EXAMPLE_FIGURES = [
  { value: "9", label: "nya bolag i Malmö" },
  { value: "4", label: "nya bolag i restauranger" },
  { value: "6", label: "konkurser som lämnats utanför filen" },
  { value: "2", label: "bolag med näringsförbud som lämnats utanför filen" },
];

export function CustomerHome({ initial }: { initial: Selection }) {
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const priced: Selection = {
    ...applied,
    phones: draft.phones,
    emails: draft.emails,
    signatory: draft.signatory,
  };
  const share = selectionToQuery(priced);
  const dirty = !sameSearch(draft, applied);

  useEffect(() => {
    window.history.replaceState(null, "", share ? `/?${share}` : "/");
  }, [share]);

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  return (
    <main>
      <section className="lg:grid lg:h-[calc(100dvh-7rem)] lg:grid-cols-2 lg:grid-rows-2">
        <article className="flex flex-col justify-center overflow-y-auto bg-sea-deep px-5 py-10 text-white sm:px-8 lg:h-full lg:min-h-0 lg:px-10 lg:py-8">
          <p className="text-sm uppercase tracking-[0.18em] text-amber">Officiella register</p>
          <h1 className="mt-3 max-w-xl text-4xl leading-[1.08] tracking-tight text-balance xl:text-5xl">
            Verifierad, uppdaterad och färsk företagsdata.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/88">
            VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata från SCB:s allmänna företagsregister.
            Vid varje synk kommer nya bolag med, och konkurs, inaktiva bolag och bolag med näringsförbud
            lämnas utanför filen du köper.
          </p>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/75">
            Saknar källan ett värde lämnas fältet tomt. Du behöver inget konto för att köpa.
          </p>
        </article>

        <ListBuilder
          draft={draft}
          onChange={patch}
          onSearch={() => setApplied(draft)}
          dirty={dirty}
          matchCount={summarize(priced).counts.companies}
        />

        <aside className="flex flex-col justify-center overflow-y-auto bg-amber-soft px-5 py-8 text-ink sm:px-8 lg:h-full lg:min-h-0 lg:px-10">
          <p className="text-sm uppercase tracking-[0.16em] text-ink/60">Lägsta order</p>
          <p className="mt-2 text-5xl tracking-tight">
            {(MINIMUM_ORE / 100).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            En kort lista hamnar på lägsta order. Tomma fält kostar inget, och du betalar som gäst utan konto.
          </p>
        </aside>

        <aside id="pris" className="flex flex-col justify-center overflow-y-auto bg-foam px-5 py-8 sm:px-8 lg:h-full lg:min-h-0 lg:px-10">
          <p className="text-sm uppercase tracking-[0.16em] text-sea">Pris per uppgift</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <PriceUnit label="Grunduppgifter" ore={BASE_ORE} detail="per komplett rad" />
            <PriceUnit label="Telefon" ore={PHONE_ORE} detail="per nummer" />
            <PriceUnit label="E-post" ore={EMAIL_ORE} detail="per adress" />
            <PriceUnit label="Beslutsfattare" ore={SIGNATORY_ORE} detail="per nummer" />
          </dl>
        </aside>
      </section>

      <section id="sa-funkar-det" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <h2 className="text-4xl tracking-tight">Tre steg</h2>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
            Så köper du verifierad, uppdaterad och färsk företagsdata. Inget konto, och filen kommer med e-post.
          </p>
          <ol className="mt-8 grid gap-4">
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="1" />
              <h3 className="mt-3 text-2xl tracking-tight">Fyll i listbyggaren</h3>
              <p className="mt-2 max-w-2xl leading-7 text-muted">
                Ange branschnamn eller SNI-kod i sökfältet, komplettera med ort och bolagsform, och tryck Sök bolag.
                Förslagen under fälten kommer från det som finns i registret.
              </p>
            </li>
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="2" />
              <h3 className="mt-3 text-2xl tracking-tight">Se resultatet</h3>
              <Result selection={priced} dirty={dirty} />
            </li>
            <li className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <StepNumber n="3" />
              <h3 className="mt-3 text-2xl tracking-tight">Betala som gäst</h3>
              <p className="mt-2 max-w-2xl leading-7 text-muted">
                Gå till kassan och betala som gäst. Filen skickas till din e-post när betalningen är klar.
                Inget konto krävs.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <HomeMore />

      <section aria-labelledby="exempel-statistik" className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">
            Exempel tills kundsidan läser det riktiga registret
          </p>
          <h2 id="exempel-statistik" className="mt-3 max-w-3xl text-4xl tracking-tight">
            Så kan ett uppdaterat register se ut
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8">
            VisaLight uppdaterar registret och därmed bara erbjuder aktiva bolag.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Siffrorna nedan är exempel. De är inte nationell statistik och inte hämtade ur det riktiga registret.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLE_FIGURES.map((figure) => (
              <li key={figure.label} className="rounded-3xl border border-line bg-foam/50 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sea">Exempel</p>
                <p className="mt-3 text-4xl tracking-tight">{figure.value}</p>
                <p className="mt-2 text-sm leading-6">{figure.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-4xl tracking-tight">Branscher och ord</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Sidorna beskriver urval för vanliga branscher och registerord. Verktyget visar fortfarande
          exempelbolag tills det riktiga registret är kopplat.
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

function Result({ selection, dirty }: { selection: Selection; dirty: boolean }) {
  const summary = summarize(selection);
  const rows = summary.rows;
  const complete = rows.filter(hasCompleteBasics).length;
  const withPhone = rows.filter((row) => row.phones.length > 0).length;
  const withEmail = rows.filter((row) => row.emails.length > 0).length;
  const withSignatory = rows.filter((row) => row.signatoryPhones.length > 0).length;
  const href = `/kassa?${selectionToQuery(selection)}`;
  const { counts, price, gaps } = summary;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]" aria-live="polite">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-sea">Exempelbolag</p>
        <p className="mt-2 text-4xl tracking-tight">
          {counts.companies.toLocaleString("sv-SE")}{" "}
          <span className="text-xl text-muted">exempelbolag</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{describeSelection(selection)}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {dirty
            ? "Filtren i listbyggaren är ändrade. Tryck Sök bolag för att räkna om det här resultatet."
            : "Samma urval som senaste Sök bolag. Raderna är exempel tills det riktiga registret är kopplat."}
        </p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="font-medium">Kompletta rader med grunduppgifter</dt>
            <dd className="mt-1 text-sm leading-6 text-muted">
              {complete.toLocaleString("sv-SE")} har en komplett rad, {BASE_ORE} öre styck (
              {formatKronor(BASE_ORE)} kr). {counts.companies.toLocaleString("sv-SE")} ×{" "}
              {formatKronor(BASE_ORE)} kr = {formatKronor(counts.companies * BASE_ORE)} kr.
            </dd>
          </div>
          {selection.phones ? (
            <ContactLine
              title="Telefonnummer"
              companies={withPhone}
              values={counts.phones}
              valueLabel="nummer"
              ore={PHONE_ORE}
            />
          ) : null}
          {selection.emails ? (
            <ContactLine
              title="E-post"
              companies={withEmail}
              values={counts.emails}
              valueLabel="adresser"
              ore={EMAIL_ORE}
            />
          ) : null}
          {selection.signatory ? (
            <ContactLine
              title="Beslutsfattarnummer"
              companies={withSignatory}
              values={counts.signatoryPhones}
              valueLabel="nummer"
              ore={SIGNATORY_ORE}
            />
          ) : null}
        </dl>

        <h4 className="mt-6 font-medium">Specifikation</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
          <li>Namn, organisationsnummer, gatuadress, postnummer, ort, bransch och SNI.</li>
          {selection.phones ? <li>Telefonnummer där källan har ett nummer.</li> : null}
          {selection.emails ? <li>E-post där källan har en adress.</li> : null}
          {selection.signatory ? <li>Beslutsfattarnummer där källan har ett nummer.</li> : null}
        </ul>
        <p className="mt-3 text-sm leading-6">
          Tomma fält kostar inget.
          {gaps.length > 0 ? ` ${gaps.join(", ")}.` : ""}
        </p>
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
  companies,
  values,
  valueLabel,
  ore,
}: {
  title: string;
  companies: number;
  values: number;
  valueLabel: string;
  ore: number;
}) {
  return (
    <div>
      <dt className="font-medium">{title}</dt>
      <dd className="mt-1 text-sm leading-6 text-muted">
        {companies.toLocaleString("sv-SE")} bolag har det. {values.toLocaleString("sv-SE")} {valueLabel} ×{" "}
        {formatKronor(ore)} kr ({ore} öre) = {formatKronor(values * ore)} kr.
      </dd>
    </div>
  );
}
