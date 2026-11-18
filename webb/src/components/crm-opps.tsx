"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, Panel, kundHref } from "@/components/crm-ui";
import {
  LOSS_REASONS,
  OPP_SOURCES,
  OPP_STAGES,
  STAFF,
  TEMPERATURES,
  formatMoney,
  formatStamp,
  isOppClosed,
  localInputToIso,
  oppFlags,
  oppStageInfo,
  tomorrowMorningLocal,
  useCrmStore,
  type OppStageId,
  type Opportunity,
  type Temperature,
} from "@/lib/crm-store";

export function TempChip({ temperature }: { temperature: Temperature }) {
  const info = TEMPERATURES.find((item) => item.id === temperature) ?? TEMPERATURES[1];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${info.chip}`}>{info.label}</span>;
}

export function OppFlagBadges({ opp }: { opp: Opportunity }) {
  const store = useCrmStore();
  const flags = oppFlags(opp, store.now, store.staleDays);
  return (
    <>
      {flags.overdue ? (
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#d6007a] ring-1 ring-inset ring-[#d6007a]/40">Nästa steg förfallet</span>
      ) : null}
      {flags.stale ? (
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink ring-1 ring-inset ring-line">Stillastående {store.staleDays}+ dagar</span>
      ) : null}
      {flags.noFollowUp && !flags.overdue ? (
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink ring-1 ring-inset ring-line">Ingen uppföljning inom {store.staleDays} dagar</span>
      ) : null}
    </>
  );
}

export function OppForm({
  orgNr,
  defaults,
  onCreated,
  onCancel,
}: {
  orgNr: string;
  defaults?: { title?: string; source?: string; nextStep?: string; nextStepAt?: string; contactId?: string };
  onCreated?: (id: string) => void;
  onCancel?: () => void;
}) {
  const store = useCrmStore();
  const people = store.contacts.filter((item) => item.orgNr === orgNr && !item.struck);
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [value, setValue] = useState("");
  const [expectedClose, setExpectedClose] = useState("");
  const [temperature, setTemperature] = useState<Temperature>("varm");
  const [source, setSource] = useState(defaults?.source ?? OPP_SOURCES[0]);
  const [nextStep, setNextStep] = useState(defaults?.nextStep ?? "");
  const [nextStepAt, setNextStepAt] = useState(defaults?.nextStepAt || tomorrowMorningLocal());
  const [contactId, setContactId] = useState(defaults?.contactId ?? "");
  const [ownerId, setOwnerId] = useState<string>(store.userId);
  const [error, setError] = useState("");

  function create() {
    const amount = Number(value.replace(/\s/g, "").replace(",", "."));
    if (!title.trim()) return setError("Ge möjligheten en titel, till exempel ”Utdrag bagerier Skåne”.");
    if (!Number.isFinite(amount) || amount < 0 || value.trim() === "") return setError("Ange ett värde i kronor. Uppskatta om du är osäker.");
    if (!nextStep.trim()) return setError("Nästa steg är obligatoriskt, så att ingen möjlighet saknar uppföljning.");
    if (!nextStepAt) return setError("Ange datum och tid för nästa steg.");
    setError("");
    const id = store.addOpportunity({
      orgNr,
      contactId,
      title,
      value: amount,
      expectedClose,
      temperature,
      source,
      nextStep,
      nextStepAt: localInputToIso(nextStepAt),
      ownerId: ownerId as (typeof STAFF)[number]["id"],
    });
    if (id) onCreated?.(id);
  }

  return (
    <form
      className="mt-4 grid gap-3 rounded-2xl border border-line bg-foam p-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
      <div className="sm:col-span-2">
        <Field label="Titel" value={title} onChange={setTitle} placeholder="Till exempel Utdrag bagerier Skåne" />
      </div>
      <Field label="Värde (kr)" value={value} onChange={setValue} placeholder="25000" />
      <Field label="Förväntat avslut" type="date" value={expectedClose} onChange={setExpectedClose} />
      <div className="block text-sm">
        <span className="mb-1.5 block font-medium">Temperatur</span>
        <div className="flex gap-1.5" role="group" aria-label="Temperatur">
          {TEMPERATURES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={temperature === item.id}
              onClick={() => setTemperature(item.id)}
              className={`h-12 flex-1 rounded-xl border-2 text-sm font-semibold ${temperature === item.id ? `${item.chip} border-transparent ring-2 ring-sea` : "border-line bg-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Källa</span>
        <select value={source} onChange={(event) => setSource(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-3">
          {OPP_SOURCES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Kontaktperson</span>
        <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-white px-3">
          <option value="">Ingen vald</option>
          {people.map((item) => (
            <option key={item.id} value={item.id}>
              {item.firstName} {item.lastName}
              {item.role ? ` · ${item.role}` : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Ägare</span>
        <select value={ownerId} onChange={(event) => setOwnerId(event.target.value)} disabled={!store.isAdmin} className="h-12 w-full rounded-xl border border-line bg-white px-3 disabled:opacity-70">
          {STAFF.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <Field label="Nästa steg (obligatoriskt)" value={nextStep} onChange={setNextStep} placeholder="Till exempel skicka offert" />
      <Field label="Nästa steg, datum och tid" type="datetime-local" value={nextStepAt} onChange={setNextStepAt} />
      {error ? <p className="text-sm font-semibold text-rust sm:col-span-2">{error}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn-fade-green h-12 flex-1 rounded-full bg-green font-semibold text-white">
          Skapa möjlighet
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="h-12 rounded-full border border-line bg-white px-5 text-sm font-medium">
            Avbryt
          </button>
        ) : null}
      </div>
    </form>
  );
}

/** Dialog för att stänga en möjlighet som vunnen eller förlorad. */
export function CloseDialog({ opp, to, onDone }: { opp: Opportunity; to: OppStageId; onDone: () => void }) {
  const store = useCrmStore();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const lost = to === "forlorad";
  return (
    <div role="dialog" aria-label="Stäng möjlighet" className="rounded-2xl border-2 border-sea bg-white p-4 shadow-lg">
      <p className="font-semibold">
        {lost ? "Markera som förlorad" : "Markera som signerad (vunnen)"} · {opp.title}
      </p>
      <p className="mt-1 text-sm text-muted">Möjligheten stängs, den raderas inte. Historiken ligger kvar.</p>
      {lost ? (
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-medium">Förlustorsak (obligatoriskt)</span>
          <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
            <option value="">Välj orsak</option>
            {LOSS_REASONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="mt-3">
        <Field label="Kommentar (valfritt)" value={note} onChange={setNote} />
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-rust">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (lost && !reason) return setError("Välj en förlustorsak.");
            store.moveOpportunity(opp.id, to, { lossReason: reason, note: note.trim() });
            onDone();
          }}
          className={`h-11 flex-1 rounded-full font-semibold text-white ${lost ? "btn-fade-rust bg-rust" : "btn-fade-green bg-green"}`}
        >
          {lost ? "Stäng som förlorad" : "Stäng som vunnen"}
        </button>
        <button type="button" onClick={onDone} className="h-11 rounded-full border border-line px-5 text-sm font-medium">
          Avbryt
        </button>
      </div>
    </div>
  );
}

export function StageSelect({ opp, className = "" }: { opp: Opportunity; className?: string }) {
  const store = useCrmStore();
  const [pending, setPending] = useState<OppStageId | "">("");
  const locked = isOppClosed(opp.stage) && !store.isAdmin;
  return (
    <div className={className}>
      <select
        aria-label={`Fas för ${opp.title}`}
        value={opp.stage}
        disabled={locked}
        onChange={(event) => {
          const to = event.target.value as OppStageId;
          if (isOppClosed(to)) setPending(to);
          else store.moveOpportunity(opp.id, to);
        }}
        className="h-9 w-full rounded-lg border border-line bg-white px-2 text-sm font-semibold disabled:opacity-70"
      >
        {OPP_STAGES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {pending ? (
        <div className="mt-2">
          <CloseDialog opp={opp} to={pending} onDone={() => setPending("")} />
        </div>
      ) : null}
    </div>
  );
}

export function OpportunitiesPanel({ orgNr, defaultOpen = false }: { orgNr: string; defaultOpen?: boolean }) {
  const store = useCrmStore();
  const [open, setOpen] = useState(defaultOpen);
  const [showClosed, setShowClosed] = useState(false);
  const all = store.opps.filter((item) => item.orgNr === orgNr);
  const active = all.filter((item) => !isOppClosed(item.stage));
  const closed = all.filter((item) => isOppClosed(item.stage));
  const total = active.reduce((sum, item) => sum + item.value, 0);

  return (
    <Panel
      id="mojligheter"
      title={`Möjligheter · ${active.length}`}
      intro={
        active.length
          ? `Öppet värde ${formatMoney(total)}. Varje möjlighet följer pipelinen fram till signering och har alltid ett nästa steg.`
          : "En skarp möjlighet läggs i pipelinen så att den följs upp hela vägen till signering."
      }
      aside={
        <button type="button" onClick={() => setOpen((current) => !current)} className="btn-fade-amber h-10 shrink-0 rounded-full bg-amber px-4 text-sm font-semibold text-ink">
          {open ? "Stäng" : "Ny möjlighet"}
        </button>
      }
    >
      {open ? <OppForm orgNr={orgNr} onCreated={() => setOpen(false)} onCancel={() => setOpen(false)} /> : null}
      <ul className="mt-3 space-y-3">
        {active.length === 0 && !open ? <li className="text-sm text-muted">Inga öppna möjligheter.</li> : null}
        {active.map((opp) => (
          <OppItem key={opp.id} opp={opp} />
        ))}
      </ul>
      {closed.length ? (
        <div className="mt-3">
          <button type="button" className="text-sm font-medium text-sea" onClick={() => setShowClosed((current) => !current)}>
            {showClosed ? "Dölj stängda" : `Visa stängda (${closed.length})`}
          </button>
          {showClosed ? (
            <ul className="mt-2 space-y-3">
              {closed.map((opp) => (
                <OppItem key={opp.id} opp={opp} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Panel>
  );
}

function OppItem({ opp }: { opp: Opportunity }) {
  const store = useCrmStore();
  const [editing, setEditing] = useState(false);
  const [nextStep, setNextStep] = useState(opp.nextStep);
  const [nextStepAt, setNextStepAt] = useState(opp.nextStepAt ? new Date(opp.nextStepAt).toISOString().slice(0, 16) : "");
  const [temperature, setTemperature] = useState<Temperature>(opp.temperature);
  const [value, setValue] = useState(String(opp.value));
  const closed = isOppClosed(opp.stage);
  const info = oppStageInfo(opp.stage);

  return (
    <li className={`rounded-2xl border bg-white p-3 ${closed ? "border-line opacity-80" : "border-line shadow-sm"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{opp.title}</p>
          <p className="text-sm text-muted">
            {formatMoney(opp.value)} · ägare {opp.ownerName}
            {opp.contactName ? ` · ${opp.contactName}` : ""}
            {opp.expectedClose ? ` · avslut ${opp.expectedClose}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${info.head}`}>{info.label}</span>
          <TempChip temperature={opp.temperature} />
        </div>
      </div>
      {closed ? (
        <p className="mt-2 text-sm text-muted">
          Stängd {formatStamp(opp.closedAt)} av {opp.closedBy}
          {opp.lossReason ? ` · orsak: ${opp.lossReason}` : ""}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Nästa steg:</span> {opp.nextStep} · {formatStamp(opp.nextStepAt)}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-1.5">
            <OppFlagBadges opp={opp} />
          </p>
        </>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
        <StageSelect opp={opp} />
        {closed ? null : (
          <button type="button" onClick={() => setEditing((current) => !current)} className="h-9 rounded-full border border-line px-4 text-sm font-medium">
            {editing ? "Stäng" : "Uppdatera nästa steg"}
          </button>
        )}
      </div>
      {editing ? (
        <form
          className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            store.updateOpportunity(opp.id, {
              nextStep,
              nextStepAt: localInputToIso(nextStepAt),
              temperature,
              value: Number(value.replace(/\s/g, "")) || opp.value,
            });
            setEditing(false);
          }}
        >
          <Field label="Nästa steg" value={nextStep} onChange={setNextStep} />
          <Field label="Datum och tid" type="datetime-local" value={nextStepAt} onChange={setNextStepAt} />
          <Field label="Värde (kr)" value={value} onChange={setValue} />
          <div className="text-sm">
            <span className="mb-1.5 block font-medium">Temperatur</span>
            <div className="flex gap-1.5">
              {TEMPERATURES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={temperature === item.id}
                  onClick={() => setTemperature(item.id)}
                  className={`h-12 flex-1 rounded-xl border-2 text-sm font-semibold ${temperature === item.id ? `${item.chip} border-transparent ring-2 ring-sea` : "border-line bg-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-fade-sea h-11 rounded-full bg-sea font-semibold text-white sm:col-span-2">
            Spara
          </button>
        </form>
      ) : null}
      {opp.stageHistory.length > 1 ? (
        <details className="mt-2 text-xs text-muted">
          <summary className="cursor-pointer font-medium">Fashistorik ({opp.stageHistory.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {opp.stageHistory.map((item, index) => (
              <li key={`${item.at}-${index}`}>
                {formatStamp(item.at)} · {item.by}: {item.note === "Skapad" ? "skapad" : `${oppStageInfo(item.from).label} → ${oppStageInfo(item.to).label}`}
                {item.note && item.note !== "Skapad" ? ` · ${item.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="mt-1 text-xs text-muted">
        <Link href={kundHref(opp.orgNr)} className="text-sea hover:underline">
          {opp.companyName}
        </Link>
      </p>
    </li>
  );
}
