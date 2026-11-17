"use client";

import { useEffect, useMemo, useState } from "react";
import { CITIES, COMPANIES, INDUSTRIES, filterCompanies, defaultSelection } from "@/lib/catalog";

const SEGMENTS_KEY = "visalight-crm-segments";
const LOG_KEY = "visalight-crm-log";

type Segment = {
  id: string;
  name: string;
  query: string;
  city: string;
  sni: string;
};

type Channel = "samtal" | "mejl";

type LogEntry = {
  id: string;
  orgNr: string;
  companyName: string;
  at: string;
  channel: Channel;
  note: string;
};

export function CrmDesk() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [sni, setSni] = useState("");
  const [segmentName, setSegmentName] = useState("");
  const [segmentError, setSegmentError] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [activeOrgNr, setActiveOrgNr] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("samtal");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    setSegments(readList<Segment>(SEGMENTS_KEY));
    setEntries(readList<LogEntry>(LOG_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments));
  }, [segments, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(LOG_KEY, JSON.stringify(entries));
  }, [entries, ready]);

  const rows = useMemo(
    () => filterCompanies({ ...defaultSelection, query, city, sni }),
    [query, city, sni],
  );
  const active = COMPANIES.find((company) => company.orgNr === activeOrgNr) ?? null;
  const newest = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const visibleLog = active ? newest.filter((entry) => entry.orgNr === active.orgNr) : newest;

  function saveSegment() {
    const name = segmentName.trim();
    if (name.length < 2) {
      setSegmentError("Döp segmentet med minst två tecken.");
      return;
    }
    setSegmentError("");
    setSegments((current) => [
      { id: crypto.randomUUID(), name, query, city, sni },
      ...current,
    ]);
    setSegmentName("");
  }

  function applySegment(segment: Segment) {
    setQuery(segment.query);
    setCity(segment.city);
    setSni(segment.sni);
  }

  function addLog() {
    if (!active) return;
    const text = note.trim();
    if (text.length < 2) {
      setNoteError("Skriv en kort anteckning.");
      return;
    }
    setNoteError("");
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      orgNr: active.orgNr,
      companyName: active.name,
      at: new Date().toISOString(),
      channel,
      note: text,
    };
    setEntries((current) => [entry, ...current]);
    setNote("");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <p className="text-sm uppercase tracking-[0.16em] text-sea">Internt · inte butiken</p>
      <h1 className="mt-2 text-4xl tracking-tight sm:text-5xl">Arbetsytan</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        Sök exempelbolag på namn, ort och bransch, spara filtret som ett segment och skriv en loggrad.
        Inget konto, inga roller och inget mejl skickas. Ett köp görs som gäst i kassan och passerar inte den här sidan.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-3xl border border-line bg-card p-4 sm:p-5">
          <h2 className="text-2xl tracking-tight">Sök exempelbolag</h2>
          <div className="mt-4 grid gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Namn</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Namn eller organisationsnummer"
                className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Ort</span>
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
                >
                  <option value="">Alla orter</option>
                  {CITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Bransch</span>
                <select
                  value={sni}
                  onChange={(event) => setSni(event.target.value)}
                  className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
                >
                  <option value="">Alla branscher</option>
                  {INDUSTRIES.map((item) => (
                    <option key={item.sni} value={item.sni}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              saveSegment();
            }}
          >
            <label className="block flex-1 text-sm">
              <span className="mb-1.5 block font-medium">Spara filtret som segment</span>
              <input
                value={segmentName}
                onChange={(event) => setSegmentName(event.target.value)}
                placeholder="Till exempel restauranger i Malmö"
                className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
              />
            </label>
            <button type="submit" className="h-12 rounded-full bg-sea px-4 text-sm font-medium text-white">
              Spara segment
            </button>
          </form>
          {segmentError ? <p className="mt-2 text-sm text-rust">{segmentError}</p> : null}

          {segments.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {segments.map((segment) => (
                <li key={segment.id} className="flex items-center gap-1 rounded-full border border-line bg-white pl-3">
                  <button type="button" className="py-2 text-sm" onClick={() => applySegment(segment)}>
                    {segment.name}
                  </button>
                  <button
                    type="button"
                    className="px-2 py-2 text-xs text-muted"
                    onClick={() => setSegments((current) => current.filter((item) => item.id !== segment.id))}
                  >
                    Ta bort
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Inga sparade segment i den här sessionen.</p>
          )}

          <p className="mt-5 text-sm text-muted">
            {rows.length.toLocaleString("sv-SE")} exempelbolag. Påhittade bolag, samma urval som i butiken.
          </p>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {rows.map((company) => (
              <li key={company.orgNr}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrgNr(company.orgNr);
                    setNoteError("");
                  }}
                  className={`flex w-full flex-col px-3 py-3 text-left ${
                    activeOrgNr === company.orgNr ? "bg-foam" : "bg-white"
                  }`}
                  aria-pressed={activeOrgNr === company.orgNr}
                >
                  <span className="font-medium">{company.name}</span>
                  <span className="text-sm text-muted">
                    {company.city} · {company.industry}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-line bg-card p-4 sm:p-5">
          <h2 className="text-2xl tracking-tight">{active ? active.name : "Fortsätt här"}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {active
              ? `${active.city} · ${active.industry}. Loggen visas nyast först.`
              : "Senaste loggraden ligger överst, så det syns var du ska fortsätta."}
          </p>

          {active ? (
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                addLog();
              }}
            >
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Kanal</span>
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as Channel)}
                  className="h-12 w-full rounded-xl border border-line bg-white px-3 text-base"
                >
                  <option value="samtal">Samtal</option>
                  <option value="mejl">Mejl</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Anteckning</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-base"
                />
              </label>
              {noteError ? <p className="text-sm text-rust">{noteError}</p> : null}
              <button type="submit" className="h-12 rounded-full bg-amber font-medium text-ink">
                Lägg till i loggen
              </button>
              <button
                type="button"
                className="text-left text-sm text-sea"
                onClick={() => setActiveOrgNr(null)}
              >
                Visa alla loggrader
              </button>
            </form>
          ) : null}

          {visibleLog.length === 0 ? (
            <p className="mt-5 text-sm leading-6 text-muted">
              Ingen loggrad ännu. Välj ett bolag och skriv samtal eller mejl.
            </p>
          ) : (
            <ol className="mt-5 space-y-3">
              {visibleLog.map((entry) => (
                <li key={entry.id} className="rounded-2xl border border-line bg-white px-3 py-3">
                  <button type="button" className="text-left" onClick={() => setActiveOrgNr(entry.orgNr)}>
                    <span className="block text-sm text-muted">{formatStamp(entry.at)}</span>
                    <span className="mt-1 block font-medium">
                      {entry.companyName} · {entry.channel === "samtal" ? "Samtal" : "Mejl"}
                    </span>
                    <span className="mt-1 block text-sm leading-6">{entry.note}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

function readList<T>(key: string): T[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatStamp(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(new Date(iso));
}
