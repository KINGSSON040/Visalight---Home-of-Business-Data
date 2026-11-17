import type { Metadata } from "next";
import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord } from "@/lib/catalog";
import { PUBLIC_FAQ } from "@/lib/public-faq";
import { loadUrval } from "@/lib/register-urval";
import { registerUpdatedLabel } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "VisaLight — Färsk företagsdata för svenska bolag",
  description:
    "Skapa ett utdrag av företagsregistret. Välj bransch, ort och SNI, se priset exklusive moms och betala utan abonnemang.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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
      <CustomerHome initial={selection} initialUrval={initialUrval} updatedLabel={registerUpdatedLabel()} />
    </>
  );
}
