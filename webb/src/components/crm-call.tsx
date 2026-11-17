"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CrmCard } from "@/components/crm-card";
import { COMPANIES, defaultSelection, filterCompanies, type Selection } from "@/lib/catalog";
import { useCrmStore, type Segment } from "@/lib/crm-store";

export function ColdCall({ segmentId }: { segmentId: string }) {
  const store = useCrmStore();
  const segment = store.segments.find((item) => item.id === segmentId) ?? null;

  if (!segmentId || !segment) {
    return (
      <section>
        <h1 className="text-3xl tracking-tight">Ring</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Välj ett sparat segment. Kundkorten kommer ett i taget. Efter varje samtal loggar du utfallet, och nästa bolag
          visas.
        </p>
        {store.segments.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Inga segment ännu. Spara ett urval under Sök bolag.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
            {store.segments.map((item) => (
              <li key={item.id}>
                <Link href={`/crm/ring?segment=${item.id}`} className="block px-4 py-3">
                  <span className="block font-medium">{item.name}</span>
                  <span className="text-sm text-muted">{filterCompanies(selectionFromSegment(item)).length} bolag</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return <Queue segment={segment} />;
}

function Queue({ segment }: { segment: Segment }) {
  const store = useCrmStore();
  const companies = filterCompanies(selectionFromSegment(segment));
  const orgNrs = companies.map((company) => company.orgNr);
  const queue = store.queue?.segmentId === segment.id ? store.queue : null;

  useEffect(() => {
    if (!store.ready) return;
    if (queue && queue.orgNrs.join() === orgNrs.join()) return;
    store.saveQueue({ segmentId: segment.id, orgNrs, index: 0 });
  }, [store.ready, segment.id, orgNrs.join()]);

  const index = queue?.index ?? 0;
  const current = COMPANIES.find((company) => company.orgNr === orgNrs[index]) ?? null;

  if (orgNrs.length === 0) {
    return <p className="text-sm text-muted">Segmentet innehåller inga exempelbolag.</p>;
  }

  if (!current || index >= orgNrs.length) {
    return (
      <section>
        <h1 className="text-3xl tracking-tight">Segmentet är genomgånget</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{segment.name}. Alla bolag i kön har fått ett utfall.</p>
        <button
          type="button"
          className="btn-fade-sea mt-4 h-12 rounded-full bg-sea px-4 text-sm font-medium text-white"
          onClick={() => store.saveQueue({ segmentId: segment.id, orgNrs, index: 0 })}
        >
          Börja om
        </button>
      </section>
    );
  }

  return (
    <CrmCard
      company={current}
      call={{
        index,
        total: orgNrs.length,
        segmentName: segment.name,
        onDone: () => store.saveQueue({ segmentId: segment.id, orgNrs, index: index + 1 }),
      }}
    />
  );
}

function selectionFromSegment(segment: Segment): Selection {
  return {
    ...defaultSelection,
    phones: false,
    emails: false,
    signatory: false,
    query: segment.query,
    city: segment.city,
    county: segment.county,
    bransch: segment.bransch,
    sni: segment.sni,
    forms: segment.forms,
    employees: segment.employees,
  };
}
