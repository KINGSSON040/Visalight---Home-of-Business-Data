"use client";

import { useState } from "react";
import { Panel } from "@/components/crm-ui";
import type { Company } from "@/lib/catalog";
import { useCrmStore } from "@/lib/crm-store";

export function fillTemplate(text: string, vars: { foretag: string; fornamn: string; saljare: string }): string {
  return text
    .replaceAll("{{foretag}}", vars.foretag)
    .replaceAll("{{fornamn}}", vars.fornamn || "där")
    .replaceAll("{{saljare}}", vars.saljare);
}

export function TemplateDrafts({ company }: { company: Company }) {
  const store = useCrmStore();
  const [kind, setKind] = useState<"mejl" | "sms">("mejl");
  const [templateId, setTemplateId] = useState("");
  const [contactId, setContactId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const channel = kind === "mejl" ? "mail" : "sms";
  const blocked = store.blockedChannels(company.orgNr).includes(channel);
  const templates = store.templates.filter((item) => !item.archived && item.kind === kind);
  const people = store.contacts.filter((item) => item.orgNr === company.orgNr && !item.struck);
  const person = people.find((item) => item.id === contactId);
  const to =
    kind === "mejl"
      ? person?.emails.find((item) => !item.struck)?.value ?? company.emails[0] ?? ""
      : person?.phones.find((item) => !item.struck)?.value ?? company.phones[0] ?? "";

  function pick(id: string, nextContact = contactId) {
    setTemplateId(id);
    const template = store.templates.find((item) => item.id === id);
    const who = people.find((item) => item.id === nextContact);
    if (!template) {
      setSubject("");
      setBody("");
      return;
    }
    const vars = { foretag: company.name, fornamn: who?.firstName ?? "", saljare: store.currentUser.name };
    setSubject(fillTemplate(template.subject, vars));
    setBody(fillTemplate(template.body, vars));
    setMessage("");
  }

  function save() {
    if (!body.trim()) return setMessage("Välj en mall eller skriv text först.");
    store.saveDraft({ orgNr: company.orgNr, contactId, kind, to, subject, body });
    setMessage("Utkastet är sparat i tidslinjen. Inget har skickats.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(kind === "mejl" ? `${subject}\n\n${body}` : body);
      setMessage("Texten är kopierad. Klistra in den i din egen mejl- eller SMS-app.");
    } catch {
      setMessage("Kunde inte kopiera automatiskt. Markera texten och kopiera själv.");
    }
  }

  function logSent() {
    store.addActivity({
      id: crypto.randomUUID(),
      orgNr: company.orgNr,
      companyName: company.name,
      at: new Date().toISOString(),
      userId: store.currentUser.id,
      userName: store.currentUser.name,
      outcome: kind === "mejl" ? "mailat" : "sms",
      note: subject ? `${subject}` : body.slice(0, 80),
      nextAt: "",
      nextNote: "",
      struckPhone: "",
      contactName: person ? `${person.firstName} ${person.lastName}` : "",
      contactId: person?.id ?? "",
    });
    setMessage("Loggat som skickat i tidslinjen.");
  }

  return (
    <Panel
      id="utkast"
      title="Mejl- och SMS-utkast"
      intro="Välj en mall, justera och kopiera. VisaLight skickar ingenting själv. Du loggar bara att du har gjort det."
    >
      <div className="mt-3 flex gap-2" role="group" aria-label="Kanal">
        {(["mejl", "sms"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={kind === item}
            onClick={() => {
              setKind(item);
              setTemplateId("");
              setSubject("");
              setBody("");
              setMessage("");
            }}
            className={`h-10 rounded-full border-2 px-5 text-sm font-semibold ${kind === item ? "border-sea bg-sea text-white" : "border-line bg-white"}`}
          >
            {item === "mejl" ? "Mejl" : "SMS"}
          </button>
        ))}
      </div>
      {blocked ? (
        <p className="mt-3 rounded-2xl border-2 border-rust bg-rust/10 px-3 py-2 text-sm font-semibold">
          Kanalen är spärrad på bolaget. Utkast går inte att spara eller logga.
        </p>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Mall</span>
          <select value={templateId} onChange={(event) => pick(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
            <option value="">Välj mall</option>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Till</span>
          <select
            value={contactId}
            onChange={(event) => {
              setContactId(event.target.value);
              if (templateId) pick(templateId, event.target.value);
            }}
            className="h-12 w-full rounded-xl border border-line bg-paper px-3"
          >
            <option value="">Bolaget ({to || "ingen adress"})</option>
            {people.map((item) => (
              <option key={item.id} value={item.id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        </label>
      </div>
      {kind === "mejl" ? (
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-medium">Ämne</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3" />
        </label>
      ) : null}
      <label className="mt-3 block text-sm">
        <span className="mb-1.5 block font-medium">Text</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={7} className="w-full rounded-xl border border-line bg-paper px-3 py-2" />
      </label>
      <p className="mt-1 text-xs text-muted">Mottagare: {to || "ingen"}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copy} disabled={!body} className="btn-fade-sea h-11 rounded-full bg-sea px-5 text-sm font-semibold text-white disabled:opacity-40">
          Kopiera text
        </button>
        <button type="button" onClick={save} disabled={blocked} className="btn-fade-amber h-11 rounded-full bg-amber px-5 text-sm font-semibold text-ink disabled:opacity-40">
          Spara utkast
        </button>
        <button type="button" onClick={logSent} disabled={blocked || !body} className="h-11 rounded-full border border-line bg-white px-5 text-sm font-medium disabled:opacity-40">
          Logga som skickat
        </button>
      </div>
      {message ? (
        <p role="status" className="mt-2 text-sm font-medium text-green">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
