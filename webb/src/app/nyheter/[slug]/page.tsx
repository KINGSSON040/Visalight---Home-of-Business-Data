import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts, formatNewsDate } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

function findPost(slug: string) {
  const stamp = registerStamp();
  return allPosts(loadStats(), stamp.when, stamp.isoDate).find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return { title: "Nyheter — VisaLight" };
  return { title: `${post.title} — VisaLight`, description: post.lead, alternates: { canonical: `/nyheter/${post.slug}` } };
}

export default async function NyhetPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link href="/nyheter" className="text-sm font-bold text-neon hover:underline">
        ← Alla nyheter
      </Link>
      <p className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <span className="text-magenta">{post.kind}</span>
        <time dateTime={post.date} className="text-muted">
          {formatNewsDate(post.date)}
        </time>
        {post.example ? <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-night">Exempeltext</span> : null}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{post.title}</h1>
      <p className="mt-4 text-xl text-ink">{post.lead}</p>
      <div className="mt-6 space-y-4 text-muted">
        {post.body.map((paragraph) => (
          <p key={paragraph} className="leading-7">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="builder-card mt-10 rounded-[2rem] p-6">
        <p className="font-display text-2xl font-bold">Alla Sveriges företag. Ett utdrag bort.</p>
        <Link href={post.cta?.href ?? "/#urval"} className="btn-neon mt-4 inline-flex h-12 items-center rounded-full px-6 font-bold">
          {post.cta?.label ?? "Öppna listbyggaren"}
        </Link>
      </div>
    </main>
  );
}
