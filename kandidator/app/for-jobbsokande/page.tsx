import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/content/FaqList";
import { MdxContent } from "@/components/content/Mdx";
import { PageHero } from "@/components/content/PageHero";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { SpontaneousForm } from "@/components/forms/SpontaneousForm";
import { Container } from "@/components/layout/Container";
import { JobCard } from "@/components/jobs/JobCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getJobSource } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { getFaq, getPage, getProcess } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export async function generateMetadata() {
  const page = await getPage("for-jobbsokande");
  if (!page) {
    return pageMetadata(t("footer.forCandidates"), t("meta.jobs.description"), "/for-jobbsokande", { index: false });
  }
  return pageMetadata(page.seoTitle, page.seoDescription, "/for-jobbsokande");
}

export default async function CandidatesPage() {
  const page = await getPage("for-jobbsokande");
  if (!page) notFound();
  const [steps, faq, jobs] = await Promise.all([
    getProcess("jobbsokande"),
    getFaq(),
    (await getJobSource()).list(),
  ]);
  const questions = faq.filter((item) => item.audience === "jobbsokande").slice(0, 4);
  const visibleJobs = jobs.slice(0, 3);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: page.title, href: "/for-jobbsokande" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
        <ProcessSteps title={t("process.candidateTitle")} steps={steps} />
        <section className="py-8">
          <h2 className="text-3xl">{t("candidates.jobsTitle")}</h2>
          {visibleJobs.some((job) => job.example) ? (
            <p className="mt-4 border-l-4 border-accent pl-4">{t("home.jobsExampleNote")}</p>
          ) : null}
          {visibleJobs.length > 0 ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {visibleJobs.map((job) => (
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
        <section className="py-8">
          <h2 className="mb-6 text-3xl">{t("candidates.formTitle")}</h2>
          <SpontaneousForm />
        </section>
        <section className="py-8">
          <h2 className="text-3xl">{t("faq.candidate")}</h2>
          <div className="mt-6">
            <FaqList items={questions} />
          </div>
          <p className="mt-4">
            <Link href="/vanliga-fragor" className="text-accent underline underline-offset-4">
              {t("cta.allFaq")}
            </Link>
          </p>
        </section>
      </Container>
    </>
  );
}
