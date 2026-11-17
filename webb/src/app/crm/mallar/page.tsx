import type { Metadata } from "next";
import { TemplatesView } from "@/components/crm-templates";

export const metadata: Metadata = {
  title: "Mallar — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TemplatesView />;
}
