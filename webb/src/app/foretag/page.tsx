import type { Metadata } from "next";
import { CompanyLookup } from "@/components/company-lookup";

export const metadata: Metadata = {
  title: "Slå upp bolag — VisaLight",
  description: "Sök organisationsnummer eller företagsnamn och se grunduppgifter gratis. Kontaktfält visas i den köpta filen.",
};

export default function LookupPage() {
  return <CompanyLookup />;
}
