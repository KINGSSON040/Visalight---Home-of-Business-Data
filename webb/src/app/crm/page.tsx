import type { Metadata } from "next";
import { TodayView } from "@/components/crm-today";

export const metadata: Metadata = {
  title: "Idag — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TodayView />;
}
