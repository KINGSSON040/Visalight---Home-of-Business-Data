import { LegalDocument, legalMetadata } from "@/app/legal-document";

export const generateMetadata = legalMetadata("villkor", "/villkor");

export default function TermsPage() {
  return <LegalDocument id="villkor" path="/villkor" />;
}
