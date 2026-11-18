import { LegalDocument, legalMetadata } from "@/app/legal-document";

export const generateMetadata = legalMetadata("cookiepolicy", "/cookiepolicy");

export default function CookiePolicyPage() {
  return <LegalDocument id="cookiepolicy" path="/cookiepolicy" />;
}
