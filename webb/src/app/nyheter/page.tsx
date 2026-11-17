import type { Metadata } from "next";
import Link from "next/link";
import { NewsCards } from "@/components/pop-news";
import { allNews } from "@/lib/news";
import { registerOverview } from "@/lib/register-stats";
import { registerUpdatedIso } from "@/lib/register-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/nyheter" },
  title: "Nyheter och uppdateringar om Sveriges näringsliv — VisaLight",
  description: "Uppdateringar av företagsregistret, nya bolag och statistik om svenska branscher.",
};

export default function NyheterPage() {
  const news = allNews(registerOverview(), registerUpdatedIso());
  return (
    <main className="pop-dots">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="sticker-sm tilt-r inline-flex bg-[var(--pop-sun)] px-3 py-1 text-xs font-extrabold tracking-[0.14em] uppercase">Nyheter</p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-[0.92] sm:text-7xl">
          Nyheter och <span className="text-[var(--pop-coral)]">uppdateringar</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold">
          Vad som händer i registret och i Sveriges branscher. Inlägg märkta exempeltext är platshållare tills riktiga nyheter finns.
        </p>
        <div className="mt-10">
          <NewsCards items={news} />
        </div>
        <Link href="/#urval" className="pop-btn pop-btn--magenta mt-12 h-14 px-6 text-lg">
          Bygg ert utdrag <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
