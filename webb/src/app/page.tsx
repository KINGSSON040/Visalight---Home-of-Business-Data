import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { allPosts } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { countNewCompanies } from "@/lib/nystartade";
import { loadUrval } from "@/lib/register-urval";
import { EXAMPLE_FIGURES_LINE, registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export async function generateMetadata(): Promise<Metadata> {
  const example = registerStamp().example || loadStats().source === "example";
  return {
    alternates: { canonical: "/" },
    title: "Verifierad och färsk företagsinformation — VisaLight",
    description: example
      ? `${EXAMPLE_FIGURES_LINE} VisaLight säljer verifierad, uppdaterad och färsk företagsinformation. Ni köper för att hitta er nästa kund redan idag.`
      : "VisaLight säljer verifierad, uppdaterad och färsk företagsinformation. Ni köper för att hitta er nästa kund redan idag. Välj bransch, se antal och pris.",
    openGraph: {
      title: "Verifierad och färsk företagsinformation",
      description: example
        ? `${EXAMPLE_FIGURES_LINE} Ni köper för att hitta er nästa kund redan idag.`
        : "Ni köper för att hitta er nästa kund redan idag. Det hänger ihop med att jobba med färsk information.",
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const stamp = registerStamp();
  const fresh = countNewCompanies({ days: 30, sni: "", city: "" });
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
          ? `${EXAMPLE_FIGURES_LINE} Verifierad, uppdaterad och färsk företagsinformation, utan abonnemang.`
          : "Verifierad, uppdaterad och färsk företagsinformation, utan abonnemang.",
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
        fresh={{ companies: fresh.companies, example: fresh.source === "example" }}
      />
    </>
  );
}
