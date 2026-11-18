import { EmptyState } from "@/components/content/EmptyState";
import { BlogCard } from "@/components/content/BlogCard";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getPublishedPosts, getPublishedTeam } from "@/lib/content/read";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.blog.title"), t("meta.blog.description"), "/blogg");

export default async function BlogPage() {
  const [posts, team] = await Promise.all([getPublishedPosts(), getPublishedTeam()]);
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("footer.blog"), href: "/blogg" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.blog.title")} text={t("meta.blog.description")} />
        {posts.length === 0 ? (
          <EmptyState title={t("blog.emptyTitle")} text={t("blog.emptyText")} />
        ) : (
          <ul className="grid gap-4">
            {posts.map((post) => {
              const author = team.find((person) => person.slug === post.authorSlug)?.name ?? t("blog.authorFallback");
              return (
                <li key={post.slug}>
                  <BlogCard post={post} author={author} />
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
