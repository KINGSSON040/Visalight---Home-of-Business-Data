import { Builder } from "@/components/builder";
import { HomeStory } from "@/components/home-story";
import { selectionFromRecord } from "@/lib/catalog";
import { MINIMUM_ORE, formatKronor } from "@/lib/pricing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const selection = selectionFromRecord(await searchParams);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-green">
            Från {formatKronor(MINIMUM_ORE)} kr · ingen bindning
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Företagsdata utan abonnemang.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Välj ort, bransch och vilka kontaktfält du vill ha. Tomma fält kostar inget. Filen skickas till din e-post när betalningen är klar, och du behöver inget konto.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {[
            ["0,10 kr", "grunduppgift"],
            ["0,30 kr", "telefonnummer"],
            ["0,40 kr", "e-post"],
          ].map(([price, label]) => (
            <div key={label} className="rounded-2xl border border-line bg-card px-3 py-3">
              <dt className="font-mono text-sm">{price}</dt>
              <dd className="text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </section>
      <Builder initial={selection} />
      <HomeStory />
    </main>
  );
}
