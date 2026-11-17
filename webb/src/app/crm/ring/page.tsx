import type { Metadata } from "next";
import { ColdCall } from "@/components/crm-call";

export const metadata: Metadata = {
  title: "Ringlistor — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default async function RingPage({
  searchParams,
}: {
  searchParams: Promise<{ lista?: string }>;
}) {
  const { lista } = await searchParams;
  return <ColdCall listId={lista ?? ""} />;
}
