import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTopic,
  relatedTopics,
  topicBuilderHref,
  topicPath,
  topicsByKind,
  type TopicKind,
} from "@/lib/topics";

export function topicMetadata(kind: TopicKind, slug: string): Metadata {
  const topic = getTopic(kind, slug);
  if (!topic) return {};
  return {
    title: `${topic.title} — VisaLight`,
    description: topic.description,
  };
}

export function TopicIndex({ kind }: { kind: TopicKind }) {
  const topics = topicsByKind(kind);
  const isIndustry = kind === "bransch";
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm uppercase tracking-[0.16em] text-green">{isIndustry ? "Branscher" : "Ord"}</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">
        {isIndustry ? "Företagsdata per bransch" : "Ord om företagsdata"}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata från officiella register.
        Sidorna nedan beskriver urval. Bolagen som syns i verktyget är exempel tills det riktiga registret är kopplat.
      </p>
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
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href={indexHref} className="text-sm font-medium text-sea">
        {indexLabel}
      </Link>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl tracking-tight">{topic.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8">{topic.lead}</p>
      <p className="mt-4 max-w-2xl leading-8 text-muted">
        VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata från officiella register.
        Ett telefonnummer eller en e-postadress som inte finns i källan lämnas tom. Bolagen som syns i verktyget är exempel tills det riktiga registret är kopplat.
      </p>
      {topic.sni ? <p className="mt-4 font-mono text-sm text-sea">SNI {topic.sni}</p> : null}
      <Link href={topicBuilderHref(topic)} className="mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
        Bygg ett urval
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
