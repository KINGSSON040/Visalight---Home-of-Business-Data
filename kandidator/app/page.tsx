import Link from "next/link";
import { CaseCard } from "@/components/content/CaseCard";
import { CtaBand } from "@/components/content/CtaBand";
import { OfficeNote } from "@/components/content/OfficeNote";
import { PageHero } from "@/components/content/PageHero";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { RoleCard } from "@/components/content/RoleCard";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Container } from "@/components/layout/Container";
import { JobCard } from "@/components/jobs/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { getJobSource } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { getProcess, getPublishedCases, getRoles, getServices } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { organizationSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.home.title"), t("meta.home.description"), "/", {
  absoluteTitle: true,
});

export default async function HomePage() {
  const [services, roles, steps, cases] = await Promise.all([
    getServices(),
    getRoles(),
    getProcess("arbetsgivare"),
    getPublishedCases(),
  ]);
  const jobs = (await (await getJobSource()).list()).slice(0, 3);

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <Container>
        <PageHero eyebrow={t("home.eyebrow")} title={t("home.heroTitle")} text={t("home.heroText")} />
        <div className="flex flex-wrap gap-3 pb-8">
          <Button asChild>
            <Link href="/kontakt">{t("cta.inquiry")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/lediga-jobb">{t("cta.jobs")}</Link>
          </Button>
        </div>
        <section className="py-8">
          <h2 className="text-3xl">{t("home.rolesTitle")}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <li key={role.slug}>
                <RoleCard role={role} />
              </li>
            ))}
          </ul>
        </section>
        <section className="py-8">
          <h2 className="text-3xl">{t("home.servicesTitle")}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </section>
        <ProcessSteps title={t("home.processTitle")} steps={steps} />
        {cases.length > 0 ? (
          <section className="py-8">
            <h2 className="text-3xl">{t("nav.cases")}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {cases.slice(0, 2).map((item) => (
                <li key={item.slug}>
                  <CaseCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="py-8">
          <h2 className="text-3xl">{t("home.jobsTitle")}</h2>
          {jobs.some((job) => job.example) ? (
            <p className="mt-4 border-l-4 border-accent pl-4">{t("home.jobsExampleNote")}</p>
          ) : null}
          {jobs.length > 0 ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {jobs.map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4">
              <Link href="/lediga-jobb" className="text-accent underline underline-offset-4">
                {t("cta.jobs")}
              </Link>
            </p>
          )}
        </section>
        <OfficeNote />
      </Container>
      <CtaBand href="/kontakt" />
    </>
  );
}
