import { redirect } from "next/navigation";

export default async function LegacyCompanyPage({ params }: { params: Promise<{ orgNr: string }> }) {
  const { orgNr } = await params;
  redirect(`/crm/kund/${orgNr}`);
}
