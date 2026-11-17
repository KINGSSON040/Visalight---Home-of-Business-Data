"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CompanySearch } from "@/components/company-search";
import {
  COMPANIES,
  defaultSelection,
  filterCompanies,
  legalFormLabel,
  sameSearch,
  type Company,
  type Selection,
} from "@/lib/catalog";

const SEGMENTS_KEY = "visalight-crm-segments";
const LOG_KEY = "visalight-crm-log";
const MINE_KEY = "visalight-crm-mine";
const CLAIMS_KEY = "visalight-crm-claims";
const USER_KEY = "visalight-crm-user";

const STAFF = [
  { id: "anna", name: "Anna Berg" },
  { id: "erik", name: "Erik Holm" },
  { id: "mira", name: "Mira Lind" },
] as const;

type StaffId = (typeof STAFF)[number]["id"];

type Claim = {
  orgNr: string;
  userId: StaffId;
  userName: string;
  at: string;
};

type Segment = {
  id: string;
  name: string;
  query: string;
  city: string;
  bransch: string;
  sni: string;
  forms: string[];
};

type Channel = "samtal" | "mejl" | "sms";

type LogEntry = {
  id: string;
  orgNr: string;
  companyName: string;
  at: string;
  channel: Channel;
  note: string;
};

const blankSearch: Selection = {
  ...defaultSelection,
  phones: false,
  emails: false,
  signatory: false,
};

