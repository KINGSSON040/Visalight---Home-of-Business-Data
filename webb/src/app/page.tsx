import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { allPosts } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { loadUrval } from "@/lib/register-urval";
import { EXAMPLE_FIGURES_LINE, registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export async function generateMetadata(): Promise<Metadata> {
  const example = registerStamp().example || loadStats().source === "example";
  return {
    alternates: { canonical: "/" },
    title: "Företagslista och utdrag utan prenumeration — VisaLight",
    description: example
      ? `${EXAMPLE_FIGURES_LINE} Företagslista och utdrag utan prenumeration. Ingen inloggning.`
      : "Företagslista och utdrag utan prenumeration. Välj bransch, se antal och pris, och köp utan inloggning.",
    openGraph: {
      title: "Företagslista och utdrag utan prenumeration",
      description: example
        ? `${EXAMPLE_FIGURES_LINE} Företagslista och utdrag utan prenumeration.`
        : "Företagslista och utdrag utan prenumeration. Antal och pris syns innan köp.",
    },
  };
}

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
        description: stamp.example
          ? `${EXAMPLE_FIGURES_LINE} Färsk företagsdata för svenska bolag, utan abonnemang.`
          : "Färsk företagsdata för svenska bolag, utan abonnemang.",
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
        exampleDate={stamp.example}
        stats={stats}
        news={news}
      />
    </>
  );
}
