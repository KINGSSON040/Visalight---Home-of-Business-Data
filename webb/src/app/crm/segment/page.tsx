import type { Metadata } from "next";
import { MySegments } from "@/components/crm-segments";

export const metadata: Metadata = {
  title: "Mina segment — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MySegments />;
}
