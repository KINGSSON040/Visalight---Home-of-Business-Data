"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListBuilder } from "@/components/builder";
import { Blob, Squiggle } from "@/components/doodles";
import { selectionForCount, selectionToQuery, type Selection } from "@/lib/catalog";
import { formatCount } from "@/lib/naringsliv";
import type { UrvalResult } from "@/lib/urval";

export function CustomerHome({
  initial,
  initialUrval,
  total,
  added,
  updatedLabel,
  exampleData = false,
}: {
  initial: Selection;
  initialUrval: UrvalResult;
  /** Hela registret, visas när inget filter är valt. */
  total: UrvalResult;
  added: number;
  updatedLabel: string;
  exampleData?: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const [urval, setUrval] = useState(initialUrval);
  const [loading, setLoading] = useState(false);
  const counted = selectionForCount(draft);
  const priced: Selection = {
    ...(counted ?? draft),
    query: draft.query,
    phones: draft.phones,
    emails: draft.emails,
    signatory: draft.signatory,
  };
  const share = selectionToQuery(priced);
  const searchKey = counted ? selectionToQuery({ ...counted, phones: false, emails: false, signatory: false }) : "";
  const shown = counted && urval.status === "ready" ? urval : total;

  useEffect(() => {
    if (!searchKey) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/urval?${searchKey}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Kunde inte räkna urvalet.");
          return response.json() as Promise<UrvalResult>;
        })
        .then((next) => setUrval(next))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchKey]);

  useEffect(() => {
    const query = counted ? share : "";
    window.history.replaceState(window.history.state, "", `${query ? `/?${query}` : "/"}${window.location.hash}`);
  }, [share, counted]);

  function patch(next: Partial<Selection>) {
    setDraft((current) => {
      const merged = { ...current, ...next };
      const typing =
        typeof next.query === "string" &&
        next.sni === undefined &&
        next.bransch === undefined &&
        next.query !== current.query &&
        next.query.trim().length > 0;
      if (typing) {
        merged.sni = "";
        merged.bransch = "";
      }
      return merged;
    });
  }

  return (
    <section className="relative isolate overflow-hidden">
      <Blob color="var(--rose)" className="-top-24 -left-28 -z-10 h-80 w-80 opacity-70" />
      <Blob color="var(--sun)" shape={1} slow className="top-[55%] -left-20 -z-10 h-64 w-64 opacity-80" />
      <Blob color="var(--leaf)" shape={1} className="-top-16 right-[-6rem] -z-10 h-72 w-72 opacity-60" />
      <div className="home-hero mx-auto grid max-w-6xl gap-6 px-4 pt-5 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:grid-rows-[auto_auto] lg:gap-x-10 lg:gap-y-0 lg:pt-4 lg:pb-10 short:pt-2">
        <article className="relative min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="eyebrow text-sea">Företagsdata · utdrag</p>
          <h1 className="mt-3 text-[3.1rem] leading-[0.9] sm:text-7xl lg:text-[5.4rem] short:lg:text-[4.6rem]">
            <span className="block">
              Alla Sveriges{" "}
              <span className="relative inline-block">
                <span className="relative z-10">företag.</span>
                <Squiggle className="absolute -bottom-1.5 left-0 h-4 w-full sm:-bottom-2 sm:h-5" color="var(--sun)" />
              </span>
            </span>
            <span className="mt-1 block text-sea">Se antal och pris direkt.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 font-medium sm:text-lg">
            Välj bransch och region i byggaren. Ni ser direkt <strong className="bg-sun-soft px-1">hur många kunder</strong> ni når och{" "}
            <strong className="bg-rose-soft px-1">vad utdraget kostar</strong>. Ni betalar bara för det ni behöver.
          </p>
        </article>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div className="flex flex-wrap gap-3 lg:mt-6">
            <Link href="/#urval" className="btn-chunk h-13 px-6 text-base">
              Bygg ett utdrag →
            </Link>
            <Link href="/statistik" className="btn-chunk is-white h-13 px-6 text-base">
              Näringslivet i siffror
            </Link>
          </div>
          <ul className="mt-6 grid max-w-xl gap-x-5 gap-y-2 text-sm font-bold sm:grid-cols-2">
            {[
              "Färsk data från SCB:s företagsregister",
              "Reklamspärrade bolag tas alltid bort",
              `${formatCount(added)} nya bolag senaste 30 dagarna${exampleData ? " (exempeldata)" : ""}`,
              "Ingen prenumeration, ingen bindningstid",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="block-leaf mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[0.7rem] font-black">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 max-lg:row-start-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <ListBuilder draft={draft} onChange={patch} urval={shown} loading={loading} updatedLabel={updatedLabel} exampleData={exampleData} />
        </div>
      </div>
    </section>
  );
}
