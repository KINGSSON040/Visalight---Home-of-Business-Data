"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const STORAGE_KEY = "visalight-konto";

export function AccountForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ange e-postadressen för kontot.");
      return;
    }
    setError("");
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const previous = raw ? (JSON.parse(raw) as unknown[]) : [];
      const list = Array.isArray(previous) ? previous : [];
      list.push({ email: email.trim(), savedAt: new Date().toISOString() });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      setError("Det gick inte att spara i den här webbläsaren.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Kontot är sparat här</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {email.trim()} är sparad i den här webbläsaren. Inget är skickat, och det går inte iväg förrän en inkorg finns. Köpet kräver inte kontot.
        </p>
        <Link href="/#urval" className="mt-5 inline-flex text-sm font-semibold text-ink underline-offset-4 hover:underline">
          Tillbaka till utdraget
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">E-post</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="inkop@foretag.se"
          className="field-box h-11 w-full rounded-xl px-3"
          aria-invalid={Boolean(error)}
        />
        {error ? <span className="mt-1 block text-sm text-rust">{error}</span> : null}
      </label>
      <button type="submit" className="btn-neon mt-4 inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold">
        Skapa konto
      </button>
      <p className="mt-3 text-xs leading-5 text-muted">
        Köpet i kassan går utan det här steget.{" "}
        <Link href="/kassa" className="underline-offset-4 hover:underline">
          Fortsätt utan konto
        </Link>
      </p>
    </form>
  );
}
