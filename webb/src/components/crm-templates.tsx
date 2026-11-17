"use client";

import { useState } from "react";
import { Field, Panel } from "@/components/crm-ui";
import { formatStamp, useCrmStore, type Template } from "@/lib/crm-store";

export function TemplatesView() {
  const store = useCrmStore();
  const [editing, setEditing] = useState<string>("");
  const [kind, setKind] = useState<Template["kind"]>("mejl");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const list = store.templates.filter((item) => showArchived || !item.archived);

  function edit(item?: Template) {
    setEditing(item?.id ?? "ny");
    setKind(item?.kind ?? "mejl");
    setName(item?.name ?? "");
    setSubject(item?.subject ?? "");
    setBody(item?.body ?? "");
    setError("");
  }

  function save() {
    if (name.trim().length < 2) return setError("Döp mallen.");
    if (!body.trim()) return setError("Skriv texten.");
    store.saveTemplate({ id: editing === "ny" ? undefined : editing, kind, name: name.trim(), subject: subject.trim(), body });
    setEditing("");
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Mejl- och SMS-mallar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Mallar används i kundkortet för att skapa utkast. Variabler: <code>{"{{foretag}}"}</code>, <code>{"{{fornamn}}"}</code> och <code>{"{{saljare}}"}</code>. Inget skickas från VisaLight. Mallar arkiveras, de raderas inte.
          </p>
        </div>
        <button type="button" onClick={() => edit()} className="btn-fade-amber h-11 rounded-full bg-amber px-5 text-sm font-semibold text-ink">
          Ny mall
        </button>
      </div>

      {editing ? (
        <Panel title={editing === "ny" ? "Ny mall" : "Ändra mall"}>
          <form
            className="mt-3 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <div className="flex gap-2" role="group" aria-label="Typ">
              {(["mejl", "sms"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={kind === item}
                  disabled={editing !== "ny"}
                  onClick={() => setKind(item)}
                  className={`h-10 rounded-full border-2 px-5 text-sm font-semibold disabled:opacity-60 ${kind === item ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
                >
                  {item === "mejl" ? "Mejl" : "SMS"}
                </button>
              ))}
            </div>
            <Field label="Namn" value={name} onChange={setName} />
            {kind === "mejl" ? <Field label="Ämne" value={subject} onChange={setSubject} /> : null}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Text</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} className="w-full rounded-xl border border-line bg-paper px-3 py-2" />
            </label>
            {error ? <p className="text-sm font-semibold text-rust">{error}</p> : null}
            <div className="flex gap-2">
              <button type="submit" className="btn-fade-green h-12 flex-1 rounded-full bg-green font-semibold text-white">
                Spara mall
              </button>
              <button type="button" onClick={() => setEditing("")} className="h-12 rounded-full border border-line px-5 text-sm font-medium">
                Avbryt
              </button>
            </div>
          </form>
        </Panel>
      ) : null}

      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {list.map((item) => (
          <li key={item.id} className={`rounded-3xl border border-line bg-white p-5 shadow-sm ${item.archived ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-xs text-muted">
                  {item.kind === "mejl" ? "Mejl" : "SMS"} · {item.createdBy} · {formatStamp(item.createdAt)}
                  {item.archived ? " · arkiverad" : ""}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.kind === "mejl" ? "bg-sea text-white" : "bg-amber text-ink"}`}>{item.kind === "mejl" ? "Mejl" : "SMS"}</span>
            </div>
            {item.subject ? <p className="mt-2 text-sm font-medium">Ämne: {item.subject}</p> : null}
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">{item.body}</p>
            <div className="mt-3 flex gap-2 text-sm">
              <button type="button" onClick={() => edit(item)} className="h-10 rounded-full border border-line px-4 font-medium">
                Ändra
              </button>
              {!item.archived || store.isAdmin ? (
                <button type="button" onClick={() => store.setTemplateArchived(item.id, !item.archived)} className="h-10 px-2 text-muted underline">
                  {item.archived ? "Återställ (admin)" : "Arkivera"}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {store.templates.some((item) => item.archived) ? (
        <button type="button" className="mt-3 text-sm font-semibold text-sea" onClick={() => setShowArchived((current) => !current)}>
          {showArchived ? "Dölj arkiverade" : "Visa arkiverade"}
        </button>
      ) : null}
    </section>
  );
}
