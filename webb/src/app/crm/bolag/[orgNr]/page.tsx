import { CrmCard } from "@/components/crm-card";
import { COMPANIES } from "@/lib/catalog";
import Link from "next/link";

export default async function CompanyCardPage({ params }: { params: Promise<{ orgNr: string }> }) {
  const { orgNr } = await params;
  const company = COMPANIES.find((item) => item.orgNr === decodeURIComponent(orgNr));
  if (!company) {
    return (
      <section>
        <h1 className="text-3xl tracking-tight">Bolaget finns inte i exempelregistret</h1>
        <p className="mt-2 text-sm text-muted">
          <Link href="/crm" className="text-sea">
            Tillbaka till sök
          </Link>
        </p>
      </section>
    );
  }
  return <CrmCard company={company} />;
}
