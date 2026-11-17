import type { Metadata } from "next";
import { SearchTab } from "@/components/crm-search";

export const metadata: Metadata = {
  title: "Sök och segment — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SearchTab />;
}
