import type { Metadata } from "next";
import { CrmDesk } from "@/components/crm-desk";

export const metadata: Metadata = {
  title: "Arbetsytan — VisaLight",
  description: "Intern arbetsyta för exempelbolag, sparade segment och logg. Inte butiken.",
  robots: { index: false, follow: false },
};

export default function CrmPage() {
  return <CrmDesk />;
}
