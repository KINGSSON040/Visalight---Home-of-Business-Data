import type { Company } from "@/lib/catalog";
import type { useCrmStore } from "@/lib/crm-store";
import { isStruck } from "@/components/crm-log";
import { isSoleProprietor } from "@/components/crm-ui";

type Store = ReturnType<typeof useCrmStore>;

function cell(value: string): string {
  const text = value.replace(/\r?\n/g, " ");
  return /[;"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(companies: Company[], store: Store): { csv: string; fields: string[] } {
  const fields = ["Organisationsnummer", "Namn", "Bolagsform", "Ort", "Län", "Bransch", "SNI", "Anställda", "Status", "Ägare", "Taggar", "Telefon", "E-post"];
  if (store.isAdmin) fields.push("Kontaktperson", "Roll");
  const lines = [fields.join(";")];
  for (const company of companies) {
    const meta = store.metaOf(company.orgNr);
    const blocked = store.blockedChannels(company.orgNr);
    const claim = store.claims.find((item) => item.orgNr === company.orgNr);
    const phones = blocked.includes("phone")
      ? []
      : [...new Set([...company.phones, ...company.signatoryPhones])].filter((value) => !isStruck(store.struckPhones, company.orgNr, value));
    const emails = blocked.includes("mail") ? [] : company.emails;
    const person = store.contacts.find((item) => item.orgNr === company.orgNr && !item.struck);
    const row = [
      isSoleProprietor(company) ? "Maskerat" : company.orgNr,
      company.name,
      company.form,
      company.city,
      company.county,
      company.industry,
      company.sni,
      String(company.employees ?? ""),
      meta.stage,
      claim?.userName ?? "",
      meta.tags.join(" "),
      phones.join(" "),
      emails.join(" "),
    ];
    if (store.isAdmin) row.push(person ? `${person.firstName} ${person.lastName}` : "", person?.role ?? "");
    lines.push(row.map(cell).join(";"));
  }
  return { csv: lines.join("\r\n"), fields };
}

export function downloadCsv(companies: Company[], store: Store, label: string): number {
  const { csv, fields } = buildCsv(companies, store);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${label.toLowerCase().replace(/[^a-zåäö0-9]+/g, "-") || "export"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  store.logExport(label, companies.length, fields);
  return companies.length;
}
