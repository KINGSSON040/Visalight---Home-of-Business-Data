import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { allPosts } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { loadUrval } from "@/lib/register-urval";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "VisaLight — Alla Sveriges företag i ett utdrag",
  description:
    "Alla Sveriges företag. VisaLight tar fram utdrag med företagsdata. Ingen prenumeration, just för att det ska vara enkelt. Ingen inloggning och ingen bindningstid.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const stamp = registerStamp();
  const selection = selectionFromRecord(await searchParams);
  const initialUrval = loadUrval(selection);
  const stats = loadStats();
  const news = allPosts(stats, stamp.when, stamp.isoDate).slice(0, 3);
  const origin = siteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "VisaLight",
        url: origin,
        inLanguage: "sv-SE",
        description: "Färsk företagsdata för svenska bolag, utan abonnemang.",
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CustomerHome
        key={selectionToQuery(selection)}
        initial={selection}
        initialUrval={initialUrval}
        updatedLabel={stamp.when}
        exampleData={stamp.example}
        stats={stats}
        news={news}
      />
    </>
  );
}
