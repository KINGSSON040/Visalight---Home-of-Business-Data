import type { Metadata } from "next";
import { CrmDesk } from "@/components/crm-desk";

export const metadata: Metadata = {
  title: "CRM — VisaLight",
  description: "Internt CRM för kundkort, stjärnmärkta bolag, segment och kallringning.",
  robots: { index: false, follow: false },
};

export default function CrmPage() {
  return <CrmDesk />;
}
