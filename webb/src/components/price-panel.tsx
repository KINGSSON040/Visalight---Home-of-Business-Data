"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { selectionToQuery, type Selection } from "@/lib/catalog";
import {
  BASE_ORE,
  EMAIL_ORE,
  MINIMUM_ORE,
  PHONE_ORE,
  SIGNATORY_ORE,
  formatKronor,
} from "@/lib/pricing";
import { priceForUrval, pricedCounts, type UrvalResult } from "@/lib/urval";

export function PricePanel({
  selection,
  urval,
  showAction = false,
  quoteOnly = false,
}: {
  selection: Selection;
  urval?: UrvalResult;
  showAction?: boolean;
  /** Pris på urvalet. Ingen debitering. */
  quoteOnly?: boolean;
}) {
  const [live, setLive] = useState<UrvalResult | null>(urval ?? null);
  const key = selectionToQuery(selection);

  useEffect(() => {
    if (urval) return;
    const controller = new AbortController();
    fetch(`/api/urval?${key}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<UrvalResult>)
      .then((next) => setLive(next))
      .catch(() => {});
    return () => controller.abort();
  }, [key, urval]);

  const data = urval ?? live;
  if (!data) {
    return (
      <aside className="rounded-3xl bg-sea-deep p-5 text-white shadow-sm">
        <p className="text-sm text-white/70">Räknar priset.</p>
      </aside>
    );
  }
  const counts = pricedCounts(data, selection);
  const price = priceForUrval(data, selection);
  const href = `/kassa?${selectionToQuery(selection)}`;
  const lines = [
    {
      label: "Grunduppgifter",
      count: counts.companies,
      unit: BASE_ORE,
      included: true,
      empty: "Inget bolag i urvalet",
    },
    {
      label: "Kontaktnummer",
      count: counts.phones,
      unit: PHONE_ORE,
      included: selection.phones,
      empty: "Inget nummer i urvalet",
    },
    {
      label: "Beslutsfattarnummer",
      count: counts.signatoryPhones,
      unit: SIGNATORY_ORE,
      included: selection.signatory,
      empty: "Inget beslutsfattarnummer i urvalet",
    },
    {
      label: "E-postkontakt",
      count: counts.emails,
      unit: EMAIL_ORE,
      included: selection.emails,
      empty: "Ingen e-post i urvalet",
    },
  ];

  return (
    <aside className="rounded-3xl bg-sea-deep p-5 text-white shadow-sm" aria-live="polite">
      <p className="text-xs uppercase tracking-[0.16em] text-white/60">{quoteOnly ? "Pris på urvalet" : "Att betala"}</p>
      <p className="mt-2 font-serif text-5xl leading-none tracking-tight">
        {formatKronor(price.totalOre)}
        <span className="ml-2 text-2xl">kr</span>
      </p>
      <p className="mt-3 text-sm leading-6 text-white/70">
        {counts.companies === 0
          ? "Urvalet är tomt."
          : price.minimumApplied
            ? `Beräknat ${formatKronor(price.rawOre)} kr. Lägsta order är 399 kr.`
            : "Beräknat pris, över lägsta order."}
      </p>
      <ul className="mt-5 space-y-3 border-t border-white/15 pt-4 text-sm">
        {lines.map((line) => {
          const sum = line.included ? line.count * line.unit : 0;
          return (
            <li key={line.label} className="flex items-start justify-between gap-3">
              <span>
                <span className="block">{line.label}</span>
                <span className="block text-white/55">
                  {!line.included
                    ? "Ingår inte i filen"
                    : line.count === 0
                      ? line.empty
                      : `${line.count.toLocaleString("sv-SE")} × ${formatKronor(line.unit)} kr`}
                </span>
              </span>
              <span className="font-mono text-sm">{formatKronor(sum)} kr</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-6 text-white/70">
        Tomma fält kostar inget. Lägsta order är {formatKronor(MINIMUM_ORE)} kr.
        {quoteOnly ? " Ingen betalning dras." : ""}
      </p>
      {showAction ? (
        counts.companies > 0 ? (
          <Link
            href={href}
            className="btn-fade-amber mt-5 flex h-12 items-center justify-center rounded-full bg-amber font-medium text-ink"
          >
            Förhandsboka
          </Link>
        ) : (
          <p className="mt-5 flex h-12 items-center justify-center rounded-full bg-white/10 text-sm text-white/70">
            Inget att beställa
          </p>
        )
      ) : null}
    </aside>
  );
}
