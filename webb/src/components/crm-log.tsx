"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OppForm } from "@/components/crm-opps";
import { Field, Panel } from "@/components/crm-ui";
import type { Company } from "@/lib/catalog";
import {
  FLAGS,
  OUTCOMES,
  SYSTEM_EVENTS,
  formatStamp,
  isSystemKind,
  laterTodayLocal,
  localInputToIso,
  nextWeekLocal,
  outcomeInfo,
  outcomeLabel,
  tomorrowMorningLocal,
  useCrmStore,
  type Activity,
  type FlagId,
  type OutcomeId,
  type OutcomeTone,
} from "@/lib/crm-store";

const TONE_ON: Record<OutcomeTone, string> = {
  good: "btn-fade-green border-green bg-green text-white",
  warm: "btn-fade-amber border-amber bg-amber text-ink",
  neutral: "btn-fade-sea border-sea bg-sea text-white",
  bad: "btn-fade-rust border-rust bg-rust text-white",
};

const TONE_OFF: Record<OutcomeTone, string> = {
  good: "border-green/40 bg-green-soft text-ink hover:border-green",
  warm: "border-amber/60 bg-amber-soft text-ink hover:border-amber",
  neutral: "border-line bg-foam text-ink hover:border-sea",
  bad: "border-rust/40 bg-rust/10 text-ink hover:border-rust",
};

export function isStruck(struck: { orgNr: string; value: string }[], orgNr: string, value: string) {
  return struck.some((item) => item.orgNr === orgNr && item.value === value);
}

const NEEDS_NUMBER: string[] = ["inaktivt-nummer", "fel-nummer"];

