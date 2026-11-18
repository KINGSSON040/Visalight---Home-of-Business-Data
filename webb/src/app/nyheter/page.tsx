import type { Metadata } from "next";
import Link from "next/link";
import { allPosts, formatNewsDate } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const example = registerStamp().example || loadStats().source === "example";
  return {
    alternates: { canonical: "/nyheter" },
    title: "Nyheter och uppdateringar — VisaLight",
    description: example
      ? "Exempeltexter. Registret är inte inkopplat. Uppdateringar av registret, statistik och nyheter om Sveriges näringsliv."
      : "Uppdateringar av registret, statistik och nyheter om Sveriges näringsliv.",
    robots: example ? { index: false, follow: true } : undefined,
  };
}

export default function NyheterPage() {
  const stamp = registerStamp();
  const posts = allPosts(loadStats(), stamp.when, stamp.isoDate);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-sm font-semibold tracking-[0.18em] text-ink uppercase">Nyheter</p>
      <h1 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">Nyheter och uppdateringar</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Uppdateringar från registret. Utan register visas inga antal.
      </p>
      <ol className="mt-10 space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/nyheter/${post.slug}`} className="glass group block rounded-3xl p-5 sm:p-6">
              <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="text-ink">{post.kind}</span>
                <time dateTime={post.date} className="text-muted">
                  {formatNewsDate(post.date)}
                </time>
                {post.example ? <span className="rounded-full bg-foam px-2 py-0.5 text-muted">Exempeltext</span> : null}
              </span>
              <span className="font-display mt-2 block text-2xl font-bold group-hover:underline">{post.title}</span>
              <span className="mt-2 block text-muted">{post.lead}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
