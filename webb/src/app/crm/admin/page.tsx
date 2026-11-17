import type { Metadata } from "next";
import { AdminView } from "@/components/crm-admin";

export const metadata: Metadata = {
  title: "Admin — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminView />;
}
