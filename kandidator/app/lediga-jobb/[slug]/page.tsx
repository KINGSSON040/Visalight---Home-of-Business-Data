import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/Mdx";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { Container } from "@/components/layout/Container";
import { JobCard } from "@/components/jobs/JobCard";
import { JobMeta } from "@/components/jobs/JobMeta";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { getJobSource } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, jobPostingSchema } from "@/lib/seo/schema";

export async function generateStaticParams() {
  const slugs = await (await getJobSource()).publishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await (await getJobSource()).getBySlug(slug);
  if (!job) return pageMetadata(t("notFound.title"), t("notFound.text"), `/lediga-jobb/${slug}`, { index: false });
  const index = job.status === "open" && !job.example;
  return pageMetadata(job.seoTitle, job.seoDescription, `/lediga-jobb/${job.slug}`, { index });
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const source = await getJobSource();
  const job = await source.getBySlug(slug);
  if (!job) notFound();
  const related = (await source.list({ role: job.role })).filter((item) => item.slug !== job.slug).slice(0, 3);
  const posting = jobPostingSchema(job);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.jobs"), href: "/lediga-jobb" },
    { name: job.title, href: `/lediga-jobb/${job.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {posting ? <JsonLd data={posting} /> : null}
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <header className="py-10">
          <div className="flex flex-wrap items-center gap-2">
            {job.example ? <Badge>{t("jobs.exampleBadge")}</Badge> : null}
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{job.title}</h1>
          <p className="mt-4 max-w-2xl text-lg">{job.summary}</p>
        </header>
        {job.example ? <p className="mb-6 border-l-4 border-accent pl-4">{t("jobs.exampleNotice")}</p> : null}
        {job.status === "closed" ? (
          <p className="mb-6 rounded-lg bg-secondary p-4 font-semibold" role="status">
            {t("jobs.closedBanner")}
          </p>
        ) : null}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <article>
            <JobMeta job={job} />
            <div className="mt-8">
              <MdxContent source={job.body} />
            </div>
          </article>
          {job.status === "open" ? (
            <div className="lg:sticky lg:top-24">
              <ApplyForm jobSlug={job.slug} />
            </div>
          ) : null}
        </div>
        {related.length > 0 ? (
          <section className="pt-12">
            <h2 className="text-3xl">{t("jobs.related")}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <JobCard job={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="pt-10">
            <Link href="/lediga-jobb" className="text-accent underline underline-offset-4">
              {t("cta.jobs")}
            </Link>
          </p>
        )}
      </Container>
    </>
  );
}
