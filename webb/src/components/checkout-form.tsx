"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STORAGE_KEY, type OrderDraft, type Selection } from "@/lib/catalog";

type Payment = OrderDraft["payment"];

export function CheckoutForm({ selection }: { selection: Selection }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [contact, setContact] = useState("");
  const [payment, setPayment] = useState<Payment | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Ange e-postadressen dit filen ska.";
    }
    if (company.trim().length < 2) {
      nextErrors.company = "Ange företagsnamnet.";
    }
    if (!/^\d{6}-?\d{4}$/.test(orgNr.trim())) {
      nextErrors.orgNr = "Ange organisationsnummer med 10 siffror, till exempel 559100-1001.";
    }
    if (payment !== "kort" && payment !== "faktura") {
      nextErrors.payment = "Välj kort eller faktura.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || (payment !== "kort" && payment !== "faktura")) return;

    const draft: OrderDraft = {
      id: `VL-${Math.floor(1000 + Math.random() * 9000)}`,
      email: email.trim(),
      company: company.trim(),
      orgNr: orgNr.trim(),
      contact: contact.trim(),
      payment,
      selection,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(draft));
    router.push("/bekraftelse");
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-card p-4 sm:p-6">
      <h2 className="font-serif text-2xl">Vart filen ska</h2>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-muted">E-post</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="inkop@foretag.se"
          className="h-12 w-full rounded-xl border border-line bg-white px-3"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <span className="mt-1 block text-rust">{errors.email}</span> : null}
      </label>

      <h2 className="mt-8 font-serif text-2xl">Vem som beställer</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Företagsnamn</span>
          <input
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3"
            aria-invalid={Boolean(errors.company)}
          />
          {errors.company ? <span className="mt-1 block text-rust">{errors.company}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Organisationsnummer</span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={orgNr}
            onChange={(event) => setOrgNr(event.target.value)}
            placeholder="559100-1001"
            className="h-11 w-full rounded-xl border border-line bg-white px-3"
            aria-invalid={Boolean(errors.orgNr)}
          />
          {errors.orgNr ? <span className="mt-1 block text-rust">{errors.orgNr}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Namn</span>
          <input
            autoComplete="name"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-white px-3"
          />
        </label>
      </div>

      <fieldset className="mt-8">
        <legend className="font-serif text-2xl">Betalning</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <PayCard
            selected={payment === "kort"}
            title="Kort"
            text="Betalas direkt. Filen skickas när kortbetalningen är bekräftad."
            onSelect={() => setPayment("kort")}
          />
          <PayCard
            selected={payment === "faktura"}
            title="Faktura"
            text="För företag. Filen skickas när fakturan är markerad som betald."
            onSelect={() => setPayment("faktura")}
          />
        </div>
        {errors.payment ? <p className="mt-2 text-sm text-rust">{errors.payment}</p> : null}
        <p className="mt-3 text-sm leading-6 text-muted">
          Kort och faktura kopplas i nästa steg. Den här beställningen drar inga pengar och skickar ingen fil.
        </p>
      </fieldset>

      <button type="submit" className="mt-6 h-12 w-full rounded-full bg-ink font-medium text-white">
        Visa beställningen
      </button>
    </form>
  );
}

function PayCard({
  selected,
  title,
  text,
  onSelect,
}: {
  selected: boolean;
  title: string;
  text: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-2xl border p-4 text-left ${
        selected ? "border-green bg-green-soft" : "border-line bg-white"
      }`}
    >
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
    </button>
  );
}