export function CrmDesk() {
  const [draft, setDraft] = useState<Selection>(blankSearch);
  const [applied, setApplied] = useState<Selection>(blankSearch);
  const [searched, setSearched] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [segmentError, setSegmentError] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [userId, setUserId] = useState<StaffId>(STAFF[0].id);
  const [ready, setReady] = useState(false);
  const [activeOrgNr, setActiveOrgNr] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel>("samtal");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [panel, setPanel] = useState<"sok" | "mina" | "segment" | "logg">("sok");

  useEffect(() => {
    setSegments(readList<Segment>(SEGMENTS_KEY).map(normalizeSegment));
    setEntries(readList<LogEntry>(LOG_KEY));
    setClaims(readClaims());
    setUserId(readUserId());
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

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  }, [claims, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(USER_KEY, userId);
  }, [userId, ready]);

  const rows = useMemo(() => (searched ? filterCompanies(applied) : []), [searched, applied]);
  const currentUser = STAFF.find((person) => person.id === userId) ?? STAFF[0];
  const myCompanies = claims.flatMap((claim) => {
    if (claim.userId !== userId) return [];
    const company = COMPANIES.find((item) => item.orgNr === claim.orgNr);
    return company ? [{ claim, company }] : [];
  });
  const active = COMPANIES.find((company) => company.orgNr === activeOrgNr) ?? null;
  const newest = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const visibleLog = active ? newest.filter((entry) => entry.orgNr === active.orgNr) : newest;
  const dirty = searched && !sameSearch(draft, applied);

  function patch(next: Partial<Selection>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function runSearch(next: Selection = draft) {
    setDraft(next);
    setApplied(next);
    setSearched(true);
    setPanel("sok");
  }

  function saveSegment() {
    const name = segmentName.trim();
    if (name.length < 2) {
      setSegmentError("Döp segmentet med minst två tecken.");
      return;
    }
    setSegmentError("");
    const source = draft;
    setSegments((current) => [
      {
        id: crypto.randomUUID(),
        name,
        query: source.query,
        city: source.city,
        bransch: source.bransch,
        sni: source.sni,
        forms: source.forms,
      },
      ...current,
    ]);
    setSegmentName("");
    runSearch(source);
  }

  function applySegment(segment: Segment) {
    const next: Selection = {
      ...blankSearch,
      query: segment.query,
      city: segment.city,
      bransch: segment.bransch,
      sni: segment.sni,
      forms: segment.forms,
    };
    runSearch(next);
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

  function claimActive() {
    if (!active) return;
    setClaims((current) => {
      if (current.some((item) => item.orgNr === active.orgNr)) return current;
      return [
        { orgNr: active.orgNr, userId: currentUser.id, userName: currentUser.name, at: new Date().toISOString() },
        ...current,
      ];
    });
  }

  function releaseActive() {
    if (!active) return;
    setClaims((current) => current.filter((item) => !(item.orgNr === active.orgNr && item.userId === userId)));
  }

  const hint = !searched
    ? "Gör valen och tryck Sök bolag. Förslagen kommer från exempelregistret."
    : dirty
      ? "Filtren är ändrade. Tryck Sök bolag för att uppdatera listan."
      : `${rows.length.toLocaleString("sv-SE")} exempelbolag i urvalet.`;

  return (
    <div className="min-h-dvh text-ink lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="theme-wash lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ink/60">Internt</p>
            <p className="text-2xl tracking-tight">VisaLight</p>
            <p className="text-sm text-ink/70">CRM</p>
          </div>
          <Link href="/" className="text-sm text-ink/70 lg:hidden">
            Till butiken
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-3">
          <NavButton pressed={panel === "sok"} onClick={() => setPanel("sok")}>
            Sök bolag
          </NavButton>
          <NavButton pressed={panel === "mina"} onClick={() => setPanel("mina")}>
            Mina företag{myCompanies.length ? ` · ${myCompanies.length}` : ""}
          </NavButton>
          <NavButton pressed={panel === "segment"} onClick={() => setPanel("segment")}>
            Segment{segments.length ? ` · ${segments.length}` : ""}
          </NavButton>
          <NavButton pressed={panel === "logg"} onClick={() => setPanel("logg")}>
            Aktivitet{entries.length ? ` · ${entries.length}` : ""}
          </NavButton>
        </nav>
        <label className="mx-3 mb-4 block text-sm">
          <span className="mb-1.5 block text-ink/70">Säljare</span>
          <select
            value={userId}
            onChange={(event) => setUserId(event.target.value as StaffId)}
            className="h-10 w-full rounded-xl border border-ink/15 bg-white/70 px-2 text-sm text-ink"
          >
            {STAFF.map((person) => (
              <option key={person.id} value={person.id} className="text-ink">
                {person.name}
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-xs leading-5 text-ink/70">
            Exempelkonton. Byt säljare för att se någon annans bolag.
          </span>
        </label>
        <p className="mt-auto hidden px-5 py-5 text-sm leading-6 text-ink/70 lg:block">
          Exempelbolag tills det riktiga registret är kopplat. Inget raderas härifrån.
        </p>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <p className="rounded-2xl bg-amber-soft px-4 py-3 text-sm leading-6">
          Förhandsvisning med exempelbolag. Sök, ägarskap, segment och logg sparas i den här webbläsaren.
        </p>

        {panel === "mina" ? (
          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <section>
              <h1 className="text-3xl tracking-tight">Mina företag</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Bolag som {currentUser.name} själv markerat. Kollegorna ser ägaren på kundkortet och i träfflistan,
                så de vet att en annan säljare redan bearbetar bolaget.
              </p>
              {myCompanies.length === 0 ? (
                <p className="mt-4 rounded-3xl border border-dashed border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
                  Inga bolag markerade. Öppna ett kundkort under Sök bolag och välj Markera som mitt.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
                  {myCompanies.map(({ claim, company }) => (
                    <li key={company.orgNr}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOrgNr(company.orgNr);
                          setNoteError("");
                        }}
                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left ${
                          activeOrgNr === company.orgNr ? "bg-foam" : "bg-white"
                        }`}
                        aria-pressed={activeOrgNr === company.orgNr}
                      >
                        <span>
                          <span className="block font-medium">{company.name}</span>
                          <span className="mt-0.5 block text-sm text-muted">
                            {company.orgNr} · {company.city} · {company.industry}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-sea">Sedan {formatStamp(claim.at)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <CompanyCard
              company={active}
              claim={active ? (claims.find((item) => item.orgNr === active.orgNr) ?? null) : null}
              currentUserId={userId}
              onClaim={claimActive}
              onRelease={releaseActive}
              channel={channel}
              onChannel={setChannel}
              note={note}
              onNote={setNote}
              noteError={noteError}
              onLog={addLog}
              entries={visibleLog}
              onOpenLog={(orgNr) => setActiveOrgNr(orgNr)}
            />
          </div>
        ) : null}

        {panel === "segment" ? (
          <section className="mt-5 rounded-3xl border border-line bg-white p-4 sm:p-5">
            <h1 className="text-3xl tracking-tight">Segment</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Ett segment är ett sparat urval. Öppna det för att fortsätta där du slutade.
            </p>
            {segments.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Inga sparade segment ännu. Sök bolag och spara filtret.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
                {segments.map((segment) => (
                  <li key={segment.id} className="flex items-center justify-between gap-3 px-3 py-3">
                    <button type="button" className="text-left" onClick={() => applySegment(segment)}>
                      <span className="block font-medium">{segment.name}</span>
                      <span className="text-sm text-muted">{segmentSummary(segment)}</span>
                    </button>
                    <button
                      type="button"
                      className="text-sm text-muted"
                      onClick={() => setSegments((current) => current.filter((item) => item.id !== segment.id))}
                    >
                      Ta bort
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {panel === "logg" ? (
          <section className="mt-5 rounded-3xl border border-line bg-white p-4 sm:p-5">
            <h1 className="text-3xl tracking-tight">Aktivitet</h1>
            <p className="mt-2 text-sm leading-6 text-muted">Nyast först, så det syns var du ska fortsätta.</p>
            <LogList
              entries={newest}
              onOpen={(orgNr) => {
                setActiveOrgNr(orgNr);
                setPanel("sok");
              }}
            />
          </section>
        ) : null}

        {panel === "sok" ? (
          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <section id="sok">
              <h1 className="text-3xl tracking-tight">Sök bolag</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Skriv bransch, SNI-kod, bolagsnamn eller organisationsnummer. Ort och bransch vid sidan smalnar av
                urvalet. Förslag visas under fältet medan du skriver.
              </p>
              <div className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
                <CompanySearch
                  draft={draft}
                  onChange={patch}
                  onSearch={() => runSearch()}
                  onClear={() => patch({ query: "", city: "", bransch: "", sni: "", forms: [] })}
                  hint={hint}
                />
                <form
                  className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-end"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveSegment();
                  }}
                >
                  <label className="block flex-1 text-sm">
                    <span className="mb-1.5 block font-medium">Spara urvalet som segment</span>
                    <input
                      value={segmentName}
                      onChange={(event) => setSegmentName(event.target.value)}
                      placeholder="Till exempel restauranger i Malmö"
                      className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
                    />
                  </label>
                  <button type="submit" className="h-12 rounded-full bg-sea px-4 text-sm font-medium text-white">
                    Spara segment
                  </button>
                </form>
                {segmentError ? <p className="mt-2 text-sm text-rust">{segmentError}</p> : null}
              </div>

              <div className="mt-4">
                {!searched ? (
                  <p className="rounded-3xl border border-dashed border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
                    Inget urval ännu. Fyll i fälten och tryck Sök bolag.
                  </p>
                ) : rows.length === 0 ? (
                  <p className="rounded-3xl border border-line bg-white px-4 py-8 text-sm leading-6 text-muted">
                    Inget exempelbolag matchar. Prova ett förslag under fältet, eller rensa ett filter.
                  </p>
                ) : (
                  <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
                    {rows.map((company) => (
                      <li key={company.orgNr}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOrgNr(company.orgNr);
                            setNoteError("");
                          }}
                          className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left ${
                            activeOrgNr === company.orgNr ? "bg-foam" : "bg-white"
                          }`}
                          aria-pressed={activeOrgNr === company.orgNr}
                        >
                          <span>
                            <span className="block font-medium">{company.name}</span>
                            <span className="mt-0.5 block text-sm text-muted">
                              {company.orgNr} · {company.city} · {company.industry} · SNI {company.sni}
                            </span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-1 text-right">
                            <span className="rounded-full bg-paper px-2 py-0.5 text-xs">{legalFormLabel(company.form)}</span>
                            <OwnerBadge claim={claims.find((item) => item.orgNr === company.orgNr)} currentUserId={userId} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <CompanyCard
              company={active}
              claim={active ? (claims.find((item) => item.orgNr === active.orgNr) ?? null) : null}
              currentUserId={userId}
              onClaim={claimActive}
              onRelease={releaseActive}
              channel={channel}
              onChannel={setChannel}
              note={note}
              onNote={setNote}
              noteError={noteError}
              onLog={addLog}
              entries={visibleLog}
              onOpenLog={(orgNr) => setActiveOrgNr(orgNr)}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function NavButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      aria-current={pressed ? "page" : undefined}
      className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-medium ${
        pressed ? "bg-sea text-white" : "bg-transparent text-ink/75 hover:bg-white/40"
      }`}
    >
      {children}
    </button>
  );
}

function OwnerBadge({ claim, currentUserId }: { claim: Claim | undefined; currentUserId: StaffId }) {
  if (!claim) return null;
  const mine = claim.userId === currentUserId;
  return (
    <span className={`text-xs font-medium ${mine ? "text-sea" : "text-rust"}`}>
      {mine ? "Ditt bolag" : `Bearbetas av ${claim.userName}`}
    </span>
  );
}

function CompanyCard({
  company,
  claim,
  currentUserId,
  onClaim,
  onRelease,
  channel,
  onChannel,
  note,
  onNote,
  noteError,
  onLog,
  entries,
  onOpenLog,
}: {
  company: Company | null;
  claim: Claim | null;
  currentUserId: StaffId;
  onClaim: () => void;
  onRelease: () => void;
  channel: Channel;
  onChannel: (channel: Channel) => void;
  note: string;
  onNote: (value: string) => void;
  noteError: string;
  onLog: () => void;
  entries: LogEntry[];
  onOpenLog: (orgNr: string) => void;
}) {
  const mine = claim?.userId === currentUserId;
  const takenByOther = Boolean(claim && !mine);
  return (
    <section className="rounded-3xl border border-line bg-white p-4 sm:p-5 xl:sticky xl:top-4">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sea">Kundkort</p>
      <h2 className="mt-1 text-2xl tracking-tight">{company ? company.name : "Inget bolag valt"}</h2>
      {company ? (
        <>
          <p className="mt-1 text-sm text-muted">
            {company.orgNr} · {legalFormLabel(company.form)}
          </p>
          {mine ? (
            <div className="mt-3 rounded-2xl bg-foam px-3 py-3">
              <p className="text-sm font-medium text-sea">Du bearbetar bolaget</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Markerat {formatStamp(claim.at)}. Andra säljare ser att kortet är ditt.
              </p>
              <button type="button" onClick={onRelease} className="mt-3 h-10 rounded-full border border-line bg-white px-3 text-sm font-medium">
                Avmarkera
              </button>
            </div>
          ) : null}
          {takenByOther && claim ? (
            <div className="mt-3 rounded-2xl bg-amber-soft px-3 py-3">
              <p className="text-sm font-medium">Bearbetas av {claim.userName}</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Markerat {formatStamp(claim.at)}. En annan säljare äger kortet, så det går inte att ta över.
              </p>
            </div>
          ) : null}
          {!claim ? (
            <button type="button" onClick={onClaim} className="mt-3 h-10 rounded-full bg-sea px-4 text-sm font-medium text-white">
              Markera som mitt
            </button>
          ) : null}
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Adress</dt>
              <dd>
                {company.street}, {company.postalCode} {company.city}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Bransch</dt>
              <dd>
                {company.industry} · SNI {company.sni}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Telefon</dt>
              <dd>{company.phones.length ? company.phones.join(", ") : "Inget nummer i källan"}</dd>
            </div>
            <div>
              <dt className="text-muted">Beslutsfattare</dt>
              <dd>{company.signatoryPhones.length ? company.signatoryPhones.join(", ") : "Inget nummer i källan"}</dd>
            </div>
            <div>
              <dt className="text-muted">E-post</dt>
              <dd>{company.emails.length ? company.emails.join(", ") : "Ingen adress i källan"}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl bg-paper px-3 py-3">
            <p className="text-sm font-medium">Personer</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Inga personer är kopplade till bolaget i exemplet.
            </p>
          </div>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              onLog();
            }}
          >
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Logga</span>
              <select
                value={channel}
                onChange={(event) => onChannel(event.target.value as Channel)}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
              >
                <option value="samtal">Samtal</option>
                <option value="mejl">Mejl</option>
                <option value="sms">Sms</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Anteckning</span>
              <textarea
                value={note}
                onChange={(event) => onNote(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-base"
              />
            </label>
            {noteError ? <p className="text-sm text-rust">{noteError}</p> : null}
            <button type="submit" className="h-12 rounded-full bg-amber font-medium text-ink">
              Lägg till i loggen
            </button>
          </form>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">
          Sök fram ett bolag och öppna kortet. Loggen ligger kvar, nyast först.
        </p>
      )}
      <LogList entries={entries} onOpen={onOpenLog} />
    </section>
  );
}

function LogList({ entries, onOpen }: { entries: LogEntry[]; onOpen: (orgNr: string) => void }) {
  if (entries.length === 0) {
    return <p className="mt-4 text-sm leading-6 text-muted">Ingen loggrad ännu.</p>;
  }
  return (
    <ol className="mt-4 space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-line px-3 py-3">
          <button type="button" className="text-left" onClick={() => onOpen(entry.orgNr)}>
            <span className="block text-sm text-muted">{formatStamp(entry.at)}</span>
            <span className="mt-1 block font-medium">
              {entry.companyName} · {channelLabel(entry.channel)}
            </span>
            <span className="mt-1 block text-sm leading-6">{entry.note}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function channelLabel(channel: Channel): string {
  if (channel === "samtal") return "Samtal";
  if (channel === "mejl") return "Mejl";
  return "Sms";
}

function segmentSummary(segment: Segment): string {
  const forms = segment.forms.map(legalFormLabel);
  return [segment.city || "Alla orter", segment.bransch || "Alla branscher", forms.join(", ") || "Alla bolagsformer"]
    .filter(Boolean)
    .join(" · ");
}

function normalizeSegment(raw: Segment): Segment {
  return {
    id: raw.id,
    name: raw.name,
    query: raw.query ?? "",
    city: raw.city ?? "",
    bransch: raw.bransch ?? "",
    sni: raw.sni ?? "",
    forms: Array.isArray(raw.forms) ? raw.forms : [],
  };
}

function readClaims(): Claim[] {
  const stored = sessionStorage.getItem(CLAIMS_KEY);
  if (stored) {
    return readList<Claim>(CLAIMS_KEY).flatMap((item) => {
      if (!item || typeof item.orgNr !== "string" || typeof item.at !== "string") return [];
      const person = STAFF.find((staff) => staff.id === item.userId);
      if (!person) return [];
      return [{ orgNr: item.orgNr, userId: person.id, userName: person.name, at: item.at }];
    });
  }
  return readList<string>(MINE_KEY).flatMap((orgNr) => {
    if (typeof orgNr !== "string") return [];
    return [{ orgNr, userId: STAFF[0].id, userName: STAFF[0].name, at: new Date().toISOString() }];
  });
}

function readUserId(): StaffId {
  const stored = sessionStorage.getItem(USER_KEY);
  const person = STAFF.find((staff) => staff.id === stored);
  return person?.id ?? STAFF[0].id;
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
