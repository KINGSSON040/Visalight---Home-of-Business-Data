import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/Mdx";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getLegal } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

type LegalId = "integritetspolicy" | "cookiepolicy" | "villkor";

export function legalMetadata(id: LegalId, path: string) {
  return async function generateMetadata() {
    const page = await getLegal(id);
    if (!page) return pageMetadata(t("notFound.title"), t("notFound.text"), path, { index: false });
    return pageMetadata(page.seoTitle, page.seoDescription, path);
  };
}

export async function LegalDocument({ id, path }: { id: LegalId; path: string }) {
  const page = await getLegal(id);
  if (!page) notFound();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: page.title, href: path },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero eyebrow="Utkast" title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
      </Container>
    </>
  );
}
