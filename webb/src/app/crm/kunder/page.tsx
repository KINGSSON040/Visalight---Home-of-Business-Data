import type { Metadata } from "next";
import { MyCustomers } from "@/components/crm-mine";

export const metadata: Metadata = {
  title: "Mina kunder — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MyCustomers />;
}
