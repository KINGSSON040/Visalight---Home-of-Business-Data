"use client";

import { useState, type FormEvent } from "react";

export type ContactKind = "meddelande" | "tid" | "mote";

const STORAGE_KEY = "visalight-kontakt";

const KIND_LABEL: Record<ContactKind, string> = {
  meddelande: "Skriv ett meddelande",
  tid: "Boka tid",
  mote: "Boka möte",
};

export function DemoForm({ kind = "tid" }: { kind?: ContactKind }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Fil till CRM");
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Ange ert namn.";
    if (company.trim().length < 2) next.company = "Ange företaget.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Ange en e-postadress.";
    if (kind === "meddelande" && message.trim().length < 2) next.message = "Skriv meddelandet.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const note = {
      kind,
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
      when: when.trim(),
      savedAt: new Date().toISOString(),
    };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const previous = raw ? (JSON.parse(raw) as unknown[]) : [];
      const list = Array.isArray(previous) ? previous : [];
      list.push(note);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      setErrors({ message: "Det gick inte att spara i den här webbläsaren." });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.14em] text-sea">Sparat här</p>
        <h2 className="mt-2 text-3xl tracking-tight">{KIND_LABEL[kind]}</h2>
        <p className="mt-3 leading-7 text-muted">
          {name.trim()} på {company.trim()}. Sparat i den här webbläsaren. Inget är skickat, och det går inte iväg förrän en inkorg finns.
          {when.trim() ? ` Önskad tid: ${when.trim()}.` : ""}
        </p>
        <button type="button" className="mt-5 text-sm font-medium text-sea" onClick={() => setDone(false)}>
          Ändra uppgifterna
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Namn" value={name} onChange={setName} error={errors.name} />
        <Field label="Företag" value={company} onChange={setCompany} error={errors.company} />
        <Field label="E-post" value={email} onChange={setEmail} error={errors.email} type="email" />
        {kind === "meddelande" ? (
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Meddelande</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-line bg-paper px-3 py-3 text-base"
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message ? <span className="mt-1 block text-rust">{errors.message}</span> : null}
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vad det gäller</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
            >
              <option>Fil till CRM</option>
              <option>Återkommande uttag</option>
              <option>Koppling mot affärssystem</option>
            </select>
          </label>
        )}
        {kind === "meddelande" ? null : (
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Önskad tid</span>
            <input
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              placeholder="Till exempel tisdag efter klockan 10"
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base placeholder:text-ink/40"
            />
          </label>
        )}
      </div>
      <button type="submit" className="btn-fade-amber mt-4 h-12 rounded-full bg-amber px-5 font-medium text-ink">
        {KIND_LABEL[kind]}
      </button>
      <p className="mt-3 text-sm leading-6 text-muted">Sparat i den här webbläsaren. Inget skickas förrän en inkorg finns.</p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
        aria-invalid={Boolean(error)}
      />
      {error ? <span className="mt-1 block text-rust">{error}</span> : null}
    </label>
  );
}
