import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";
import { FaqList } from "@/components/content/FaqList";
import { MdxContent } from "@/components/content/Mdx";
import { PageHero } from "@/components/content/PageHero";
import { ProcessSteps } from "@/components/content/ProcessSteps";
import { ServiceCard } from "@/components/content/ServiceCard";
import { EmployerFormSection } from "@/components/forms/EmployerFormSection";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getFaq, getPage, getProcess, getServices } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export async function generateMetadata() {
  const page = await getPage("for-arbetsgivare");
  if (!page) return pageMetadata(t("nav.employers"), t("meta.contact.description"), "/for-arbetsgivare", { index: false });
  return pageMetadata(page.seoTitle, page.seoDescription, "/for-arbetsgivare");
}

export default async function EmployersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const page = await getPage("for-arbetsgivare");
  if (!page) notFound();
  const [services, steps, faq] = await Promise.all([getServices(), getProcess("arbetsgivare"), getFaq()]);
  const questions = faq.filter((item) => item.audience === "arbetsgivare").slice(0, 4);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: page.title, href: "/for-arbetsgivare" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
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
        <ProcessSteps title={t("process.employerTitle")} steps={steps} />
        <CalendlyEmbed />
        <Suspense fallback={<p className="py-10">{t("jobs.loading")}</p>}>
          <EmployerFormSection searchParams={searchParams} heading={t("employers.formTitle")} />
        </Suspense>
        <section className="py-8">
          <h2 className="text-3xl">{t("faq.employer")}</h2>
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
