import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { allNews } from "@/lib/news";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { loadUrval } from "@/lib/register-urval";
import { registerOverview } from "@/lib/register-stats";
import { registerStamp, registerUpdatedIso } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "VisaLight — Alla Sveriges företag, se antal och pris direkt",
  description:
    "Alla Sveriges företag i ett utdrag. Välj bransch och ort, se antal och pris direkt. Ingen prenumeration, ingen bindningstid. Plus statistik och nyheter om näringslivet.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const stamp = registerStamp();
  const selection = selectionFromRecord(await searchParams);
  const initialUrval = loadUrval(selection);
  const overview = registerOverview();
  const news = allNews(overview, registerUpdatedIso());
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
        overview={overview}
        news={news}
      />
    </>
  );
}
