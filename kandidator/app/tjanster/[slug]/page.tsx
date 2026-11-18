import { notFound } from "next/navigation";
import { CtaBand } from "@/components/content/CtaBand";
import { MdxContent } from "@/components/content/Mdx";
import { PageHero } from "@/components/content/PageHero";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { RoleCard } from "@/components/content/RoleCard";
import { Container } from "@/components/layout/Container";
import { JobCard } from "@/components/jobs/JobCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getJobSource } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { getPage, getProcess, getRoles } from "@/lib/content/read";
import { isServiceSlug, serviceSlugs } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = isServiceSlug(slug) ? await getPage(slug) : null;
  if (!page) return pageMetadata(t("notFound.title"), t("notFound.text"), `/tjanster/${slug}`, { index: false });
  return pageMetadata(page.seoTitle, page.seoDescription, `/tjanster/${slug}`);
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  const page = await getPage(slug);
  if (!page) notFound();
  const [roles, steps, jobs] = await Promise.all([
    getRoles(),
    getProcess("arbetsgivare"),
    (await getJobSource()).list({ service: slug }),
  ]);
  const visibleJobs = jobs.slice(0, 3);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.services"), href: "/tjanster" },
    { name: page.title, href: `/tjanster/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
        <ProcessSteps title={t("process.employerTitle")} steps={steps} />
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
        {visibleJobs.length > 0 ? (
          <section className="py-8">
            <h2 className="text-3xl">{t("home.jobsTitle")}</h2>
            {visibleJobs.some((job) => job.example) ? (
              <p className="mt-4 border-l-4 border-accent pl-4">{t("home.jobsExampleNote")}</p>
            ) : null}
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {visibleJobs.map((job) => (
                <li key={job.slug}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
      <CtaBand href={`/kontakt?tjanst=${slug}`} />
    </>
  );
}
