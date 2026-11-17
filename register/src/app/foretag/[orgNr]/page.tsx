import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell, Field } from "@/components/Shell";
import { companyIsSellable } from "@/lib/db";
import { displayOrgNr, compactOrgNr } from "@/lib/phones";
import { companyEmails, companyFlags, companyIndustries, companyPhones, getCompany, suppressionReason } from "@/lib/queries";
import { addEmail, addFlag, addPhone, removeFlag, retirePhone, saveNote, setManualExclude } from "./actions";

const kindLabel: Record<string, string> = {
  register: "Register",
  published: "Publicerat",
  signatory: "Firmatecknare",
};

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgNr: string }>;
  searchParams: Promise<{ fel?: string }>;
}) {
  const orgNr = compactOrgNr((await params).orgNr);
  const company = getCompany(orgNr);
  if (!company) notFound();
  const industries = companyIndustries(orgNr);
  const withSni = { ...company, sni: industries[0]?.sni ?? null };
  const sellable = companyIsSellable(withSni);
  const reason = suppressionReason(withSni);
  const error = (await searchParams).fel;
  return (
    <Shell>
      <Link href="/foretag" className="text-sm text-[var(--muted)]">
        Tillbaka till listan
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{company.name}</h1>
      <p className="mt-1 font-mono text-sm">{displayOrgNr(company.org_nr)}</p>
      <p className="mt-3 text-sm" style={{ color: sellable ? "var(--green)" : "var(--rust)" }}>
        {sellable ? "Ingår i en köpt fil." : `Ingår inte i en köpt fil: ${reason}.`}
      </p>
      {error ? <p className="mt-3 text-sm" style={{ color: "var(--rust)" }}>{errorText(error)}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Grunduppgifter</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-[var(--muted)]">Adress</dt>
            <dd>{[company.street, company.postal_code, company.city].filter(Boolean).join(", ") || "—"}</dd>
            <dt className="text-[var(--muted)]">SNI</dt>
            <dd>{industries.map((item) => item.sni).join(", ") || "—"}</dd>
            <dt className="text-[var(--muted)]">Form</dt>
            <dd>{company.legal_form || "—"}</dd>
            <dt className="text-[var(--muted)]">Anställda</dt>
            <dd>{company.employee_class || "—"}</dd>
            <dt className="text-[var(--muted)]">Källa</dt>
            <dd>{company.source}, läst {company.fetched_at.slice(0, 10)}</dd>
          </dl>
        </section>
        <section className="card">
          <h2 className="font-semibold">Intern markering</h2>
          <form action={saveNote} className="mt-3 grid gap-2">
            <input type="hidden" name="orgNr" value={orgNr} />
            <textarea name="note" rows={3} defaultValue={company.internal_note} />
            <button type="submit">Spara anteckning</button>
          </form>
          <form action={setManualExclude} className="mt-3 flex items-center gap-3 text-sm">
            <input type="hidden" name="orgNr" value={orgNr} />
            <input type="hidden" name="exclude" value={company.manual_exclude ? "0" : "1"} />
            <button className="secondary" type="submit">
              {company.manual_exclude ? "Ta med i filen igen" : "Uteslut från filen"}
            </button>
          </form>
          <ul className="mt-4 space-y-2 text-sm">
            {companyFlags(orgNr).map((flag) => (
              <li key={flag.id} className="flex items-center justify-between gap-3">
                <span>
                  {flag.label}
                  {flag.note ? ` · ${flag.note}` : ""}
                </span>
                <form action={removeFlag}>
                  <input type="hidden" name="orgNr" value={orgNr} />
                  <input type="hidden" name="id" value={flag.id} />
                  <button className="secondary" type="submit">Ta bort</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addFlag} className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input type="hidden" name="orgNr" value={orgNr} />
            <select name="label" defaultValue="bevaka">
              <option value="bevaka">Bevaka</option>
              <option value="prioritet">Prioritet</option>
              <option value="granska">Granska</option>
            </select>
            <input name="note" placeholder="Kort notering" />
            <button type="submit">Flagga</button>
          </form>
        </section>
      </div>

      <section className="mt-4 card">
        <h2 className="font-semibold">Nummer</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {company.phone_block ? "Telefonspärr. Numren visas här och följer inte med i priset." : "Varje nummer som är belagt har en egen rad."}
        </p>
        <PhoneTable orgNr={orgNr} />
        <form action={addPhone} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="orgNr" value={orgNr} />
          <Field label="Nummer som står på sidan">
            <input name="raw" required />
          </Field>
          <Field label="Typ">
            <select name="kind" defaultValue="published">
              <option value="published">Publicerat nummer</option>
              <option value="signatory">Firmatecknarens nummer</option>
            </select>
          </Field>
          <Field label="Sidans adress">
            <input name="sourceUrl" type="url" required placeholder="https://" />
          </Field>
          <Field label="Hur organisationsnumret framgår">
            <input name="evidence" required minLength={12} />
          </Field>
          <button type="submit">Spara nummer</button>
        </form>
      </section>

      <section className="mt-4 card">
        <h2 className="font-semibold">E-post</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {company.email_block ? "E-postspärr. Adressen visas här och följer inte med i priset." : "Bara adresser som källan har angett."}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {companyEmails(orgNr).map((email) => (
            <li key={email.id}>
              {email.address} · {email.source}
              {email.removed_on ? " · borttagen från källan" : ""}
            </li>
          ))}
          {companyEmails(orgNr).length === 0 ? <li>Ingen e-post lagrad.</li> : null}
        </ul>
        <form action={addEmail} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="orgNr" value={orgNr} />
          <Field label="Adress som står på sidan">
            <input name="address" type="email" required />
          </Field>
          <Field label="Sidans adress">
            <input name="sourceUrl" type="url" required placeholder="https://" />
          </Field>
          <Field label="Hur organisationsnumret framgår">
            <input name="evidence" required minLength={12} />
          </Field>
          <button type="submit">Spara e-post</button>
        </form>
      </section>
    </Shell>
  );
}

function PhoneTable({ orgNr }: { orgNr: string }) {
  const phones = companyPhones(orgNr);
  if (phones.length === 0) return <p className="mt-3 text-sm">Inget nummer lagrat.</p>;
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl">
      <table>
        <thead>
          <tr>
            <th>Nummer</th>
            <th>Typ</th>
            <th>Källa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {phones.map((phone) => (
            <tr key={phone.id}>
              <td className="font-mono">{phone.raw}</td>
              <td>{kindLabel[phone.kind] ?? phone.kind}{phone.removed_on ? " · borta från källan" : ""}</td>
              <td>
                {phone.source}
                {phone.evidence ? <div className="text-xs text-[var(--muted)]">{phone.evidence}</div> : null}
              </td>
              <td>
                {phone.removed_on ? null : (
                  <form action={retirePhone}>
                    <input type="hidden" name="orgNr" value={orgNr} />
                    <input type="hidden" name="id" value={phone.id} />
                    <button className="secondary" type="submit">Markera borta</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function errorText(code: string) {
  if (code === "belagg") return "Numret sparades inte. Sidans adress och en beskrivning av var organisationsnumret står behövs.";
  if (code === "nummer") return "Numret sparades inte. Det behöver vara ett nummer som står i källan, med minst sju siffror.";
  if (code === "epost") return "E-postadressen sparades inte. Adress, sidans länk och belägg krävs.";
  return "Något saknades i formuläret.";
}
