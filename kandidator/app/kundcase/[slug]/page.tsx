import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/Mdx";
import { Quote } from "@/components/content/Quote";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getCaseBySlug } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCaseBySlug(slug);
  if (!item) return pageMetadata(t("notFound.title"), t("notFound.text"), `/kundcase/${slug}`, { index: false });
  return pageMetadata(item.seoTitle, item.seoDescription, `/kundcase/${item.slug}`);
}

export default function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <p>{t("jobs.loading")}</p>
        </Container>
      }
    >
      <CaseArticle params={params} />
    </Suspense>
  );
}

async function CaseArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCaseBySlug(slug);
  if (!item) notFound();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.cases"), href: "/kundcase" },
    { name: item.title, href: `/kundcase/${item.slug}` },
  ];
  const client = item.clientPublic ? item.client : item.industry;

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <header className="py-12">
          <p className="font-semibold text-accent">
            {client} · {item.year}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{item.title}</h1>
          <p className="mt-4 max-w-2xl text-lg">{item.summary}</p>
        </header>
        <MdxContent source={item.body} />
        {item.quote ? <Quote text={item.quote.text} name={item.quote.name} role={item.quote.role} /> : null}
      </Container>
    </>
  );
}
