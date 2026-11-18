import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { MdxContent } from "@/components/content/Mdx";
import { OfficeNote } from "@/components/content/OfficeNote";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getPage, getPublishedTeam } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata() {
  const page = await getPage("om-oss");
  if (!page) return pageMetadata(t("nav.about"), t("meta.home.description"), "/om-oss", { index: false });
  return pageMetadata(page.seoTitle, page.seoDescription, "/om-oss");
}

export default async function AboutPage() {
  const page = await getPage("om-oss");
  if (!page) notFound();
  const team = await getPublishedTeam();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: page.title, href: "/om-oss" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={page.title} text={page.seoDescription} />
        <MdxContent source={page.body} />
        <section className="py-8">
          <h2 className="text-3xl">{t("nav.team")}</h2>
          {team.length > 0 ? (
            <p className="mt-4">
              <Link href="/medarbetare" className="text-accent underline underline-offset-4">
                {t("cta.allTeam")}
              </Link>
            </p>
          ) : (
            <p className="mt-4 max-w-2xl">{t("team.emptyText")}</p>
          )}
        </section>
        <OfficeNote />
      </Container>
    </>
  );
}
