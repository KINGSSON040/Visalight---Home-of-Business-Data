import type { Metadata } from "next";
import { PersonView } from "@/components/crm-person";

export const metadata: Metadata = {
  title: "Kontaktperson — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonView id={decodeURIComponent(id)} />;
}
