import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { Faq, FinalCta, HowItWorks, IndustryTiles, NewsCards, PriceExamples } from "@/components/home-sections";
import { NaringslivSection } from "@/components/naringsliv-section";
import { selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { totalUrval } from "@/lib/naringsliv";
import { newsFeed } from "@/lib/nyheter";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { loadNaringsliv } from "@/lib/register-stats";
import { loadUrval } from "@/lib/register-urval";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "VisaLight — Alla Sveriges företag. Se antal och pris direkt.",
  description:
    "Bygg ett utdrag av alla Sveriges företag. Välj bransch och ort, se antal och pris exklusive moms direkt. Ingen prenumeration, ingen bindningstid.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const stamp = registerStamp();
  const stats = loadNaringsliv();
  const example = stamp.example || stats.example;
  const selection = selectionFromRecord(await searchParams);
  const initialUrval = loadUrval(selection);
  const origin = siteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "VisaLight",
        url: origin,
        inLanguage: "sv-SE",
        description: "Färsk företagsdata om alla Sveriges företag, utan abonnemang.",
      },
      {
        "@type": "FAQPage",
        mainEntity: PUBLIC_FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CustomerHome
        key={selectionToQuery(selection)}
        initial={selection}
        initialUrval={initialUrval}
        total={totalUrval(stats)}
        added={stats.added}
        updatedLabel={stamp.when}
        exampleData={example}
      />
      <HowItWorks />
      <NaringslivSection stats={stats} updatedLabel={stamp.when} />
      <IndustryTiles />
      <PriceExamples />
      <NewsCards posts={newsFeed(stats)} />
      <Faq />
      <FinalCta total={stats.total} example={stats.example} />
    </main>
  );
}
