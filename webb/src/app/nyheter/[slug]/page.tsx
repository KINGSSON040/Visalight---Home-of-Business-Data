import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNewsDate, NEWS_KIND_LABEL, newsBySlug } from "@/lib/news";
import { registerOverview } from "@/lib/register-stats";
import { registerUpdatedIso } from "@/lib/register-status";

export const dynamic = "force-dynamic";

function load(slug: string) {
  return newsBySlug(registerOverview(), registerUpdatedIso(), slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = load((await params).slug);
  if (!item) return { title: "Nyheten finns inte — VisaLight" };
  return { title: `${item.title} — VisaLight`, description: item.lead, alternates: { canonical: `/nyheter/${item.slug}` } };
}

export default async function NyhetPage({ params }: { params: Promise<{ slug: string }> }) {
  const item = load((await params).slug);
  if (!item) notFound();
  return (
    <main className="pop-dots">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/nyheter" className="text-sm font-extrabold underline decoration-[var(--pop-magenta)] decoration-[3px] underline-offset-4">
          ← Alla nyheter
        </Link>
        <p className="mt-6 flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-[0.12em] uppercase">
          <span className="rounded-full bg-[var(--pop-ink)] px-2.5 py-0.5 text-white">{NEWS_KIND_LABEL[item.kind]}</span>
          <time dateTime={item.date}>{formatNewsDate(item.date)}</time>
          {item.example ? <span className="sticker-sm bg-white px-2 py-0.5">Exempeltext</span> : null}
        </p>
        <h1 className="mt-4 text-4xl leading-[1.02] uppercase sm:text-6xl">{item.title}</h1>
        <p className="sticker tilt-l-sm mt-8 bg-[var(--pop-sun)] p-5 text-xl leading-8 font-bold">{item.lead}</p>
        <div className="mt-8 space-y-5 text-lg leading-8 font-medium">
          {item.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Link href={item.cta?.href ?? "/#urval"} className="pop-btn pop-btn--magenta mt-10 h-14 px-6 text-lg">
          {item.cta?.label ?? "Bygg ert utdrag"} <span aria-hidden="true">→</span>
        </Link>
      </article>
    </main>
  );
}
