import { notFound } from "next/navigation";
import { CtaBand } from "@/components/content/CtaBand";
import { EmptyState } from "@/components/content/EmptyState";
import { MdxContent } from "@/components/content/Mdx";
import { PageHero } from "@/components/content/PageHero";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Container } from "@/components/layout/Container";
import { JobCard } from "@/components/jobs/JobCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getJobSource } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { getPage, getServices } from "@/lib/content/read";
import { isRoleSlug, roleSlugs, type RoleSlug } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

const landingRoles = roleSlugs.filter((slug): slug is Exclude<RoleSlug, "annat"> => slug !== "annat");

export function generateStaticParams() {
  return landingRoles.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = isRoleSlug(slug) && slug !== "annat" ? await getPage(slug) : null;
  if (!page) return pageMetadata(t("notFound.title"), t("notFound.text"), `/roller/${slug}`, { index: false });
  return pageMetadata(page.seoTitle, page.seoDescription, `/roller/${slug}`);
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isRoleSlug(slug) || slug === "annat") notFound();
  const page = await getPage(slug);
  if (!page) notFound();
  const [services, jobs] = await Promise.all([getServices(), (await getJobSource()).list({ role: slug })]);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: page.title, href: `/roller/${slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
        <section className="py-8">
          <h2 className="text-3xl">{t("home.jobsTitle")}</h2>
          {jobs.length === 0 ? (
            <div className="mt-6">
              <EmptyState title={t("jobs.emptyTitle")} text={t("jobs.emptyText")} />
            </div>
          ) : (
            <>
              {jobs.some((job) => job.example) ? (
                <p className="mt-4 border-l-4 border-accent pl-4">{t("home.jobsExampleNote")}</p>
              ) : null}
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <li key={job.slug}>
                    <JobCard job={job} />
                  </li>
                ))}
              </ul>
            </>
          )}
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
      </Container>
      <CtaBand href={`/kontakt?roll=${slug}`} />
    </>
  );
}
