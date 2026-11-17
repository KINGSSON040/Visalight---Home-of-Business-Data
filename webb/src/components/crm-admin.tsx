"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANIES } from "@/lib/catalog";
import { ROLE_LABEL, STAFF, formatStamp, isOppClosed, useCrmStore } from "@/lib/crm-store";
import { kundHref } from "@/components/crm-ui";

export function AdminView() {
  const store = useCrmStore();
  const [filter, setFilter] = useState("");

  if (!store.ready) return <p className="text-sm text-muted">Hämtar.</p>;
  if (!store.isAdmin) {
    return (
      <section className="rounded-3xl border-2 border-rust bg-white p-6">
        <h1 className="text-3xl tracking-tight">Bara för admin</h1>
        <p className="mt-2 text-sm text-muted">Byt till Anna Berg i listan uppe till höger för att se loggen och återställa arkiverade poster.</p>
      </section>
    );
  }

  const struckPeople = store.contacts.filter((item) => item.struck);
  const closedOpps = store.opps.filter((item) => isOppClosed(item.stage));
  const archivedSegments = store.segments.filter((item) => item.archived);
  const archivedLists = store.callLists.filter((item) => item.archived);
  const archivedTemplates = store.templates.filter((item) => item.archived);
  const archivedViews = store.views.filter((item) => item.archived);
  const phones = store.struckPhones;
  const audit = [...store.audit]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((item) => !filter.trim() || `${item.action} ${item.target} ${item.userName} ${item.before} ${item.after}`.toLowerCase().includes(filter.trim().toLowerCase()));
  const nameOf = (orgNr: string) => COMPANIES.find((item) => item.orgNr === orgNr)?.name ?? orgNr;

  return (
    <section>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sea">Admin</p>
      <h1 className="mt-1 text-3xl tracking-tight">Logg och återställning</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Allt som stryks eller arkiveras ligger kvar här och kan återställas av admin. Känsliga ändringar skrivs till en logg som inte kan raderas.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAFF.map((person) => (
          <div key={person.id} className="rounded-2xl bg-foam p-4">
            <p className="font-semibold">{person.name}</p>
            <p className="text-sm text-muted">
              {ROLE_LABEL[person.role]} ·{" "}
              {store.claims.filter((item) => item.userId === person.id).length} kunder ·{" "}
              {store.opps.filter((item) => item.ownerId === person.id && !isOppClosed(item.stage)).length} öppna möjligheter
            </p>
          </div>
        ))}
        <div className="rounded-2xl bg-amber-soft p-4 ring-1 ring-amber">
          <p className="font-semibold">Behörigheter</p>
          <p className="text-sm">Säljare kan inte radera eller återställa. Admin kan återställa, tilldela och ta bort spärrar.</p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Strukna och arkiverade</h2>
          <Group title={`Personer · ${struckPeople.length}`} empty="Inga strukna personer.">
            {struckPeople.map((item) => (
              <Row key={item.id} label={`${item.firstName} ${item.lastName}`} sub={`${nameOf(item.orgNr)} · struken ${formatStamp(item.struckAt)} av ${item.struckBy}`} onRestore={() => store.reactivateContact(item.id)} />
            ))}
          </Group>
          <Group title={`Nummer · ${phones.length}`} empty="Inga strukna nummer.">
            {phones.map((item) => (
              <Row key={`${item.orgNr}-${item.value}`} label={item.value} sub={nameOf(item.orgNr)} onRestore={() => store.restorePhone(item.orgNr, item.value)} />
            ))}
          </Group>
          <Group title={`Segment · ${archivedSegments.length}`} empty="Inga arkiverade segment.">
            {archivedSegments.map((item) => (
              <Row key={item.id} label={item.name} sub={`Skapat av ${item.createdBy}`} onRestore={() => store.setSegmentArchived(item.id, false)} />
            ))}
          </Group>
          <Group title={`Ringlistor · ${archivedLists.length}`} empty="Inga arkiverade ringlistor.">
            {archivedLists.map((item) => (
              <Row key={item.id} label={item.name} sub={`${item.orgNrs.length} bolag`} onRestore={() => store.setCallListArchived(item.id, false)} />
            ))}
          </Group>
          <Group title={`Mallar · ${archivedTemplates.length}`} empty="Inga arkiverade mallar.">
            {archivedTemplates.map((item) => (
              <Row key={item.id} label={item.name} sub={item.kind} onRestore={() => store.setTemplateArchived(item.id, false)} />
            ))}
          </Group>
          <Group title={`Vyer · ${archivedViews.length}`} empty="Inga arkiverade vyer.">
            {archivedViews.map((item) => (
              <Row key={item.id} label={item.name} sub={item.scope} onRestore={() => store.setViewArchived(item.id, false)} />
            ))}
          </Group>
          <Group title={`Stängda möjligheter · ${closedOpps.length}`} empty="Inga stängda möjligheter.">
            {closedOpps.map((item) => (
              <Row
                key={item.id}
                label={`${item.title} · ${item.stage === "signerad" ? "vunnen" : "förlorad"}`}
                sub={`${item.companyName} · ${item.closedBy} · ${formatStamp(item.closedAt)}`}
                onRestore={() => store.moveOpportunity(item.id, "forhandling", { note: "Öppnad igen av admin" })}
                label2="Öppna igen"
              />
            ))}
          </Group>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Granskningslogg · {store.audit.length}</h2>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrera" aria-label="Filtrera loggen" className="h-10 rounded-xl border border-line bg-paper px-3 text-sm" />
          </div>
          {audit.length === 0 ? <p className="mt-3 text-sm text-muted">Inga loggade ändringar ännu.</p> : null}
          <ul className="mt-3 max-h-[36rem] space-y-1.5 overflow-auto">
            {audit.slice(0, 100).map((item) => (
              <li key={item.id} className="rounded-xl bg-paper px-3 py-2 text-sm">
                <p className="font-semibold">
                  {item.action}
                  {item.orgNr ? (
                    <>
                      {" · "}
                      <Link href={kundHref(item.orgNr)} className="text-sea hover:underline">
                        {nameOf(item.orgNr)}
                      </Link>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-muted">
                  {formatStamp(item.at)} · {item.userName} ({ROLE_LABEL[item.role]})
                  {item.target && item.target !== nameOf(item.orgNr) ? ` · ${item.target}` : ""}
                  {item.before || item.after ? ` · ${item.before || "–"} → ${item.after || "–"}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

function Group({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">{title}</h3>
      {items.filter(Boolean).length === 0 ? <p className="mt-1 text-sm text-muted">{empty}</p> : <ul className="mt-1.5 space-y-1.5">{children}</ul>}
    </div>
  );
}

function Row({ label, sub, onRestore, label2 = "Återställ" }: { label: string; sub: string; onRestore: () => void; label2?: string }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
      <button type="button" onClick={onRestore} className="btn-fade-green h-9 shrink-0 rounded-full bg-green px-4 text-xs font-semibold text-white">
        {label2}
      </button>
    </li>
  );
}
