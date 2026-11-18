import type { Metadata } from "next";
import { TopicIndex } from "@/components/topic-view";

export const metadata: Metadata = {
  title: "Ord om företagsdata — VisaLight",
  description:
    "Vad verifierad och färsk företagsinformation betyder hos VisaLight: SNI-kod, organisationsnummer och kontaktfält. Antal visas när registret är inkopplat.",
};

export default function TermsPage() {
  return <TopicIndex kind="ord" />;
}
