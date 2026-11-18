import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { PricePanel } from "@/components/price-panel";
import { StatusChip } from "@/components/status-chip";
import { describeSelection, selectionFromRecord, selectionToQuery } from "@/lib/catalog";
import { countNewCompanies, freshQuery } from "@/lib/nystartade";
import { registerDatabasePath } from "@/lib/register-path";
import { loadUrval } from "@/lib/register-urval";
import { registerUpdatedLabel } from "@/lib/register-status";
import { SELLER } from "@/lib/seller";
import { pricedCounts, type UrvalResult } from "@/lib/urval";

export const metadata: Metadata = {
  title: "Förhandsboka — VisaLight",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const dayValue = typeof params.dagar === "string" ? params.dagar : "";
  const freshWindow = dayValue === "7" || dayValue === "30";
  const fresh = freshQuery({
    dagar: dayValue,
    sni: typeof params.sni === "string" ? params.sni : undefined,
    ort: typeof params.ort === "string" ? params.ort : undefined,
  });
  const selection = selectionFromRecord(params);
  const freshCount = freshWindow ? countNewCompanies(fresh) : null;
  const urval: UrvalResult = freshCount
    ? {
        source: freshCount.source,
        status: "ready",
        companies: freshCount.companies,
        phones: 0,
        signatoryPhones: 0,
        emails: 0,
        withPhone: 0,
        withEmail: 0,
        withSignatory: 0,
        preview: [],
        note: freshCount.note,
      }
    : loadUrval(selection);
  const companies = pricedCounts(urval, selection).companies;
  const back = freshWindow
    ? `/nystartade-bolag?dagar=${fresh.days}${fresh.sni ? `&sni=${fresh.sni}` : ""}${fresh.city ? `&ort=${encodeURIComponent(fresh.city)}` : ""}`
    : `/?${selectionToQuery(selection)}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href={back} className="text-sm font-medium text-sea">
        Ändra urvalet
      </Link>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Förhandsboka</h1>
      <p className="mt-3 max-w-xl text-muted">
        Beställning öppnar snart. Ingen betalning dras och ingen fil skickas. Ni lämnar urvalet och en e-postadress.{" "}
        {freshWindow ? `Registrerade de senaste ${fresh.days} dagarna. ` : ""}
        {describeSelection(selection)}. {companies.toLocaleString("sv-SE")}{" "}
        {urval.source === "register" ? "bolag" : "exempelbolag"} i urvalet.
      </p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        {SELLER.line}
      </p>
      <div className="mt-4">
        {freshWindow ? (
          <p className="max-w-xl text-xs leading-5 text-muted">
            {freshCount?.source === "example" ? "Exempelsiffror. Registret är inte inkopplat. " : "Antalet kommer från registret på den här datorn. "}
            Antalet är bolag med registreringsdatum i perioden.
          </p>
        ) : (
          <StatusChip updatedLabel={registerUpdatedLabel()} registerReady={registerDatabasePath() !== null} />
        )}
      </div>
      {companies === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-card px-6 py-12">
          <p className="font-serif text-3xl">Urvalet är tomt</p>
          <p className="mt-2 text-muted">Gå tillbaka och välj minst ett bolag.</p>
          <Link href={back} className="btn-fade-sea mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
            Till urvalet
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <CheckoutForm selection={selection} />
          <div className="lg:sticky lg:top-28">
            <PricePanel selection={selection} urval={urval} quoteOnly />
          </div>
        </div>
      )}
    </main>
  );
}
