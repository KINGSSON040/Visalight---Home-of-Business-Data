import type { Metadata } from "next";
import { TopicIndex } from "@/components/topic-view";

export const metadata: Metadata = {
  title: "Ord om företagsdata — VisaLight",
  description:
    "Vad företagsdata, SNI-kod, organisationsnummer och kontaktfält betyder hos VisaLight. Uppgifterna kommer från officiella register och hålls färska. Antal visas när registret är inkopplat.",
};

export default function TermsPage() {
  return <TopicIndex kind="ord" />;
}
