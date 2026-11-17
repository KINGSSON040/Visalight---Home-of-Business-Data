import type { Metadata } from "next";
import { TopicIndex } from "@/components/topic-view";

export const metadata: Metadata = {
  title: "Branscher — VisaLight",
  description:
    "Företagsdata per bransch, från verifierade och uppdaterade register. Verktyget visar exempelbolag tills det riktiga registret är kopplat.",
};

export default function IndustriesPage() {
  return <TopicIndex kind="bransch" />;
}
