"use client";

import { useState } from "react";
import { Field, Panel } from "@/components/crm-ui";
import type { Company } from "@/lib/catalog";
import {
  OUTCOMES,
  formatStamp,
  laterTodayLocal,
  localInputToIso,
  nextWeekLocal,
  outcomeInfo,
  outcomeLabel,
  tomorrowMorningLocal,
  useCrmStore,
  type Activity,
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
  const [error, setError] = useState("");

  const people = store.contacts.filter((item) => item.orgNr === company.orgNr && !item.struck);
  const contactPhones = people.flatMap((item) =>
    item.phones.filter((entry) => !entry.struck).map((entry) => ({ value: entry.value, contactId: item.id, phoneId: entry.id })),
  );
  const registerPhones = [...new Set([...company.phones, ...company.signatoryPhones])]
    .filter((value) => !isStruck(store.struckPhones, company.orgNr, value))
    .map((value) => ({ value, contactId: "", phoneId: "" }));
  const numbers = [...registerPhones, ...contactPhones];
  const info = outcome ? outcomeInfo(outcome) : null;

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
    if (outcome === "inaktivt-nummer" && !phone) {
      setError("Välj numret som är inaktivt. Det stryks och ligger kvar.");
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
    if (outcome === "inaktivt-nummer" && chosen) {
      store.strikePhone(company.orgNr, chosen.value, chosen.contactId || undefined, chosen.phoneId || undefined);
    }
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
      nextAt: localInputToIso(nextAt),
      nextNote: nextNote.trim(),
      struckPhone: outcome === "inaktivt-nummer" ? phone : "",
      contactName: person ? `${person.firstName} ${person.lastName}` : "",
    });
    const saved = outcome;
    reset();
    focus?.onSaved(saved);
  }

  return (
    <Panel
      id="logga"
      title={focus ? "Hur gick samtalet?" : "Logga samtal eller anteckning"}
      intro={focus ? "Välj utfall, skriv gärna en rad och sätt tid för nästa försök. Då kommer nästa bolag." : undefined}
    >
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
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  setOutcome(item.id);
                  setError("");
                  if (item.id === "inaktivt-nummer" && numbers.length === 1) setPhone(numbers[0].value);
                }}
                className={`rounded-2xl border-2 px-3 text-sm font-semibold ${focus ? "h-14" : "h-12"} ${
                  pressed ? TONE_ON[item.tone] : TONE_OFF[item.tone]
                }`}
              >
                {item.short}
              </button>
            );
          })}
        </div>

        {people.length ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vem pratade du med? (valfritt)</span>
            <select
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3"
            >
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

        {outcome === "inaktivt-nummer" ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vilket nummer är inaktivt? Det stryks direkt och finns kvar.</span>
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

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Anteckning</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={focus ? 4 : 3}
            placeholder="Vad sades? Vad ska du komma ihåg?"
            className="w-full rounded-xl border border-line bg-paper px-3 py-2"
          />
        </label>

        <div className="rounded-2xl bg-foam p-3">
          <p className="text-sm font-medium">Nästa aktivitet{info && outcome === "ring-igen" ? " (krävs)" : ""}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: "Om 2 timmar", value: () => laterTodayLocal(2) },
              { label: "Imorgon kl. 09", value: tomorrowMorningLocal },
              { label: "Om en vecka", value: nextWeekLocal },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setNextAt(chip.value())}
                className="h-9 rounded-full border border-sea/40 bg-white px-3 text-sm font-medium text-sea"
              >
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
    </Panel>
  );
}

export function History({ entries, limit }: { entries: Activity[]; limit?: number }) {
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const shown = limit ? sorted.slice(0, limit) : sorted;
  return (
    <Panel title="Aktivitetslogg" intro="Allt som har gjorts på bolaget, nyast först. Loggen kan inte raderas.">
      {shown.length === 0 ? <p className="mt-3 text-sm text-muted">Inget loggat på bolaget ännu.</p> : null}
      <ol className="mt-3 space-y-2">
        {shown.map((entry) => (
          <HistoryRow key={entry.id} entry={entry} />
        ))}
      </ol>
      {limit && sorted.length > limit ? <p className="mt-2 text-xs text-muted">Visar de {limit} senaste av {sorted.length}.</p> : null}
    </Panel>
  );
}

export function HistoryRow({ entry }: { entry: Activity }) {
  const system = entry.outcome === "agare-satt" || entry.outcome === "agare-slappt";
  const tone = outcomeInfo(entry.outcome)?.tone ?? "neutral";
  const bar: Record<OutcomeTone, string> = {
    good: "border-green",
    warm: "border-amber",
    neutral: "border-sea",
    bad: "border-rust",
  };
  return (
    <li className={`rounded-2xl border-l-4 bg-paper px-3 py-2.5 text-sm leading-6 ${system ? "border-line text-muted" : bar[tone]}`}>
      <p className="text-xs text-muted">
        {formatStamp(entry.at)} · {entry.userName}
      </p>
      <p className={system ? "" : "font-medium"}>
        {outcomeLabel(entry.outcome)}
        {entry.contactName ? ` · ${entry.contactName}` : ""}
      </p>
      {entry.note ? <p>{entry.note}</p> : null}
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
