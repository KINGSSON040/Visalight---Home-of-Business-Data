"use client";

import { useState, type FormEvent } from "react";
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
      payment: "faktura",
      selection,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(draft));
    router.push("/bekraftelse");
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-card p-4 sm:p-6">
      <h2 className="font-serif text-2xl">Förhandsboka utdraget</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Beställning öppnar snart. {SELLER.tradeName} är inte ett registrerat bolag ännu, och den här sidan tar inte
        betalt. Ingen fil skickas. Urvalet och e-posten sparas bara i den här webbläsaren.
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
      <button type="submit" className="btn-fade-sea mt-6 h-12 w-full rounded-full font-medium text-white">
        Förhandsboka
      </button>
    </form>
  );
}
