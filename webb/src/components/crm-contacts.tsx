"use client";

import { useState } from "react";
import { Field, Panel, telHref } from "@/components/crm-ui";
import { formatStamp, useCrmStore, type Contact } from "@/lib/crm-store";

export function Contacts({ orgNr }: { orgNr: string }) {
  const store = useCrmStore();
  const people = store.contacts.filter((item) => item.orgNr === orgNr);
  const active = people.filter((item) => !item.struck);
  const struck = people.filter((item) => item.struck);
  const [showForm, setShowForm] = useState(false);
  const [showStruck, setShowStruck] = useState(false);

  return (
    <Panel
      title={`Kontaktpersoner · ${active.length}`}
      intro="Personerna hör till det här bolaget och syns på kortet. Ingen kan raderas. Den som har slutat stryks och ligger kvar."
      aside={
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="btn-fade-sea h-10 shrink-0 rounded-full bg-sea px-4 text-sm font-medium text-white"
        >
          {showForm ? "Stäng" : "Ny person"}
        </button>
      }
    >
      <ul className="mt-4 space-y-3">
        {active.length === 0 ? <li className="text-sm text-muted">Ingen aktiv kontaktperson ännu.</li> : null}
        {active.map((person) => (
          <PersonRow key={person.id} person={person} />
        ))}
      </ul>

      {struck.length ? (
        <div className="mt-4">
          <button type="button" className="text-sm font-medium text-sea" onClick={() => setShowStruck((current) => !current)}>
            {showStruck ? "Dölj strukna personer" : `Visa strukna personer (${struck.length})`}
          </button>
          {showStruck ? (
            <ul className="mt-2 space-y-3">
              {struck.map((person) => (
                <PersonRow key={person.id} person={person} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {showForm ? <NewPerson orgNr={orgNr} onDone={() => setShowForm(false)} /> : null}
    </Panel>
  );
}

function PersonRow({ person }: { person: Contact }) {
  const store = useCrmStore();
  const [extra, setExtra] = useState<{ phone: string; email: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={`rounded-2xl border px-3 py-3 ${person.struck ? "border-line bg-paper" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={person.struck ? "text-muted line-through" : ""}>
          <p className="font-medium">
            {person.firstName} {person.lastName}
          </p>
          <p className="text-sm">{person.role || "Ingen rolltitel"}</p>
        </div>
        {person.struck ? (
          <div className="text-right text-xs text-muted">
            <p>
              Struken {person.struckAt ? formatStamp(person.struckAt) : ""}
              {person.struckBy ? ` av ${person.struckBy}` : ""}
            </p>
            <button type="button" className="mt-1 text-sm font-medium text-sea" onClick={() => store.reactivateContact(person.id)}>
              Återaktivera
            </button>
          </div>
        ) : confirming ? (
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className="btn-fade-rust rounded-full bg-rust px-3 py-1.5 font-medium text-white"
              onClick={() => {
                store.strikeContact(person.id);
                setConfirming(false);
              }}
            >
              Stryk personen
            </button>
            <button type="button" className="text-muted" onClick={() => setConfirming(false)}>
              Avbryt
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-rust">
            Har slutat
          </button>
        )}
      </div>

      <ul className="mt-2 space-y-1.5 text-sm">
        {person.phones.map((item) => {
          const dead = item.struck || person.struck;
          return (
            <li key={item.id} className="flex items-center justify-between gap-2">
              {dead ? (
                <span className="text-muted line-through">{item.value}</span>
              ) : (
                <a href={telHref(item.value)} className="font-medium text-sea">
                  {item.value}
                </a>
              )}
              {person.struck ? null : (
                <button
                  type="button"
                  className="text-xs text-muted underline"
                  onClick={() => store.setContactPhoneStruck(person.id, item.id, !item.struck)}
                >
                  {item.struck ? "Återställ" : "Stryk"}
                </button>
              )}
            </li>
          );
        })}
        {person.emails.map((item) => {
          const dead = item.struck || person.struck;
          return (
            <li key={item.id} className="flex items-center justify-between gap-2">
              {dead ? (
                <span className="text-muted line-through">{item.value}</span>
              ) : (
                <a href={`mailto:${item.value}`} className="font-medium text-sea">
                  {item.value}
                </a>
              )}
              {person.struck ? null : (
                <button
                  type="button"
                  className="text-xs text-muted underline"
                  onClick={() => store.setContactEmailStruck(person.id, item.id, !item.struck)}
                >
                  {item.struck ? "Återställ" : "Stryk"}
                </button>
              )}
            </li>
          );
        })}
        {person.phones.length === 0 && person.emails.length === 0 ? (
          <li className="text-muted">Inga nummer eller adresser ännu.</li>
        ) : null}
      </ul>

      {!person.struck ? (
        extra ? (
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
              className="btn-fade-sea h-10 rounded-full bg-sea px-3 text-sm font-medium text-white"
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
          <button type="button" className="mt-2 text-sm font-medium text-sea" onClick={() => setExtra({ phone: "", email: "" })}>
            Lägg till nummer eller e-post
          </button>
        )
      ) : null}
    </li>
  );
}

function NewPerson({ orgNr, onDone }: { orgNr: string; onDone: () => void }) {
  const store = useCrmStore();
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phones, setPhones] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [error, setError] = useState("");

  function setAt(list: string[], setList: (next: string[]) => void, index: number, value: string) {
    setList(list.map((item, at) => (at === index ? value : item)));
  }

  function save() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ange förnamn och efternamn.");
      return;
    }
    setError("");
    store.addContact({
      id: crypto.randomUUID(),
      orgNr,
      role: role.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phones: phones.filter((value) => value.trim()).map((value) => ({ id: crypto.randomUUID(), value: value.trim(), struck: false })),
      emails: emails.filter((value) => value.trim()).map((value) => ({ id: crypto.randomUUID(), value: value.trim(), struck: false })),
      struck: false,
    });
    onDone();
  }

  return (
    <form
      className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Field label="Rolltitel" value={role} onChange={setRole} placeholder="Till exempel VD" />
      <Field label="Förnamn" value={firstName} onChange={setFirstName} />
      <Field label="Efternamn" value={lastName} onChange={setLastName} />

      <div className="space-y-2 sm:col-span-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
        <div className="space-y-2">
          {phones.map((value, index) => (
            <Field
              key={index}
              label={index === 0 ? "Telefon" : `Telefon ${index + 1}`}
              type="tel"
              value={value}
              onChange={(next) => setAt(phones, setPhones, index, next)}
            />
          ))}
          <button type="button" className="text-sm font-medium text-sea" onClick={() => setPhones([...phones, ""])}>
            Ett nummer till
          </button>
        </div>
        <div className="space-y-2">
          {emails.map((value, index) => (
            <Field
              key={index}
              label={index === 0 ? "E-post" : `E-post ${index + 1}`}
              type="email"
              value={value}
              onChange={(next) => setAt(emails, setEmails, index, next)}
            />
          ))}
          <button type="button" className="text-sm font-medium text-sea" onClick={() => setEmails([...emails, ""])}>
            En adress till
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rust sm:col-span-3">{error}</p> : null}
      <button type="submit" className="btn-fade-green h-12 rounded-full bg-green font-medium text-white sm:col-span-3">
        Lägg till kontaktperson
      </button>
    </form>
  );
}
