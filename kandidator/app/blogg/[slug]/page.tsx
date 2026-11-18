import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/content/Mdx";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getPostBySlug, getPublishedTeam } from "@/lib/content/read";
import { formatSwedishDate } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return pageMetadata(t("notFound.title"), t("notFound.text"), `/blogg/${slug}`, { index: false });
  return pageMetadata(post.seoTitle, post.seoDescription, `/blogg/${post.slug}`);
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <Container className="py-16">
          <p>{t("jobs.loading")}</p>
        </Container>
      }
    >
      <PostArticle params={params} />
    </Suspense>
  );
}

async function PostArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const team = await getPublishedTeam();
  const author = team.find((person) => person.slug === post.authorSlug)?.name ?? t("blog.authorFallback");
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("footer.blog"), href: "/blogg" },
    { name: post.title, href: `/blogg/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={articleSchema(post, author)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <header className="py-12">
          <p className="font-semibold text-accent">
            {formatSwedishDate(post.publishedAt)} · {t("blog.by")} {author}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{post.title}</h1>
          {post.updatedAt !== post.publishedAt ? (
            <p className="mt-4">
              {t("blog.updated")} {formatSwedishDate(post.updatedAt)}
            </p>
          ) : null}
        </header>
        <MdxContent source={post.body} />
      </Container>
    </>
  );
}
