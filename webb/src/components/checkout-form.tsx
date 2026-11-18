"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ORDER_STORAGE_KEY, type OrderDraft, type Selection } from "@/lib/catalog";
import { SELLER } from "@/lib/seller";

export function CheckoutForm({ selection }: { selection: Selection }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ange e-postadressen för förhandsbokningen.");
      return;
    }
    setError("");
    const draft: OrderDraft = {
      id: `VL-${Math.floor(1000 + Math.random() * 9000)}`,
      email: email.trim(),
      company: "",
      orgNr: "",
      contact: "",
      // OrderDraft kräver fältet. Värdet är ingen dragning och visas inte som kort eller faktura.
      payment: "faktura",
      selection,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(draft));
    router.push("/bekraftelse");
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-card p-4 sm:p-6">
      <p className="inline-flex rounded-full bg-foam px-3 py-1 text-sm text-ink">Beställning öppnar snart. Ingen betalning dras.</p>
      <h2 className="mt-3 font-serif text-2xl">Förhandsboka utdraget</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Beställning öppnar snart. Ingen betalning dras och ingen fil skickas. {SELLER.line}
      </p>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-muted">E-post</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="inkop@foretag.se"
          className="h-12 w-full rounded-xl border border-line bg-white px-3"
          aria-invalid={Boolean(error)}
        />
        {error ? <span className="mt-1 block text-rust">{error}</span> : null}
      </label>
      <button type="submit" className="btn-fade-sea mt-6 h-12 w-full rounded-full bg-sea font-medium text-white">
        Förhandsboka
      </button>
      <p className="mt-3 text-xs leading-5 text-muted">
        Köpet går utan konto.{" "}
        <Link href="/konto" className="underline-offset-4 hover:underline">
          Skapa konto för köphistorik
        </Link>
      </p>
    </form>
  );
}
