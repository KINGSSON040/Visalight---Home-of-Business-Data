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
        <p className="text-muted">Hämtar beställningen.</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-5xl tracking-tight">Ingen beställning här</h1>
        <p className="mt-3 text-muted">Kvittot finns bara i den här webbläsaren, efter att kassan har fyllts i.</p>
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
      <p className="text-sm uppercase tracking-[0.16em] text-green">Förhandsbokning</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Urvalet är sparat i den här webbläsaren.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        Beställning öppnar snart. Ingen betalning har dragits och ingen fil har skickats. Det här är inte ett kvitto.
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-3xl border border-line bg-card p-5 sm:p-6">
          <p className="font-mono text-sm text-muted">{order.id}</p>
          <h2 className="mt-2 font-serif text-3xl">{order.email}</h2>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">E-post</dt>
              <dd className="mt-1">{order.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Skapad</dt>
              <dd className="mt-1">{when}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Urval</dt>
              <dd className="mt-1">{describeSelection(order.selection)}</dd>
            </div>
            {order.contact ? (
              <div>
                <dt className="text-muted">Namn</dt>
                <dd className="mt-1">{order.contact}</dd>
              </div>
            ) : null}
          </dl>
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
        <PricePanel selection={order.selection} />
      </div>
    </main>
  );
}
