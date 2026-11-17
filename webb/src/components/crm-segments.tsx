"use client";

import { useState } from "react";
import Link from "next/link";
import { NewCallListForm } from "@/components/crm-call";
import { CompanyRow } from "@/components/crm-search";
import { downloadCsv } from "@/components/crm-export";
import { describeSelection, selectionToQuery } from "@/lib/catalog";
import { formatStamp, segmentCompanies, selectionFromSegment, useCrmStore, type Segment } from "@/lib/crm-store";

export function MySegments() {
  const store = useCrmStore();
  const [showArchived, setShowArchived] = useState(false);
  const list = store.segments.filter((item) => showArchived || !item.archived);
  const archived = store.segments.filter((item) => item.archived).length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Mina segment</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Sparade urval ur registret. Öppna ett segment för att se bolagen, döp om det, kopiera det eller gör en
            ringlista. Segment arkiveras och kan återställas, de raderas inte.
          </p>
        </div>
        <Link href="/crm/sok" className="btn-fade-amber inline-flex h-11 items-center rounded-full bg-amber px-5 text-sm font-semibold text-ink">
          Nytt segment
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-line bg-white px-4 py-10 text-sm leading-6 text-muted">
          Inga sparade segment ännu. Gå till{" "}
          <Link href="/crm/sok" className="font-semibold text-sea underline">
            Sök &amp; segment
          </Link>
          , gör ett urval och spara det med ett namn.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 xl:grid-cols-2">
          {list.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} />
          ))}
        </ul>
      )}
      {archived ? (
        <button type="button" className="mt-3 text-sm font-semibold text-sea" onClick={() => setShowArchived((current) => !current)}>
          {showArchived ? "Dölj arkiverade" : `Visa arkiverade (${archived})`}
        </button>
      ) : null}
    </section>
  );
}

function SegmentCard({ segment }: { segment: Segment }) {
  const store = useCrmStore();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(segment.name);
  const [ring, setRing] = useState(false);
  const companies = segmentCompanies(segment);
  const [show, setShow] = useState(false);
  const canRestore = !segment.archived || store.isAdmin;

  return (
    <li className={`rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5 ${segment.archived ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {renaming ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                store.renameSegment(segment.id, name);
                setRenaming(false);
              }}
            >
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
                aria-label="Nytt namn"
                className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-paper px-3"
              />
              <button type="submit" className="btn-fade-sea h-10 rounded-full bg-sea px-4 text-sm font-semibold text-white">
                Spara namn
              </button>
            </form>
          ) : (
            <p className="text-xl font-semibold tracking-tight">{segment.name}</p>
          )}
          <p className="mt-1 text-sm leading-6 text-muted">{segment.orgNrs ? `Handplockat segment med ${segment.orgNrs.length} bolag` : describeSelection(selectionFromSegment(segment))}</p>
          <p className="mt-0.5 text-xs text-muted">
            {segment.createdAt ? `Sparat ${formatStamp(segment.createdAt)}` : "Sparat"}
            {segment.createdBy ? ` av ${segment.createdBy}` : ""}
            {segment.archived ? " · arkiverat" : ""}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-amber-soft px-3 py-2 text-center">
          <span className="block text-2xl font-semibold leading-none">{companies.length.toLocaleString("sv-SE")}</span>
          <span className="text-xs font-medium">bolag</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {segment.orgNrs ? (
          <button type="button" onClick={() => setShow((current) => !current)} className="btn-fade-sea h-10 rounded-full bg-sea px-4 font-semibold text-white">
            {show ? "Dölj bolag" : "Öppna"}
          </button>
        ) : (
          <>
            <Link
              href={`/crm/sok?${selectionToQuery(selectionFromSegment(segment))}`}
              className="btn-fade-sea inline-flex h-10 items-center rounded-full bg-sea px-4 font-semibold text-white"
            >
              Öppna i sökningen
            </Link>
            <button type="button" onClick={() => setShow((current) => !current)} className="h-10 rounded-full border border-line px-4 font-medium">
              {show ? "Dölj bolag" : "Visa bolag"}
            </button>
          </>
        )}
        {segment.archived ? null : (
          <button type="button" onClick={() => setRing((current) => !current)} className="btn-fade-green h-10 rounded-full bg-green px-4 font-semibold text-white">
            Ringlista
          </button>
        )}
        <button type="button" onClick={() => setRenaming((current) => !current)} className="h-10 rounded-full border border-line px-4 font-medium">
          Döp om
        </button>
        <button type="button" onClick={() => store.duplicateSegment(segment.id)} className="h-10 rounded-full border border-line px-4 font-medium">
          Duplicera
        </button>
        <button type="button" onClick={() => downloadCsv(companies, store, segment.name)} className="h-10 rounded-full border border-line px-4 font-medium">
          Exportera CSV
        </button>
        {canRestore ? (
          <button type="button" className="h-10 px-2 text-muted underline" onClick={() => store.setSegmentArchived(segment.id, !segment.archived)}>
            {segment.archived ? "Återställ (admin)" : "Arkivera"}
          </button>
        ) : (
          <span className="text-xs text-muted">Bara admin kan återställa.</span>
        )}
      </div>

      {show ? (
        <ul className="mt-4 max-h-96 divide-y divide-line overflow-auto rounded-2xl border border-line">
          {companies.slice(0, 40).map((company) => (
            <CompanyRow key={company.orgNr} company={company} />
          ))}
        </ul>
      ) : null}

      {ring ? (
        <div className="mt-4 rounded-2xl bg-foam p-4">
          <NewCallListForm fixed={{ name: segment.name, source: segment.name, companies }} />
        </div>
      ) : null}
    </li>
  );
}
