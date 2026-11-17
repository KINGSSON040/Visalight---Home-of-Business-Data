import type { Metadata } from "next";
import { ActivityView } from "@/components/crm-aktivitet";

export const metadata: Metadata = {
  title: "Aktivitet — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ActivityView />;
}
