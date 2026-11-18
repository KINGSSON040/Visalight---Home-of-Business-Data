import Database from "better-sqlite3";
import { selectionIndustries } from "@/lib/catalog";
import { quote, type PriceQuote } from "@/lib/pricing";
import { registerDatabasePath } from "@/lib/register-path";

export type FreshCount = {
  source: "register" | "example";
  days: 7 | 30;
  companies: number;
  price: PriceQuote;
  note: string;
};

function asDays(value: string | undefined): 7 | 30 {
  return value === "30" ? 30 : 7;
}

function knownSni(value: string | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return selectionIndustries().some((item) => item.sni === digits) ? digits : "";
}

function cleanCity(value: string | undefined): string {
  return (value ?? "").replace(/[%_]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

export function freshQuery(input: { dagar?: string; sni?: string; ort?: string }): { days: 7 | 30; sni: string; city: string } {
  return { days: asDays(input.dagar), sni: knownSni(input.sni), city: cleanCity(input.ort) };
}

export function countNewCompanies(input: { days: 7 | 30; sni: string; city: string }): FreshCount {
  const file = registerDatabasePath();
  if (!file) {
    return {
      source: "example",
      days: input.days,
      companies: 0,
      price: quote({ companies: 0, phones: 0, signatoryPhones: 0, emails: 0 }),
      note: "Bolagsregistret är inte inkopplat.",
    };
  }
  const companies = countInDatabase(file, input);
  return {
    source: "register",
    days: input.days,
    companies,
    price: quote({ companies, phones: 0, signatoryPhones: 0, emails: 0 }),
    note: "Antalet kommer från bolagsregistret.",
  };
}

function countInDatabase(file: string, input: { days: 7 | 30; sni: string; city: string }): number {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const clauses = [
      "length(trim(coalesce(registered_on, ''))) >= 10",
      "substr(trim(registered_on), 1, 10) >= date('now', @window)",
      "(ended_on IS NULL OR trim(ended_on) = '')",
    ];
    const args: Record<string, string> = { window: `-${input.days} days` };
    if (input.city) {
      args.city = `%${foldCity(input.city)}%`;
      clauses.push(
        "lower(replace(replace(replace(replace(replace(replace(city, 'Ö', 'o'), 'ö', 'o'), 'Ä', 'a'), 'ä', 'a'), 'Å', 'a'), 'å', 'a')) LIKE @city",
      );
    }
    if (input.sni) {
      args.sni = input.sni;
      clauses.push("EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = companies.org_nr AND replace(i.sni, '.', '') = @sni)");
    }
    const row = db.prepare(`SELECT COUNT(*) AS n FROM companies WHERE ${clauses.join(" AND ")}`).get(args) as { n: number };
    return row.n;
  } finally {
    db.close();
  }
}

function foldCity(value: string): string {
  return value.toLocaleLowerCase("sv").replace(/[åäö]/g, (char) => ({ å: "a", ä: "a", ö: "o" })[char] ?? char);
}
