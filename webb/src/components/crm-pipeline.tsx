"use client";

import { useState } from "react";
import Link from "next/link";
import { CloseDialog, OppFlagBadges, OppForm, TempChip } from "@/components/crm-opps";
import { kundHref } from "@/components/crm-ui";
import { COMPANIES } from "@/lib/catalog";
import {
  OPP_STAGES,
  STAFF,
  TEMPERATURES,
  formatMoney,
  formatStamp,
  isOppClosed,
  oppFlags,
  oppStageInfo,
  useCrmStore,
  type OppStageId,
  type Opportunity,
  type Temperature,
} from "@/lib/crm-store";

type OwnerFilter = "alla" | "mina" | string;

export function PipelineView() {
  const store = useCrmStore();
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [owner, setOwner] = useState<OwnerFilter>("alla");
  const [temp, setTemp] = useState<Temperature | "alla">("alla");
  const [stageFilter, setStageFilter] = useState<OppStageId | "alla" | "oppna">("oppna");
  const [attention, setAttention] = useState(false);
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [companyQuery, setCompanyQuery] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [pending, setPending] = useState<{ id: string; to: OppStageId } | null>(null);
  const [dragId, setDragId] = useState("");
  const [overStage, setOverStage] = useState("");

  const visible = store.opps.filter((opp) => {
    if (owner === "mina" && opp.ownerId !== store.userId) return false;
    if (owner !== "alla" && owner !== "mina" && opp.ownerId !== owner) return false;
    if (temp !== "alla" && opp.temperature !== temp) return false;
    if (attention) {
      const flags = oppFlags(opp, store.now, store.staleDays);
      if (!(flags.overdue || flags.stale || flags.noFollowUp)) return false;
    }
    const needle = text.trim().toLocaleLowerCase("sv");
    if (needle && !`${opp.title} ${opp.companyName} ${opp.contactName}`.toLocaleLowerCase("sv").includes(needle)) return false;
    return true;
  });

  const open = visible.filter((opp) => !isOppClosed(opp.stage));
  const openSum = open.reduce((sum, opp) => sum + opp.value, 0);
  const hot = open.filter((opp) => opp.temperature === "varm");
  const alerts = store.opportunityAlerts().length;
  const pendingOpp = pending ? store.opps.find((item) => item.id === pending.id) : undefined;

  function requestMove(opp: Opportunity, to: OppStageId) {
    if (opp.stage === to) return;
    if (isOppClosed(opp.stage) && !store.isAdmin) return;
    if (isOppClosed(to)) setPending({ id: opp.id, to });
    else store.moveOpportunity(opp.id, to);
  }

  const matches = companyQuery.trim()
    ? COMPANIES.filter((item) => item.name.toLocaleLowerCase("sv").includes(companyQuery.trim().toLocaleLowerCase("sv"))).slice(0, 6)
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Pipeline</p>
          <h1 className="mt-1 text-3xl tracking-tight">Möjligheter</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Skarpa leads från första kontakt till signering. Varje möjlighet har ett nästa steg med datum. Dra korten mellan faserna eller välj fas i listan. Inget raderas, vunna och förlorade stängs.
          </p>
        </div>
        <button type="button" onClick={() => setCreating((current) => !current)} className="h-11 rounded-full bg-[#d6007a] px-5 text-sm font-semibold text-white hover:bg-[#b80068]">
          {creating ? "Stäng" : "Ny möjlighet"}
        </button>
      </div>

      {creating ? (
        <section className="mt-4 rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Vilket bolag gäller det?</h2>
          <input
            value={companyQuery}
            onChange={(event) => {
              setCompanyQuery(event.target.value);
              setOrgNr("");
            }}
            placeholder="Börja skriva bolagsnamn"
            aria-label="Sök bolag"
            className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-3"
          />
          {!orgNr && matches.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {matches.map((item) => (
                <li key={item.orgNr}>
                  <button
                    type="button"
                    onClick={() => {
                      setOrgNr(item.orgNr);
                      setCompanyQuery(item.name);
                    }}
                    className="h-10 rounded-full border border-sea/40 bg-foam px-4 text-sm font-semibold text-sea"
                  >
                    {item.name} · {item.city}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {orgNr ? (
            <OppForm
              orgNr={orgNr}
              defaults={{ title: companyQuery }}
              onCreated={() => {
                setCreating(false);
                setCompanyQuery("");
                setOrgNr("");
              }}
              onCancel={() => setCreating(false)}
            />
          ) : null}
        </section>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        <Stat label="Öppna möjligheter" value={String(open.length)} />
        <Stat label="Öppet värde" value={formatMoney(openSum)} />
        <Stat label="Varma leads" value={String(hot.length)} />
        <button
          type="button"
          onClick={() => setAttention((current) => !current)}
          aria-pressed={attention}
          className={`bg-white p-6 text-left hover:bg-[#fafaf9] ${attention ? "shadow-[inset_0_-2px_0_#d6007a]" : ""}`}
        >
          <span className="block text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-none tracking-tight tabular-nums">{alerts}</span>
          <span className="mt-3 block text-sm text-muted">Kräver uppföljning{attention ? " · filtrerat" : ""}</span>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-3">
        <div className="flex gap-1" role="group" aria-label="Vy">
          {(["kanban", "lista"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={`h-10 rounded-full border-2 px-5 text-sm font-semibold ${view === item ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
            >
              {item === "kanban" ? "Kanban" : "Lista"}
            </button>
          ))}
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Ägare</span>
          <select value={owner} onChange={(event) => setOwner(event.target.value)} className="h-10 rounded-xl border border-line bg-paper px-2">
            <option value="alla">Alla säljare</option>
            <option value="mina">Mina</option>
            {STAFF.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Temperatur</span>
          <select value={temp} onChange={(event) => setTemp(event.target.value as Temperature | "alla")} className="h-10 rounded-xl border border-line bg-paper px-2">
            <option value="alla">Alla</option>
            {TEMPERATURES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {view === "lista" ? (
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">Fas</span>
            <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as OppStageId | "alla" | "oppna")} className="h-10 rounded-xl border border-line bg-paper px-2">
              <option value="oppna">Alla öppna</option>
              <option value="alla">Alla inklusive stängda</option>
              {OPP_STAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="min-w-40 flex-1 text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Sök</span>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Titel, bolag eller person" className="h-10 w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-muted">Stillastående efter (dagar)</span>
          <input
            type="number"
            min={1}
            max={60}
            value={store.staleDays}
            onChange={(event) => store.setStaleDays(Number(event.target.value))}
            className="h-10 w-24 rounded-xl border border-line bg-paper px-3"
          />
        </label>
      </div>

      {view === "kanban" ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-4" aria-label="Pipeline">
          {OPP_STAGES.map((stage) => {
            const cards = visible.filter((opp) => opp.stage === stage.id).sort((a, b) => a.nextStepAt.localeCompare(b.nextStepAt));
            const sum = cards.reduce((total, opp) => total + opp.value, 0);
            return (
              <section
                key={stage.id}
                aria-label={stage.label}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverStage(stage.id);
                }}
                onDragLeave={() => setOverStage("")}
                onDrop={(event) => {
                  event.preventDefault();
                  const opp = store.opps.find((item) => item.id === (event.dataTransfer.getData("text/plain") || dragId));
                  setOverStage("");
                  setDragId("");
                  if (opp) requestMove(opp, stage.id);
                }}
                className={`w-72 shrink-0 rounded-2xl border bg-[#f6f5f3] p-2 ${overStage === stage.id ? "border-[#d6007a] ring-2 ring-[#d6007a]" : "border-line"}`}
              >
                <header className={`rounded-xl px-3 py-2 ${stage.head}`}>
                  <p className="font-semibold">
                    {stage.label} · {cards.length}
                  </p>
                  <p className="text-sm">{formatMoney(sum)}</p>
                </header>
                <ul className="mt-2 space-y-2">
                  {cards.length === 0 ? <li className="px-2 py-4 text-center text-sm text-muted">Släpp ett kort här</li> : null}
                  {cards.map((opp) => (
                    <KanbanCard
                      key={opp.id}
                      opp={opp}
                      dragging={dragId === opp.id}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", opp.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDragId(opp.id);
                      }}
                      onDragEnd={() => {
                        setDragId("");
                        setOverStage("");
                      }}
                      onMove={(to) => requestMove(opp, to)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ListTable
          opps={visible.filter((opp) => (stageFilter === "alla" ? true : stageFilter === "oppna" ? !isOppClosed(opp.stage) : opp.stage === stageFilter))}
          onMove={requestMove}
        />
      )}

      {pending && pendingOpp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md">
            <CloseDialog opp={pendingOpp} to={pending.to} onDone={() => setPending(null)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-6">
      <span className="block text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
      <span className="mt-3 block text-sm text-muted">{label}</span>
    </div>
  );
}

function MoveSelect({ opp, onMove }: { opp: Opportunity; onMove: (to: OppStageId) => void }) {
  const store = useCrmStore();
  return (
    <select
      aria-label={`Flytta ${opp.title} till fas`}
      value={opp.stage}
      disabled={isOppClosed(opp.stage) && !store.isAdmin}
      onChange={(event) => onMove(event.target.value as OppStageId)}
      className="h-8 w-full rounded-lg border border-line bg-white px-1.5 text-xs font-semibold disabled:opacity-60"
    >
      {OPP_STAGES.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function KanbanCard({
  opp,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  opp: Opportunity;
  dragging: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (to: OppStageId) => void;
}) {
  const store = useCrmStore();
  const closed = isOppClosed(opp.stage);
  const flags = oppFlags(opp, store.now, store.staleDays);
  return (
    <li
      draggable={!closed || store.isAdmin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-xl border bg-white p-3 text-sm shadow-sm active:cursor-grabbing ${dragging ? "opacity-40" : ""} ${
        flags.overdue ? "border-line shadow-[inset_3px_0_0_#d6007a]" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-5">{opp.title}</p>
        <TempChip temperature={opp.temperature} />
      </div>
      <p className="mt-0.5">
        <Link href={kundHref(opp.orgNr)} className="text-xs font-semibold text-sea hover:underline">
          {opp.companyName}
        </Link>
      </p>
      <p className="mt-1 font-bold">{formatMoney(opp.value)}</p>
      <p className="text-xs text-muted">
        Ägare {opp.ownerName}
        {opp.contactName ? ` · ${opp.contactName}` : ""}
      </p>
      {closed ? (
        <p className="mt-1 text-xs text-muted">
          Stängd {formatStamp(opp.closedAt)}
          {opp.lossReason ? ` · ${opp.lossReason}` : ""}
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-xs">
            <span className="font-semibold">Nästa:</span> {opp.nextStep} · {formatStamp(opp.nextStepAt)}
          </p>
          <p className="mt-1 flex flex-wrap gap-1">
            <OppFlagBadges opp={opp} />
          </p>
        </>
      )}
      <div className="mt-2">
        <MoveSelect opp={opp} onMove={onMove} />
      </div>
    </li>
  );
}

function ListTable({ opps, onMove }: { opps: Opportunity[]; onMove: (opp: Opportunity, to: OppStageId) => void }) {
  const sorted = [...opps].sort((a, b) => Number(isOppClosed(a.stage)) - Number(isOppClosed(b.stage)) || a.nextStepAt.localeCompare(b.nextStepAt));
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-foam text-xs uppercase tracking-[0.1em] text-muted">
          <tr>
            <th className="px-3 py-2.5">Möjlighet</th>
            <th className="px-3 py-2.5">Fas</th>
            <th className="px-3 py-2.5">Temp</th>
            <th className="px-3 py-2.5">Värde</th>
            <th className="px-3 py-2.5">Ägare</th>
            <th className="px-3 py-2.5">Nästa steg</th>
            <th className="px-3 py-2.5">Markeringar</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-muted">
                Inga möjligheter matchar filtret.
              </td>
            </tr>
          ) : null}
          {sorted.map((opp) => (
            <tr key={opp.id} className="border-t border-line align-top">
              <td className="px-3 py-3">
                <p className="font-semibold">{opp.title}</p>
                <Link href={kundHref(opp.orgNr)} className="text-xs font-semibold text-sea hover:underline">
                  {opp.companyName}
                </Link>
                {opp.contactName ? <span className="text-xs text-muted"> · {opp.contactName}</span> : null}
              </td>
              <td className="w-44 px-3 py-3">
                <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${oppStageInfo(opp.stage).head}`}>{oppStageInfo(opp.stage).label}</span>
                <MoveSelect opp={opp} onMove={(to) => onMove(opp, to)} />
              </td>
              <td className="px-3 py-3">
                <TempChip temperature={opp.temperature} />
              </td>
              <td className="px-3 py-3 font-semibold">{formatMoney(opp.value)}</td>
              <td className="px-3 py-3">{opp.ownerName}</td>
              <td className="px-3 py-3">
                {isOppClosed(opp.stage) ? (
                  <span className="text-muted">Stängd {formatStamp(opp.closedAt)}{opp.lossReason ? ` · ${opp.lossReason}` : ""}</span>
                ) : (
                  <>
                    {opp.nextStep}
                    <span className="block text-xs text-muted">{formatStamp(opp.nextStepAt)}</span>
                  </>
                )}
              </td>
              <td className="px-3 py-3">
                <span className="flex flex-wrap gap-1">
                  <OppFlagBadges opp={opp} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
