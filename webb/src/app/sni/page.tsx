import type { Metadata } from "next";
import Link from "next/link";
import { INDUSTRIES } from "@/lib/catalog";
import { dottedSni, topicPath, TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "SNI-koder för företagsinformation — VisaLight",
  description:
    "Varje SNI-kod har en sida med verifierad och färsk företagsinformation: vad koden betyder, vilka bolag som ingår och vad utdraget kostar.",
  alternates: { canonical: "/sni" },
};

export default function SniIndexPage() {
  const rows = INDUSTRIES.map((industry) => {
    const topic = TOPICS.find((item) => item.kind === "bransch" && item.sni === industry.sni);
    return { industry, topic };
  }).filter((row) => row.topic);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm uppercase tracking-[0.16em] text-ink">SNI</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Företagsinformation per SNI-kod</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        Söker ni en bransch via SNI-koden hamnar ni på sidan för den branschen. Både koden med punkt och koden utan punkt leder dit, även en äldre kod när SNI har bytts ut.
      </p>
      <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white">
        {rows.map(({ industry, topic }) => (
          <li key={industry.sni}>
            <Link href={topicPath(topic!)} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-medium">{industry.label}</span>
              <span className="font-mono text-sm text-sea">
                SNI {dottedSni(industry.sni)}
                {(industry.legacy ?? []).length ? ` · tidigare ${industry.legacy!.map(dottedSni).join(", ")}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/bransch" className="font-medium text-sea">
          Alla branscher
        </Link>
      </p>
    </main>
  );
}
