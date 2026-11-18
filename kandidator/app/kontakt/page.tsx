import { Suspense } from "react";
import { EmployerFormSection } from "@/components/forms/EmployerFormSection";
import { OfficeNote } from "@/components/content/OfficeNote";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.contact.title"), t("meta.contact.description"), "/kontakt");

export default function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.contact"), href: "/kontakt" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.contact.title")} text={t("meta.contactIntro")} />
        <Suspense fallback={<p className="py-10">{t("jobs.loading")}</p>}>
          <EmployerFormSection searchParams={searchParams} heading={t("employers.formTitle")} />
        </Suspense>
        <OfficeNote />
      </Container>
    </>
  );
}
