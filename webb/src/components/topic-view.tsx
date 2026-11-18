import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDUSTRIES, selectionIndustries, type Industry } from "@/lib/catalog";
import { BASE_ORE, EMAIL_ORE, MINIMUM_ORE, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import {
  dottedSni,
  getTopic,
  relatedTopics,
  siteOrigin,
  topicBuilderHref,
  topicPath,
  topicsByKind,
  type Topic,
  type TopicKind,
} from "@/lib/topics";

function ore(value: number): string {
  return `${(value / 100).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;
}

export function topicMetadata(kind: TopicKind, slug: string): Metadata {
  const topic = getTopic(kind, slug);
  if (!topic) return {};
  const known = selectionIndustries().find((item) => item.sni === topic.sni);
  const code = known ? dottedSni(known.sni) : "";
  const name = (known?.label ?? (topic.kind === "bransch" ? topic.nav : "")).toLowerCase();
  const title =
    topic.kind === "bransch"
      ? `Företagslista och utdrag för ${name}${code ? ` (SNI ${code})` : ""}`
      : topic.title;
  const description =
    topic.kind === "bransch"
      ? `Företagslista och utdrag för ${name}${code ? `, SNI ${code}` : ""}. Aktiva bolag med namn, adress och bransch. Antal och pris syns innan köp.`
      : topic.description;
  const path = topicPath(topic);
  return {
    title: `${title} — VisaLight`,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, locale: "sv_SE", type: "article" },
  };
}

export function TopicIndex({ kind }: { kind: TopicKind }) {
  const topics = topicsByKind(kind);
  const isIndustry = kind === "bransch";
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm uppercase tracking-[0.16em] text-ink">{isIndustry ? "Branscher" : "Ord"}</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">
        {isIndustry ? "Företagsdata per bransch" : "Ord om företagsdata"}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        {isIndustry
          ? "Varje bransch har en egen sida, så ni kan hitta kunder där. SNI-koden leder dit, och där står vad raden innehåller och vad det kostar."
          : "Sidorna förklarar orden som hör till företagsinformation, företagsregister och utdrag."}
      </p>
      {isIndustry ? (
        <p className="mt-4 text-sm font-medium">
          <Link href="/sni" className="text-sea">
            Alla SNI-koder
          </Link>
        </p>
      ) : null}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={topicPath(topic)} className="block h-full rounded-3xl border border-line bg-card px-4 py-4">
              <span className="font-medium">{topic.nav}</span>
              <span className="mt-2 block text-sm leading-6 text-muted">{topic.lead}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function TopicArticle({ kind, slug }: { kind: TopicKind; slug: string }) {
  const topic = getTopic(kind, slug);
  if (!topic) notFound();
  const related = relatedTopics(topic);
  const indexHref = kind === "bransch" ? "/bransch" : "/ord";
  const indexLabel = kind === "bransch" ? "Alla branscher" : "Alla ord";
  const industry = INDUSTRIES.find((item) => item.sni === topic.sni);
  if (industry) return <IndustryArticle topic={topic} industry={industry} related={related} />;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href={indexHref} className="text-sm font-medium text-sea">
        {indexLabel}
      </Link>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl tracking-tight">{topic.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8">{topic.lead}</p>
      <p className="mt-4 max-w-2xl leading-8 text-muted">
        Hitta er nästa kund här idag. Utdraget tas från den senaste uppdateringen, så uppgifterna är färska. Ett telefonnummer eller en e-postadress som inte finns lämnas tom och kostar inget.
      </p>
      {topic.sni ? <p className="mt-4 font-mono text-sm text-sea">SNI {topic.sni}</p> : null}
      <Link href={topicBuilderHref(topic)} className="btn-fade-sea mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
        Se antal och pris i utdraget
      </Link>
      <h2 className="mt-12 font-serif text-3xl tracking-tight">Fler sidor</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={topicPath(item)} className="block rounded-2xl border border-line bg-card px-4 py-3 text-sm">
              {item.nav}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function IndustryArticle({
  topic,
  industry,
  related,
}: {
  topic: Topic;
  industry: Industry;
  related: Topic[];
}) {
  const code = dottedSni(industry.sni);
  const older = (industry.legacy ?? []).map(dottedSni);
  const questions = [
    {
      q: `Vilken SNI-kod har ${industry.label.toLowerCase()}?`,
      a: older.length
        ? `I SNI 2025 är koden ${code}. Äldre register kan använda ${older.join(" eller ")}.`
        : `I SNI 2025 är koden ${code}.`,
    },
    {
      q: "Vilka uppgifter ingår?",
      a: "Namn, organisationsnummer, adress, ort, bransch och SNI. Telefon, e-post och beslutsfattare följer med där uppgiften finns. En tom ruta kostar inget.",
    },
    {
      q: "Hur aktuellt är utdraget?",
      a: "Utdraget tas från den senaste uppdateringen av företagsregistret. Avregistrerade bolag, bolag i konkurs och bolag med reklamspärr ingår inte.",
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Företagsinformation", item: siteOrigin() },
          { "@type": "ListItem", position: 2, name: "Branscher", item: `${siteOrigin()}/bransch` },
          { "@type": "ListItem", position: 3, name: industry.label, item: `${siteOrigin()}${topicPath(topic)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: questions.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-muted">
        <Link href="/" className="text-sea">
          Företagsinformation
        </Link>
        <span> / </span>
        <Link href="/bransch" className="text-sea">
          Branscher
        </Link>
        <span> / </span>
        <span>{industry.label}</span>
      </nav>
      <h1 className="mt-4 max-w-3xl text-4xl tracking-tight sm:text-5xl">
        Företagsinformation om {industry.label.toLowerCase()}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8">{topic.lead}</p>
      <p className="mt-4 max-w-2xl leading-8 text-muted">
        Hitta er nästa kund i den här branschen idag. Det går för att uppgifterna är verifierade, uppdaterade och färska.
        Sökningar på företagsinformation och företagsregister för den här branschen landar här.
        Utdraget avgränsas med SNI {code}
        {older.length ? `, även om en äldre källa fortfarande skriver ${older.join(" eller ")}` : ""}.
      </p>
      <Link href={topicBuilderHref(topic)} className="btn-fade-sea mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
        Se antal och pris för {industry.label.toLowerCase()} i utdraget
      </Link>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg tracking-tight">SNI-kod</h2>
          <p className="mt-2 font-mono text-sm text-sea">SNI {code}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Samma kod utan punkt är {industry.sni}.
            {older.length ? ` Äldre stavning: ${older.join(", ")}.` : ""} Adresserna /sni/{code} och /sni/{industry.sni} leder till den här sidan.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg tracking-tight">Vad raden innehåller</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Företagsnamn, organisationsnummer, adress, ort, bransch och SNI. Telefon, e-post och beslutsfattare är tillval och lämnas tomma när de saknas.
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-lg tracking-tight">Pris</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Grunduppgifter {ore(BASE_ORE)} per bolag. Telefon {ore(PHONE_ORE)}, e-post {ore(EMAIL_ORE)} och beslutsfattare {ore(SIGNATORY_ORE)}. Lägsta order {(MINIMUM_ORE / 100).toLocaleString("sv-SE", { maximumFractionDigits: 0 })} kr. Priset visas innan ni köper. Från 30 000 bolag räknas priset inte här. Ni behöver talas vid för rabatt.
          </p>
        </article>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-2xl tracking-tight">Vanliga frågor</h2>
        <div className="mt-4 divide-y divide-line rounded-3xl border border-line bg-white">
          {questions.map((item) => (
            <details key={item.q} className="px-5 py-4" open>
              <summary className="cursor-pointer text-lg tracking-tight">{item.q}</summary>
              <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <h2 className="mt-12 text-2xl tracking-tight">Närliggande branscher</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={topicPath(item)} className="block rounded-2xl border border-line bg-white px-4 py-3 text-sm">
              {item.nav}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
