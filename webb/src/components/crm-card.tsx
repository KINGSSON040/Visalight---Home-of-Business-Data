"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { legalFormLabel, type Company } from "@/lib/catalog";
import {
  OUTCOMES,
  formatStamp,
  outcomeLabel,
  readPurchases,
  tomorrowMorningLocal,
  useCrmStore,
  type Contact,
  type OutcomeId,
  type Purchase,
} from "@/lib/crm-store";

export function CrmCard({
  company,
  call,
  embedded = false,
}: {
  company: Company;
  call?: { index: number; total: number; segmentName: string; onDone: () => void };
  embedded?: boolean;
}) {
  const store = useCrmStore();
  const claim = store.claims.find((item) => item.orgNr === company.orgNr) ?? null;
  const mine = claim?.userId === store.userId;
  const taken = Boolean(claim && !mine);
  const people = store.contacts.filter((item) => item.orgNr === company.orgNr);
  const log = store.activities.filter((item) => item.orgNr === company.orgNr);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    setPurchases(readPurchases(company.orgNr));
  }, [company.orgNr]);

  return (
    <article className={embedded ? "" : "mx-auto max-w-3xl"}>
      {embedded ? null : (
        <p className="text-sm">
          <Link href="/crm" className="font-medium text-sea">
            Tillbaka till sök
          </Link>
        </p>
      )}
      {call ? (
        <p className="mt-3 rounded-2xl bg-foam px-4 py-3 text-sm leading-6">
          Samtal {Math.min(call.index + 1, call.total)} av {call.total} i segmentet {call.segmentName}. Logga utfallet,
          så kommer nästa bolag.
        </p>
      ) : null}

      <header className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-sea">Kundkort</p>
          <h1 className="mt-1 text-3xl tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {company.orgNr} · {legalFormLabel(company.form)}
          </p>
        </div>
        <StarButton
          filled={Boolean(claim)}
          disabled={taken}
          label={
            taken && claim
              ? `Bearbetas av ${claim.userName}`
              : mine
                ? "Ta bort stjärnan"
                : "Markera som mitt"
          }
          onClick={() => store.toggleStar(company.orgNr)}
        />
      </header>
      {taken && claim ? (
        <p className="mt-3 text-sm text-muted">Bearbetas av {claim.userName} sedan {formatStamp(claim.at)}.</p>
      ) : null}
      {mine && claim ? (
        <p className="mt-3 text-sm text-sea">Stjärnmärkt {formatStamp(claim.at)}. Bolaget ligger under Mina företag.</p>
      ) : null}

      <section className="mt-6 rounded-3xl border border-line bg-white p-4 sm:p-5">
        <h2 className="text-xl tracking-tight">Om bolaget</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Fact label="Adress" value={`${company.street}, ${company.postalCode} ${company.city}`} />
          <Fact label="Län" value={company.county || "Saknas"} />
          <Fact label="Bransch" value={company.industry} />
          <Fact label="SNI" value={company.sni} />
          <Fact label="Bolagsform" value={legalFormLabel(company.form)} />
          <Fact label="Anställda" value={company.employees || "Saknas"} />
          <Fact
            label="Telefon i registret"
            value={company.phones.length ? company.phones.join(", ") : "Inget nummer"}
            struck={company.phones.filter((phone) => isStruck(store.struckPhones, company.orgNr, phone))}
          />
          <Fact
            label="Beslutsfattare"
            value={company.signatoryPhones.length ? company.signatoryPhones.join(", ") : "Inget nummer"}
            struck={company.signatoryPhones.filter((phone) => isStruck(store.struckPhones, company.orgNr, phone))}
          />
          <Fact label="E-post i registret" value={company.emails.length ? company.emails.join(", ") : "Ingen adress"} />
        </dl>
        <PhoneLines
          orgNr={company.orgNr}
          numbers={[...company.phones, ...company.signatoryPhones]}
          struckPhones={store.struckPhones}
        />
      </section>

      <Contacts companyOrg={company.orgNr} people={people} />
      <ActivityForm company={company} call={call} />
      <History entries={log} />
      <Purchases purchases={purchases} />
    </article>
  );
}

