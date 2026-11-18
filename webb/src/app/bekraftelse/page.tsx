"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PricePanel } from "@/components/price-panel";
import {
  ORDER_STORAGE_KEY,
  describeSelection,
  selectionToQuery,
  type OrderDraft,
} from "@/lib/catalog";
import { SELLER } from "@/lib/seller";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderDraft | null | undefined>(undefined);

  useEffect(() => {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) {
      setOrder(null);
      return;
    }
    try {
      setOrder(JSON.parse(raw) as OrderDraft);
    } catch {
      setOrder(null);
    }
  }, []);

  if (order === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted">Hämtar förhandsbokningen.</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-5xl tracking-tight">Ingen förhandsbokning här</h1>
        <p className="mt-3 text-muted">
          Förhandsbokningen sparas bara i den här webbläsaren, efter att ni lämnat e-post. Det är inte ett kvitto.
        </p>
        <Link href="/" className="btn-fade-sea mt-6 inline-flex rounded-full bg-sea px-4 py-2 text-sm text-white">
          Till urvalet
        </Link>
      </main>
    );
  }

  const when = new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date(order.createdAt));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm uppercase tracking-[0.16em] text-ink">Förhandsbokning</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Förhandsbokningen är sparad i den här webbläsaren.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        Beställning öppnar snart. Ingen betalning har dragits och ingen fil har skickats. Det här är en förhandsbokning,
        inte ett kvitto.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {SELLER.line}
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-3xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-serif text-3xl">Sparat här, inte hos VisaLight</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            E-postadressen {order.email} ligger bara kvar i den här webbläsaren. Det finns inget ordernummer och ingen
            faktura. Urvalet: {describeSelection(order.selection)}.
          </p>
          {order.contact ? <p className="mt-2 text-sm text-muted">Namn som skrevs in: {order.contact}.</p> : null}
          <p className="mt-2 text-sm text-muted">Sparat {when}.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/?${selectionToQuery(order.selection)}`}
              className="btn-fade-sea rounded-full bg-sea px-4 py-2 text-sm text-white"
            >
              Ändra urvalet
            </Link>
            <Link
              href={`/kassa?${selectionToQuery(order.selection)}`}
              className="btn-fade-white rounded-full border border-line bg-white px-4 py-2 text-sm"
            >
              Tillbaka till förhandsbokningen
            </Link>
          </div>
        </article>
        <PricePanel selection={order.selection} quoteOnly />
      </div>
    </main>
  );
}
