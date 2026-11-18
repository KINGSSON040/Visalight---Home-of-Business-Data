"use client";

import { useState, type FormEvent } from "react";
import { suggestBranscher } from "@/lib/catalog";

type Errors = Record<string, string>;

function dotted(sni: string) {
  return sni.length === 5 ? `${sni.slice(0, 2)}.${sni.slice(2)}` : sni;
}

export function SampleForm() {
  const [industry, setIndustry] = useState("");
  const [sni, setSni] = useState("");
  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [note, setNote] = useState("");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);

  const suggestions = suggestBranscher(industry).slice(0, 8);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (company.trim().length < 2) next.company = "Ange företaget.";
    if (firstName.trim().length < 2) next.firstName = "Ange förnamn.";
    if (lastName.trim().length < 2) next.lastName = "Ange efternamn.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Ange en e-postadress.";
    if (industry.trim().length < 2 && !sni) next.industry = "Ange bransch med namn eller SNI-kod.";
    setErrors(next);
    setNote("");
    setCsv("");
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    try {
      const response = await fetch("/smakprov/skicka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          industry: industry.trim(),
          sni,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        errors?: Errors;
        note?: string;
        csv?: string;
        mailed?: boolean;
        missing?: string[];
        mailError?: string;
      };
      if (data.errors) {
        setErrors(data.errors);
        return;
      }
      if (!data.ok) {
        setNote(data.note || "Ingen fil skapades.");
        return;
      }
      setCsv(data.csv ?? "");
      if (data.mailed) {
        setNote(`${data.note} Filen är skickad till ${email.trim()}.`);
      } else if (data.missing?.length) {
        setNote(`${data.note} Inget mail skickades. Nyckeln för utskick saknas.`);
      } else if (data.mailError) {
        setNote(`${data.note} ${data.mailError}`);
      } else {
        setNote(data.note || "");
      }
    } catch {
      setNote("Det gick inte att skapa filen.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "visalight-smakprov.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 max-w-xl rounded-3xl border border-line bg-white p-5 sm:p-6">
      <label className="relative block text-sm">
        <span className="mb-1 block font-medium">Bransch</span>
        <input
          value={industry}
          onChange={(event) => {
            setIndustry(event.target.value);
            setSni("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Namn eller SNI, till exempel frisör eller 96.210"
          className="field-box h-11 w-full rounded-xl px-3"
          aria-invalid={Boolean(errors.industry)}
          autoComplete="off"
        />
        {errors.industry ? <span className="mt-1 block text-sm text-rust">{errors.industry}</span> : null}
        {open && suggestions.length > 0 ? (
          <ul className="suggest-list absolute z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl p-1">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full rounded-xl px-2.5 py-1.5 text-left text-xs leading-4 font-medium"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setIndustry(item.title);
                    setSni(item.apply.sni ?? "");
                    setOpen(false);
                  }}
                >
                  {item.title}, SNI {dotted(item.apply.sni ?? "")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Förnamn" value={firstName} onChange={setFirstName} error={errors.firstName} autoComplete="given-name" />
        <Field label="Efternamn" value={lastName} onChange={setLastName} error={errors.lastName} autoComplete="family-name" />
      </div>
      <div className="mt-4">
        <Field label="Företag" value={company} onChange={setCompany} error={errors.company} autoComplete="organization" />
      </div>
      <div className="mt-4">
        <Field label="E-post" value={email} onChange={setEmail} error={errors.email} type="email" autoComplete="email" />
      </div>
      <button type="submit" disabled={busy} className="btn-neon mt-5 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60">
        {busy ? "Skapar filen" : "Skicka smakprov"}
      </button>
      {note ? <p className="mt-4 text-sm leading-6 text-ink">{note}</p> : null}
      {csv ? (
        <button type="button" onClick={download} className="mt-3 text-sm font-semibold text-ink underline-offset-4 hover:underline">
          Ladda ner filen
        </button>
      ) : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="field-box h-11 w-full rounded-xl px-3"
        aria-invalid={Boolean(error)}
        required
      />
      {error ? <span className="mt-1 block text-sm text-rust">{error}</span> : null}
    </label>
  );
}
