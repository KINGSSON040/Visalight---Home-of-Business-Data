import { Suspense } from "react";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { JobBrowser } from "@/components/jobs/JobBrowser";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.jobs.title"), t("meta.jobs.description"), "/lediga-jobb");

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.jobs"), href: "/lediga-jobb" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.jobs.title")} text={t("meta.jobsIntro")} />
        <Suspense fallback={<p className="pb-16">{t("jobs.loading")}</p>}>
          <JobBrowser searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
