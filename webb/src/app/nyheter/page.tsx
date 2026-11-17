import type { Metadata } from "next";
import Link from "next/link";
import { Blob, Squiggle } from "@/components/doodles";
import { NewsCard } from "@/components/home-sections";
import { newsFeed } from "@/lib/nyheter";
import { loadNaringsliv } from "@/lib/register-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nyheter och uppdateringar — VisaLight",
  description: "Uppdateringar av företagsregistret, statistik om Sveriges näringsliv och guider till utdraget.",
  alternates: { canonical: "/nyheter" },
};

const TONES = ["block-coral", "block-leaf", "block-rose", "block-sun"];

export default function NewsPage() {
  const posts = newsFeed(loadNaringsliv());
  return (
    <main className="relative isolate overflow-hidden">
      <Blob color="var(--leaf)" className="-top-16 right-[-4rem] -z-10 h-64 w-64 opacity-60" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <p className="font-hand -rotate-1 text-2xl text-sea">Det senaste</p>
        <h1 className="text-5xl leading-[0.95] font-bold sm:text-7xl">
          <span className="relative inline-block">
            Nyheter
            <Squiggle className="absolute -bottom-2 left-0 h-5 w-full" color="var(--rose)" />
          </span>{" "}
          och uppdateringar
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium">
          När registret uppdateras skrivs ett inlägg här av sig självt. Inlägg märkta Exempeltext visar hur sidan ser ut
          och byts mot riktiga texter.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <NewsCard key={post.slug} post={post} tone={TONES[index % TONES.length]} />
          ))}
        </div>
        <Link href="/#urval" className="btn-chunk mt-10 h-14 px-7 text-lg">
          Bygg ett utdrag
        </Link>
      </div>
    </main>
  );
}
