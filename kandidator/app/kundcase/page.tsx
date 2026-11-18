import Link from "next/link";
import { EmptyState } from "@/components/content/EmptyState";
import { PageHero } from "@/components/content/PageHero";
import { CaseCard } from "@/components/content/CaseCard";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getPublishedCases } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.cases.title"), t("meta.cases.description"), "/kundcase");

export default async function CasesPage() {
  const cases = await getPublishedCases();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.cases"), href: "/kundcase" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.cases.title")} text={t("meta.cases.description")} />
        {cases.length === 0 ? (
          <EmptyState title={t("cases.emptyTitle")} text={t("cases.emptyText")} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {cases.map((item) => (
              <li key={item.slug}>
                <CaseCard item={item} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8">
          <Link href="/kontakt" className="text-accent underline underline-offset-4">
            {t("cta.inquiry")}
          </Link>
        </p>
      </Container>
    </>
  );
}