function isStruck(struck: { orgNr: string; value: string }[], orgNr: string, value: string) {
  return struck.some((item) => item.orgNr === orgNr && item.value === value);
}

function Fact({ label, value, struck = [] }: { label: string; value: string; struck?: string[] }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">
        {struck.length ? <span className="line-through">{struck.join(", ")}</span> : null}
        {struck.length ? " " : null}
        {value
          .split(", ")
          .filter((part) => !struck.includes(part))
          .join(", ") || (struck.length ? "" : value)}
      </dd>
    </div>
  );
}

function PhoneLines({
  orgNr,
  numbers,
  struckPhones,
}: {
  orgNr: string;
  numbers: string[];
  struckPhones: { orgNr: string; value: string }[];
}) {
  const unique = [...new Set(numbers)];
  if (unique.length === 0) return null;
  return (
    <ul className="mt-4 space-y-1 text-sm">
      {unique.map((number) => {
        const struck = isStruck(struckPhones, orgNr, number);
        return (
          <li key={number} className={struck ? "text-muted line-through" : ""}>
            {number}
            {struck ? " · struket, inaktivt nummer" : ""}
          </li>
        );
      })}
    </ul>
  );
}

function Contacts({ companyOrg, people }: { companyOrg: string; people: Contact[] }) {
  const store = useCrmStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [extra, setExtra] = useState<{ id: string; phone: string; email: string } | null>(null);

  function savePerson() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ange förnamn och efternamn.");
      return;
    }
    setError("");
    const phoneList = phone.trim() ? [...phones, phone.trim()] : phones;
    const emailList = email.trim() ? [...emails, email.trim()] : emails;
    store.addContact({
      id: crypto.randomUUID(),
      orgNr: companyOrg,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim(),
      phones: phoneList.map((value) => ({ id: crypto.randomUUID(), value, struck: false })),
      emails: emailList.map((value) => ({ id: crypto.randomUUID(), value })),
      struck: false,
    });
    setFirstName("");
    setLastName("");
    setRole("");
    setPhones([]);
    setEmails([]);
    setPhone("");
    setEmail("");
  }

  return (
    <section className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-xl tracking-tight">Kontaktpersoner</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        En person kan ha flera nummer och e-postadresser. En profil kan strykas, inte raderas.
      </p>
      <ul className="mt-4 space-y-3">
        {people.length === 0 ? <li className="text-sm text-muted">Ingen kontaktperson tillagd.</li> : null}
        {people.map((person) => (
          <li key={person.id} className={`rounded-2xl border border-line px-3 py-3 ${person.struck ? "bg-paper" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className={person.struck ? "text-muted line-through" : ""}>
                <p className="font-medium">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-sm">{person.role || "Ingen rolltitel"}</p>
              </div>
              {person.struck ? (
                <span className="text-xs text-muted">Struken</span>
              ) : (
                <button type="button" onClick={() => store.strikeContact(person.id)} className="text-sm font-medium text-sea">
                  Stryk
                </button>
              )}
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {person.phones.map((item) => (
                <li key={item.id} className={item.struck || person.struck ? "text-muted line-through" : ""}>
                  {item.value}
                  {item.struck ? " · struket" : ""}
                </li>
              ))}
              {person.emails.map((item) => (
                <li key={item.id} className={person.struck ? "text-muted line-through" : ""}>
                  {item.value}
                </li>
              ))}
            </ul>
            {!person.struck ? (
              extra?.id === person.id ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={extra.phone}
                    onChange={(event) => setExtra({ ...extra, phone: event.target.value })}
                    placeholder="Ytterligare telefon"
                    className="h-10 rounded-xl border border-line px-3 text-sm"
                  />
                  <input
                    value={extra.email}
                    onChange={(event) => setExtra({ ...extra, email: event.target.value })}
                    placeholder="Ytterligare e-post"
                    className="h-10 rounded-xl border border-line px-3 text-sm"
                  />
                  <button
                    type="button"
                    className="h-10 rounded-full bg-sea px-3 text-sm font-medium text-white"
                    onClick={() => {
                      if (extra.phone.trim()) store.addContactPhone(person.id, extra.phone.trim());
                      if (extra.email.trim()) store.addContactEmail(person.id, extra.email.trim());
                      setExtra(null);
                    }}
                  >
                    Lägg till
                  </button>
                </div>
              ) : (
                <button type="button" className="mt-2 text-sm font-medium text-sea" onClick={() => setExtra({ id: person.id, phone: "", email: "" })}>
                  Lägg till nummer eller e-post
                </button>
              )
            ) : null}
          </li>
        ))}
      </ul>

      <form
        className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          savePerson();
        }}
      >
        <Field label="Förnamn" value={firstName} onChange={setFirstName} />
        <Field label="Efternamn" value={lastName} onChange={setLastName} />
        <Field label="Rolltitel" value={role} onChange={setRole} />
        <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Field label="Telefon" value={phone} onChange={setPhone} />
          <button
            type="button"
            className="h-12 self-end rounded-full border border-line px-3 text-sm"
            onClick={() => {
              if (!phone.trim()) return;
              setPhones((current) => [...current, phone.trim()]);
              setPhone("");
            }}
          >
            Ett nummer till
          </button>
        </div>
        <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Field label="E-post" value={email} onChange={setEmail} />
          <button
            type="button"
            className="h-12 self-end rounded-full border border-line px-3 text-sm"
            onClick={() => {
              if (!email.trim()) return;
              setEmails((current) => [...current, email.trim()]);
              setEmail("");
            }}
          >
            En adress till
          </button>
        </div>
        {phones.length || emails.length ? (
          <p className="sm:col-span-2 text-sm text-muted">
            {[...phones, ...emails].join(" · ")}
          </p>
        ) : null}
        {error ? <p className="sm:col-span-2 text-sm text-rust">{error}</p> : null}
        <button type="submit" className="h-12 rounded-full bg-sea font-medium text-white sm:col-span-2">
          Lägg till kontaktperson
        </button>
      </form>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3" />
    </label>
  );
}

function ActivityForm({
  company,
  call,
}: {
  company: Company;
  call?: { onDone: () => void };
}) {
  const store = useCrmStore();
  const [outcome, setOutcome] = useState<OutcomeId>("ej-svar");
  const [note, setNote] = useState("");
  const [nextAt, setNextAt] = useState("");
  const [nextNote, setNextNote] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const contactPhones = store.contacts
    .filter((item) => item.orgNr === company.orgNr && !item.struck)
    .flatMap((item) => item.phones.filter((entry) => !entry.struck).map((entry) => ({ value: entry.value, contactId: item.id, phoneId: entry.id })));
  const registerPhones = [...company.phones, ...company.signatoryPhones]
    .filter((value) => !isStruck(store.struckPhones, company.orgNr, value))
    .map((value) => ({ value, contactId: "", phoneId: "" }));
  const numbers = [...registerPhones, ...contactPhones];

  function save() {
    if (outcome === "inaktivt-nummer" && !phone) {
      setError("Välj numret som är inaktivt. Det stryks och ligger kvar.");
      return;
    }
    setError("");
    const chosen = numbers.find((item) => item.value === phone);
    if (outcome === "inaktivt-nummer" && chosen) {
      store.strikePhone(company.orgNr, chosen.value, chosen.contactId || undefined, chosen.phoneId || undefined);
    }
    store.addActivity({
      id: crypto.randomUUID(),
      orgNr: company.orgNr,
      companyName: company.name,
      at: new Date().toISOString(),
      userId: store.currentUser.id,
      userName: store.currentUser.name,
      outcome,
      note: note.trim(),
      nextAt,
      nextNote: nextNote.trim(),
      struckPhone: outcome === "inaktivt-nummer" ? phone : "",
    });
    setNote("");
    setNextNote("");
    setPhone("");
    if (call) call.onDone();
  }

  return (
    <section className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-xl tracking-tight">Logga samtalet</h2>
      <form
        className="mt-3 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Utfall</span>
          <select
            value={outcome}
            onChange={(event) => setOutcome(event.target.value as OutcomeId)}
            className="h-12 w-full rounded-xl border border-line bg-paper px-3"
          >
            {OUTCOMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {outcome === "inaktivt-nummer" ? (
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Vilket nummer</span>
            <select value={phone} onChange={(event) => setPhone(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3">
              <option value="">Välj nummer</option>
              {numbers.map((item) => (
                <option key={`${item.contactId}-${item.phoneId}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Anteckning</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="w-full rounded-xl border border-line bg-paper px-3 py-2" />
        </label>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Nästa aktivitet</span>
            <input type="datetime-local" value={nextAt} onChange={(event) => setNextAt(event.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3" />
          </label>
          <button type="button" className="h-12 rounded-full border border-line px-3 text-sm" onClick={() => setNextAt(tomorrowMorningLocal())}>
            Imorgon kl. 09
          </button>
        </div>
        <Field label="Vad som ska göras då" value={nextNote} onChange={setNextNote} />
        {error ? <p className="text-sm text-rust">{error}</p> : null}
        <button type="submit" className="h-12 rounded-full bg-amber font-medium text-ink">
          {call ? "Spara och nästa bolag" : "Spara utfall"}
        </button>
      </form>
    </section>
  );
}

function History({ entries }: { entries: { id: string; at: string; userName: string; outcome: OutcomeId; note: string; nextAt: string; nextNote: string; struckPhone: string }[] }) {
  return (
    <section className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-xl tracking-tight">Tidigare aktivitet</h2>
      {entries.length === 0 ? <p className="mt-2 text-sm text-muted">Inget loggat på bolaget ännu.</p> : null}
      <ol className="mt-3 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-2xl bg-paper px-3 py-3 text-sm leading-6">
            <p className="text-muted">{formatStamp(entry.at)} · {entry.userName}</p>
            <p className="font-medium">{outcomeLabel(entry.outcome)}</p>
            {entry.note ? <p>{entry.note}</p> : null}
            {entry.struckPhone ? <p className="text-muted line-through">{entry.struckPhone} struket</p> : null}
            {entry.nextAt ? (
              <p className="text-sea">Nästa: {formatStamp(entry.nextAt)}{entry.nextNote ? ` · ${entry.nextNote}` : ""}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Purchases({ purchases }: { purchases: Purchase[] }) {
  return (
    <section className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <h2 className="text-xl tracking-tight">Köphistorik</h2>
      <p className="mt-1 text-sm leading-6 text-muted">Det bolaget har köpt av oss, så du vet läget inför samtalet.</p>
      {purchases.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Inga köp registrerade på det här bolaget.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {purchases.map((item) => (
            <li key={item.id} className="rounded-2xl bg-paper px-3 py-3 text-sm leading-6">
              <p className="font-medium">{item.what}</p>
              <p className="text-muted">
                {item.id} · {formatStamp(item.at)} · {item.sum}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StarButton({
  filled,
  disabled,
  label,
  onClick,
}: {
  filled: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={filled}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white ${
        filled ? "text-sea" : "text-muted"
      } disabled:cursor-not-allowed`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 3.2 14.7 8.7 20.8 9.6 16.4 13.8 17.4 19.8 12 17 6.6 19.8 7.6 13.8 3.2 9.6 9.3 8.7 12 3.2Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