export function LogPanel({
  company,
  focus,
}: {
  company: Company;
  focus?: { onSaved: (outcome: OutcomeId) => void; onSkip: () => void };
}) {
  const store = useCrmStore();
  const [outcome, setOutcome] = useState<OutcomeId | "">("");
  const [note, setNote] = useState("");
  const [nextAt, setNextAt] = useState("");
  const [nextNote, setNextNote] = useState("");
  const [phone, setPhone] = useState("");
  const [contactId, setContactId] = useState("");
  const [flag, setFlag] = useState<FlagId>("ingen-telefon");
  const [error, setError] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [oppOpen, setOppOpen] = useState(false);

  const people = store.contacts.filter((item) => item.orgNr === company.orgNr && !item.struck);
  const contactPhones = people.flatMap((item) =>
    item.phones.filter((entry) => !entry.struck).map((entry) => ({ value: entry.value, contactId: item.id, phoneId: entry.id })),
  );
  const registerPhones = [...new Set([...company.phones, ...company.signatoryPhones])]
    .filter((value) => !isStruck(store.struckPhones, company.orgNr, value))
    .map((value) => ({ value, contactId: "", phoneId: "" }));
  const numbers = [...registerPhones, ...contactPhones];
  const phoneBlocked = store.blockedChannels(company.orgNr).includes("phone");

  function reset() {
    setOutcome("");
    setNote("");
    setNextAt("");
    setNextNote("");
    setPhone("");
    setContactId("");
    setError("");
  }

  function save() {
    if (!outcome) {
      setError("Välj ett utfall först.");
      return;
    }
    if (NEEDS_NUMBER.includes(outcome) && !phone) {
      setError("Välj numret det gäller. Det stryks direkt och ligger kvar.");
      return;
    }
    if (outcome === "ring-igen" && !nextAt) {
      setError("Ange när du ska ringa igen.");
      return;
    }
    if (outcome === "anteckning" && !note.trim()) {
      setError("Skriv anteckningen.");
      return;
    }
    const chosen = numbers.find((item) => item.value === phone);
    if (NEEDS_NUMBER.includes(outcome) && chosen) {
      store.strikePhone(company.orgNr, chosen.value, chosen.contactId || undefined, chosen.phoneId || undefined);
    }
    if (outcome === "sparr") store.addFlag(company.orgNr, flag, note.trim());
    const person = people.find((item) => item.id === contactId);
    store.addActivity({
      id: crypto.randomUUID(),
      orgNr: company.orgNr,
      companyName: company.name,
      at: new Date().toISOString(),
      userId: store.currentUser.id,
      userName: store.currentUser.name,
      outcome,
      note: note.trim(),
      nextAt: outcome === "sparr" ? "" : localInputToIso(nextAt),
      nextNote: nextNote.trim(),
      struckPhone: NEEDS_NUMBER.includes(outcome) ? phone : "",
      contactName: person ? `${person.firstName} ${person.lastName}` : "",
      contactId: person?.id ?? "",
    });
    const saved = outcome;
    reset();
    focus?.onSaved(saved);
  }

  const saveRef = useRef(save);
  saveRef.current = save;
  const skipRef = useRef(focus?.onSkip);
  skipRef.current = focus?.onSkip;

  useEffect(() => {
    if (!focus) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        saveRef.current();
        return;
      }
      if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const hit = OUTCOMES.find((item) => item.key && item.key === key);
      if (hit) {
        event.preventDefault();
        setOutcome(hit.id);
        setError("");
        return;
      }
      if (key === "s") {
        event.preventDefault();
        saveRef.current();
      } else if (key === "h") {
        event.preventDefault();
        skipRef.current?.();
      } else if (key === "t") {
        event.preventDefault();
        setNextAt(tomorrowMorningLocal());
      } else if (key === "a") {
        event.preventDefault();
        noteRef.current?.focus();
      } else if (key === "m") {
        event.preventDefault();
        setOppOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  return (
    <Panel
      id="logga"
      title={focus ? "Hur gick samtalet?" : "Logga samtal eller anteckning"}
      intro={focus ? "Välj utfall, skriv gärna en rad och sätt tid för nästa försök. Då kommer nästa bolag." : undefined}
    >
      {phoneBlocked ? (
        <p className="mt-3 rounded-2xl border-2 border-rust bg-rust/10 px-3 py-2 text-sm font-semibold">
          Bolaget är spärrat för telefon. Samtalsutfall är låsta. Du kan fortfarande skriva anteckning eller mejla om bolaget inte är avregistrerat.
        </p>
      ) : null}
      <form
        className="mt-3 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div role="group" aria-label="Utfall" className={`grid gap-2 ${focus ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
          {OUTCOMES.map((item) => {
            const pressed = outcome === item.id;
            const locked = phoneBlocked && item.call && item.id !== "sparr";
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={pressed}
                disabled={locked}
                onClick={() => {
                  setOutcome(item.id);
                  setError("");
                  if (NEEDS_NUMBER.includes(item.id) && numbers.length === 1) setPhone(numbers[0].value);
                }}
                className={`relative rounded-2xl border-2 px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${focus ? "h-14" : "h-12"} ${
                  pressed ? TONE_ON[item.tone] : TONE_OFF[item.tone]
                }`}
              >
                {item.short}
                {focus && item.key ? (
                  <kbd className="absolute right-1.5 top-1 rounded bg-black/10 px-1 text-[0.65rem] font-bold">{item.key.toUpperCase()}</kbd>
                ) : null}
              </button>
            );
          })}
        </div>
        {focus ? (
          <p className="text-xs leading-5 text-muted">
            Genvägar: 1–9 och 0 väljer utfall, I inaktivt nummer, P spärr, T imorgon 09, A anteckning, M skapa möjlighet, S spara och nästa, H hoppa över. Ctrl+Enter sparar även när du skriver.
          </p>
        ) : null}

        {people.length ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vem pratade du med? (valfritt)</span>
            <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
              <option value="">Ingen vald</option>
              {people.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                  {item.role ? ` · ${item.role}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {outcome && NEEDS_NUMBER.includes(outcome) ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vilket nummer? Det stryks direkt och finns kvar.</span>
            <select value={phone} onChange={(event) => setPhone(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
              <option value="">Välj nummer</option>
              {numbers.map((item) => (
                <option key={`${item.contactId}-${item.phoneId}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {outcome === "sparr" ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vad har bolaget bett om?</span>
            <select value={flag} onChange={(event) => setFlag(event.target.value as FlagId)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
              {FLAGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted">Spärren syns direkt på kundkortet. Bara admin kan ta bort den.</span>
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Anteckning</span>
          <textarea
            ref={noteRef}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={focus ? 4 : 3}
            placeholder="Vad sades? Vad ska du komma ihåg?"
            className="w-full rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>

        {outcome === "sparr" ? null : (
          <div className="rounded-2xl bg-foam p-3">
            <p className="text-sm font-medium">Nästa aktivitet (skapar en uppgift med påminnelse){outcome === "ring-igen" ? " · krävs" : ""}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "Om 2 timmar", value: () => laterTodayLocal(2) },
                { label: "Imorgon kl. 09", value: tomorrowMorningLocal },
                { label: "Om en vecka", value: nextWeekLocal },
              ].map((chip) => (
                <button key={chip.label} type="button" onClick={() => setNextAt(chip.value())} className="h-9 rounded-full border border-sea/40 bg-white px-3 text-sm font-medium text-sea">
                  {chip.label}
                </button>
              ))}
              {nextAt ? (
                <button type="button" onClick={() => setNextAt("")} className="h-9 px-2 text-sm text-muted">
                  Ta bort tid
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Datum och tid" type="datetime-local" value={nextAt} onChange={setNextAt} />
              <Field label="Vad ska göras då" value={nextNote} onChange={setNextNote} placeholder="Till exempel ringa beslutsfattaren" />
            </div>
          </div>
        )}

        {error ? <p className="text-sm font-medium text-rust">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn-fade-amber h-12 flex-1 rounded-full bg-amber font-semibold text-ink">
            {focus ? "Spara och nästa bolag" : "Spara i loggen"}
          </button>
          {focus ? (
            <button
              type="button"
              onClick={() => {
                reset();
                focus.onSkip();
              }}
              className="h-12 rounded-full border border-line bg-white px-5 text-sm font-medium"
            >
              Hoppa över
            </button>
          ) : null}
        </div>
      </form>
      <div className="mt-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setOppOpen((current) => !current)}
          aria-expanded={oppOpen}
          className="btn-fade-sea h-11 rounded-full bg-sea px-5 text-sm font-semibold text-white"
        >
          {oppOpen ? "Dölj möjlighet" : "Skapa möjlighet av samtalet"}
          {focus ? <kbd className="ml-2 rounded bg-white/25 px-1 text-[0.65rem] font-bold">M</kbd> : null}
        </button>
        {oppOpen ? (
          <OppForm
            orgNr={company.orgNr}
            defaults={{
              title: `${company.name}`,
              source: "Kallringning",
              nextStep: nextNote,
              nextStepAt: nextAt,
              contactId,
            }}
            onCreated={() => setOppOpen(false)}
            onCancel={() => setOppOpen(false)}
          />
        ) : null}
        <p className="mt-2 text-xs leading-5 text-muted">Möjligheten hamnar i pipelinen och följs upp tills den är signerad eller förlorad.</p>
      </div>
    </Panel>
  );
}

type TimelineFilter = "alla" | "samtal" | "meddelanden" | "anteckningar" | "system";

function kindGroup(kind: string): Exclude<TimelineFilter, "alla"> {
  if (isSystemKind(kind)) return "system";
  if (kind === "mailat" || kind === "sms" || kind === "social") return "meddelanden";
  if (kind === "anteckning") return "anteckningar";
  return "samtal";
}

export function History({ entries, limit }: { entries: Activity[]; limit?: number }) {
  const [filter, setFilter] = useState<TimelineFilter>("alla");
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const filtered = sorted.filter((item) => filter === "alla" || kindGroup(item.outcome) === filter);
  const shown = limit ? filtered.slice(0, limit) : filtered;
  const filters: [TimelineFilter, string][] = [
    ["alla", "Alla"],
    ["samtal", "Samtal"],
    ["meddelanden", "Mejl och SMS"],
    ["anteckningar", "Anteckningar"],
    ["system", "Status och system"],
  ];
  return (
    <Panel title="Tidslinje" intro="Allt som har hänt med bolaget: vem som gjorde vad och när, nyast först. Loggen kan inte raderas.">
      <div className="mt-3 flex flex-wrap gap-1.5">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`h-8 rounded-full border px-3 text-xs font-semibold ${filter === id ? "btn-fade-sea border-sea bg-sea text-white" : "border-line bg-white"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? <p className="mt-3 text-sm text-muted">Inget att visa.</p> : null}
      <ol className="mt-3 space-y-2">
        {shown.map((entry) => (
          <HistoryRow key={entry.id} entry={entry} />
        ))}
      </ol>
      {limit && filtered.length > limit ? <p className="mt-2 text-xs text-muted">Visar de {limit} senaste av {filtered.length}.</p> : null}
    </Panel>
  );
}

export function HistoryRow({ entry }: { entry: Activity }) {
  const system = isSystemKind(entry.outcome);
  const tone = outcomeInfo(entry.outcome)?.tone ?? "neutral";
  const bar: Record<OutcomeTone, string> = {
    good: "border-green",
    warm: "border-amber",
    neutral: "border-sea",
    bad: "border-rust",
  };
  const known = entry.outcome in SYSTEM_EVENTS || Boolean(outcomeInfo(entry.outcome));
  return (
    <li className={`rounded-2xl border-l-4 bg-paper px-3 py-2.5 text-sm leading-6 ${system ? "border-line text-muted" : bar[tone]}`}>
      <p className="text-xs text-muted">
        {formatStamp(entry.at)} · {entry.userName}
      </p>
      <p className={system ? "" : "font-medium"}>
        {known ? outcomeLabel(entry.outcome) : entry.outcome}
        {entry.contactName && !system ? (
          <>
            {" · "}
            {entry.contactId ? (
              <Link href={`/crm/person/${entry.contactId}`} className="text-sea underline">
                {entry.contactName}
              </Link>
            ) : (
              entry.contactName
            )}
          </>
        ) : null}
      </p>
      {entry.note ? <p className={system ? "text-ink/80" : ""}>{entry.note}</p> : null}
      {entry.struckPhone ? <p className="text-muted line-through">{entry.struckPhone}</p> : null}
      {entry.nextAt ? (
        <p className="font-medium text-sea">
          Nästa: {formatStamp(entry.nextAt)}
          {entry.nextNote ? ` · ${entry.nextNote}` : ""}
        </p>
      ) : null}
    </li>
  );
}
