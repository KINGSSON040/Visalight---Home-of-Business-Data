import { LegalDocument, legalMetadata } from "@/app/legal-document";

export const generateMetadata = legalMetadata("integritetspolicy", "/integritetspolicy");

export default function PrivacyPage() {
  return <LegalDocument id="integritetspolicy" path="/integritetspolicy" />;
}
