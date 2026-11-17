import type { Metadata } from "next";
import { TopicIndex } from "@/components/topic-view";

export const metadata: Metadata = {
  title: "Branscher — VisaLight",
  description:
    "Företagsinformation per bransch. Varje sida hör till en bransch och dess SNI-kod, med innehåll, pris och länk till utdraget.",
  alternates: { canonical: "/bransch" },
};

export default function IndustriesPage() {
  return <TopicIndex kind="bransch" />;
}
