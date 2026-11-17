import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { PricePanel } from "@/components/price-panel";
import { describeSelection, selectionFromRecord, selectionToQuery, summarize } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Kassa — VisaLight",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const selection = selectionFromRecord(await searchParams);
  const summary = summarize(selection);
  const back = `/?${selectionToQuery(selection)}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href={back} className="text-sm font-medium text-sea">
        Ändra urvalet
      </Link>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Kassa</h1>
      <p className="mt-3 max-w-xl text-muted">
        {describeSelection(selection)}. {summary.counts.companies.toLocaleString("sv-SE")} exempelbolag i den här förhandsvisningen.
      </p>
      {summary.counts.companies === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-card px-6 py-12">
          <p className="font-serif text-3xl">Urvalet är tomt</p>
          <p className="mt-2 text-muted">Gå tillbaka och välj minst ett bolag.</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
            Till urvalet
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CheckoutForm selection={selection} />
          <div className="lg:sticky lg:top-28">
            <PricePanel selection={selection} />
          </div>
        </div>
      )}
    </main>
  );
}
