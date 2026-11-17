"use client";

import { useState } from "react";
import { downloadCsv } from "@/components/crm-export";
import { COMPANIES } from "@/lib/catalog";
import { STAFF, useCrmStore } from "@/lib/crm-store";

export function BulkBar({ orgNrs, label, onClear }: { orgNrs: string[]; label: string; onClear: () => void }) {
  const store = useCrmStore();
  const [tag, setTag] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [listId, setListId] = useState("");
  const [message, setMessage] = useState("");

  const fixedSegments = store.segments.filter((item) => !item.archived && item.orgNrs);
  const lists = store.callLists.filter((item) => !item.archived);

  function say(text: string) {
    setMessage(text);
  }

  return (
    <div className="sticky top-16 z-20 mt-3 rounded-2xl border-2 border-sea bg-white p-3 shadow-lg" role="region" aria-label="Massåtgärder">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-sea px-3 py-1 font-semibold text-white">{orgNrs.length} valda</span>
        <button
          type="button"
          onClick={() => say(`${store.claimMany(orgNrs)} bolag lades i Mina kunder. Redan ägda bolag hoppades över.`)}
          className="btn-fade-amber h-9 rounded-full bg-amber px-4 font-semibold text-ink"
        >
          Ta ägarskap
        </button>
        {store.isAdmin ? (
          <select
            aria-label="Tilldela säljare"
            value=""
            onChange={(event) => {
              if (!event.target.value) return;
              store.assignOwner(orgNrs, event.target.value as (typeof STAFF)[number]["id"]);
              say(`Tilldelade ${orgNrs.length} bolag.`);
            }}
            className="h-9 rounded-full border border-line bg-paper px-3"
          >
            <option value="">Tilldela säljare</option>
            {STAFF.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        ) : null}
        <form
          className="flex gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            if (!tag.trim()) return;
            store.tagMany(orgNrs, tag);
            say(`Taggade ${orgNrs.length} bolag med ${tag.trim()}.`);
            setTag("");
          }}
        >
          <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Tagg" aria-label="Tagg för valda" className="h-9 w-28 rounded-full border border-line bg-paper px-3" />
          <button type="submit" className="btn-fade-sea h-9 rounded-full bg-sea px-4 font-semibold text-white">
            Tagga
          </button>
        </form>
        <div className="flex gap-1">
          <select aria-label="Fast segment" value={segmentId} onChange={(event) => setSegmentId(event.target.value)} className="h-9 rounded-full border border-line bg-paper px-3">
            <option value="">Lägg i segment</option>
            {fixedSegments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
            <option value="ny">Nytt segment av valda</option>
          </select>
          {segmentId ? (
            <button
              type="button"
              className="btn-fade-green h-9 rounded-full bg-green px-4 font-semibold text-white"
              onClick={() => {
                if (segmentId === "ny") {
                  const name = window.prompt("Namn på segmentet?")?.trim();
                  if (!name) return;
                  store.addSegment({ name, query: "", city: "", county: "", bransch: "", sni: "", forms: [], employees: "", orgNrs });
                  say(`Skapade segmentet ${name} med ${orgNrs.length} bolag.`);
                } else {
                  store.addToSegment(segmentId, orgNrs);
                  say(`Lade ${orgNrs.length} bolag i segmentet.`);
                }
                setSegmentId("");
              }}
            >
              Lägg till
            </button>
          ) : null}
        </div>
        {lists.length ? (
          <div className="flex gap-1">
            <select aria-label="Ringlista" value={listId} onChange={(event) => setListId(event.target.value)} className="h-9 rounded-full border border-line bg-paper px-3">
              <option value="">Lägg i ringlista</option>
              {lists.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {listId ? (
              <button
                type="button"
                className="btn-fade-green h-9 rounded-full bg-green px-4 font-semibold text-white"
                onClick={() => {
                  store.addToCallList(listId, orgNrs);
                  say(`Lade ${orgNrs.length} bolag i ringlistan.`);
                  setListId("");
                }}
              >
                Lägg till
              </button>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="h-9 rounded-full border border-line bg-white px-4 font-medium"
          onClick={() => {
            const chosen = COMPANIES.filter((item) => orgNrs.includes(item.orgNr));
            const count = downloadCsv(chosen, store, label);
            say(`Exporterade ${count} bolag. Exporten är loggad.`);
          }}
        >
          Exportera CSV
        </button>
        <button type="button" onClick={onClear} className="ml-auto h-9 px-3 text-muted underline">
          Avmarkera
        </button>
      </div>
      {message ? (
        <p role="status" className="mt-2 text-sm font-medium text-green">
          {message}
        </p>
      ) : null}
    </div>
  );
}
