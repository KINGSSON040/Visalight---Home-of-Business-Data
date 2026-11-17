import type { Metadata } from "next";
import Link from "next/link";
import { Blob, Squiggle } from "@/components/doodles";
import { NewsCards } from "@/components/home-sections";
import { NaringslivSection } from "@/components/naringsliv-section";
import { newsFeed } from "@/lib/nyheter";
import { loadNaringsliv } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sveriges näringsliv i siffror — VisaLight",
  description:
    "Antal företag i Sverige, nya bolag senaste månaden, fördelning per bransch (SNI) och län, och branscherna som växer mest. Varje siffra kan bli ett utdrag.",
  alternates: { canonical: "/statistik" },
};

export default function StatisticsPage() {
  const stats = loadNaringsliv();
  const stamp = registerStamp();
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <Blob color="var(--sun)" className="-top-20 right-[-5rem] -z-10 h-72 w-72 opacity-80" />
        <Blob color="var(--rose)" shape={1} slow className="top-10 -left-24 -z-10 h-60 w-60 opacity-60" />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:pt-14">
          <p className="font-hand -rotate-1 text-2xl text-sea">Statistik</p>
          <h1 className="max-w-4xl text-5xl leading-[0.95] font-bold sm:text-7xl">
            Sveriges näringsliv{" "}
            <span className="relative inline-block">
              i siffror
              <Squiggle className="absolute -bottom-2 left-0 h-5 w-full" />
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium">
            Hur många bolag finns det, var finns de och vilka branscher växer? Siffrorna kommer från samma register som
            utdraget. Klicka på en siffra så öppnas byggaren.
          </p>
          <p className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-peach px-3 py-1">
              Registret senast uppdaterat: {stamp.when}
              {stamp.example ? " (exempeldata)" : ""}
            </span>
            <Link href="/nyheter" className="rounded-full bg-white px-3 py-1 ring-[2.5px] ring-ink">
              Läs nyheterna
            </Link>
          </p>
        </div>
      </section>
      <NaringslivSection stats={stats} updatedLabel={stamp.when} full heading={false} />
      <NewsCards posts={newsFeed(stats)} />
    </main>
  );
}
