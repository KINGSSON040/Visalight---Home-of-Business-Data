import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS_KIND_LABEL, newsDate, newsFeed } from "@/lib/nyheter";
import { loadNaringsliv } from "@/lib/register-stats";

export const dynamic = "force-dynamic";

function findPost(slug: string) {
  return newsFeed(loadNaringsliv()).find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return { title: "Nyheten finns inte — VisaLight" };
  return {
    title: `${post.title} — VisaLight`,
    description: post.excerpt,
    alternates: { canonical: `/nyheter/${post.slug}` },
  };
}

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/nyheter" className="text-sm font-black text-sea underline decoration-[3px] underline-offset-4">
        Alla nyheter
      </Link>
      <article className="chunk mt-5 overflow-hidden">
        <div className="block-sun flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink px-5 py-2 text-xs font-black uppercase tracking-[0.12em]">
          <span>{NEWS_KIND_LABEL[post.kind]}</span>
          <time dateTime={post.date}>{newsDate(post.date)}</time>
        </div>
        <div className="p-5 sm:p-8">
          {post.example ? (
            <p className="mb-2 inline-block rounded-full border-2 border-rust px-2 text-xs font-black text-rust">
              Exempeltext, inte en riktig nyhet
            </p>
          ) : null}
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg font-semibold">{post.excerpt}</p>
          <div className="mt-5 space-y-4 leading-7">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link href={post.cta.href} className="btn-chunk mt-8 h-12 px-6">
            {post.cta.label}
          </Link>
        </div>
      </article>
    </main>
  );
}
