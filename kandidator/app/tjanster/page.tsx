import { PageHero } from "@/components/content/PageHero";
import { ServiceCard } from "@/components/content/ServiceCard";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getServices } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.services.title"), t("meta.services.description"), "/tjanster");

export default async function ServicesPage() {
  const services = await getServices();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.services"), href: "/tjanster" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container>
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.services.title")} text={t("meta.servicesIntro")} />
        <ul className="grid gap-4 pb-16 md:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} level="h2" />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
