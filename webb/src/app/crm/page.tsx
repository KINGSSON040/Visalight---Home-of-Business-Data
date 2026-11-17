import type { Metadata } from "next";
import { CrmDesk } from "@/components/crm-desk";

export const metadata: Metadata = {
  title: "CRM — VisaLight",
  description: "Internt CRM för att söka bolag, spara segment och logga samtal, mejl och sms.",
  robots: { index: false, follow: false },
};

export default function CrmPage() {
  return <CrmDesk />;
}
