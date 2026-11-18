import { EmptyState } from "@/components/content/EmptyState";
import { PageHero } from "@/components/content/PageHero";
import { TeamCard } from "@/components/content/TeamCard";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getPublishedTeam } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.team.title"), t("meta.team.description"), "/medarbetare");

export default async function TeamPage() {
  const people = await getPublishedTeam();
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.team"), href: "/medarbetare" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.team.title")} text={t("meta.team.description")} />
        {people.length === 0 ? (
          <EmptyState title={t("team.emptyTitle")} text={t("team.emptyText")} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {people.map((person) => (
              <li key={person.slug}>
                <TeamCard person={person} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
