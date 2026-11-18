import Database from "better-sqlite3";
import { COUNTIES, industryLabel, selectionIndustries, selectionSniFilter } from "@/lib/catalog";
import { registerDatabasePath } from "@/lib/register-path";
import { SELLABLE } from "@/lib/register-urval";
import { csvFromRows } from "@/lib/sample-file";

export const SAMPLE_SIZE = 30;

const COLUMNS = [
  "organisationsnummer",
  "foretagsnamn",
  "gatuadress",
  "postnummer",
  "postort",
  "lan",
  "bolagsform",
  "bransch",
  "sni",
  "anstallda",
  "telefon",
  "epost",
  "beslutsfattare",
] as const;

const FORM_BY_SCB: Record<string, string> = {
  "49": "Aktiebolag",
  "41": "Aktiebolag",
  "42": "Aktiebolag",
  "10": "Enskild firma",
  "31": "Handelsbolag eller kommanditbolag",
  "51": "Ekonomisk förening",
  "53": "Bostadsrättsförening",
  "61": "Ideell förening",
  "71": "Stiftelse",
  "72": "Stiftelse",
  "96": "Filial",
  "43": "Europabolag",
  "62": "Samfällighet",
  "63": "Trossamfund",
  "21": "Enkelt bolag",
  "82": "Kommun",
  "84": "Region",
  "81": "Statlig enhet",
  "89": "Statlig enhet",
};

export type SamplePick = {
  ok: boolean;
  label: string;
  count: number;
  csv: string;
  note: string;
};

type Row = {
  orgNr: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  countyCode: string;
  legalForm: string;
  employees: string;
  phoneBlock: number;
  emailBlock: number;
  sni: string | null;
  phones: string | null;
  signatories: string | null;
  emails: string | null;
};

export function pickSample(text: string, sni?: string): SamplePick {
  const typed = text.trim();
  const chosen = (sni ?? "").replace(/\D/g, "");
  const filter = chosen
    ? selectionSniFilter({ sni: chosen })
    : selectionSniFilter({ bransch: typed, query: typed });
  if (!typed && !chosen) {
    return { ok: false, label: "", count: 0, csv: "", note: "Ange en bransch med namn eller SNI-kod." };
  }
  if (filter.kind === "none" || filter.kind === "any") {
    return { ok: false, label: typed, count: 0, csv: "", note: "Ingen bransch matchade. Skriv ett namn eller en SNI-kod, till exempel frisör eller 96.210." };
  }
  const label = industryTitle(typed, chosen);
  const file = registerDatabasePath();
  if (!file) {
    return { ok: false, label, count: 0, csv: "", note: "Bolagsregistret är inte inkopplat. Ingen fil skapas och inget mail skickas." };
  }
  const rows = readRows(file, filter);
  if (rows.length === 0) {
    return { ok: false, label, count: 0, csv: "", note: "Inget bolag i den branschen finns i bolagsregistret." };
  }
  const csv = csvFromRows([
    [...COLUMNS],
    ...rows.map((row) => {
      const code = (row.sni ?? "").replace(/\D/g, "");
      const name = industryLabel(code);
      return [
        formatOrg(row.orgNr),
        row.name,
        row.street,
        row.postalCode,
        row.city,
        countyName(row.countyCode),
        FORM_BY_SCB[row.legalForm] ?? row.legalForm,
        name === code ? dotted(code) : name,
        dotted(code || row.sni || ""),
        row.employees,
        row.phoneBlock ? "" : row.phones ?? "",
        row.emailBlock ? "" : row.emails ?? "",
        row.phoneBlock ? "" : row.signatories ?? "",
      ];
    }),
  ]);
  const note =
    rows.length < SAMPLE_SIZE
      ? `${rows.length} bolag finns i bolagsregistret för ${label}. Filen innehåller dem.`
      : `${SAMPLE_SIZE} bolag i ${label} kommer från bolagsregistret.`;
  return { ok: true, label, count: rows.length, csv, note };
}

function industryTitle(typed: string, chosen: string): string {
  const pool = selectionIndustries();
  const hit = chosen
    ? pool.find((item) => item.sni === chosen)
    : pool.find((item) => item.label.toLocaleLowerCase("sv") === typed.toLocaleLowerCase("sv"));
  if (!hit) return typed;
  return `${hit.label}, SNI ${hit.code}`;
}

function readRows(file: string, filter: ReturnType<typeof selectionSniFilter>): Row[] {
  const args: Record<string, string> = {};
  let match = "";
  if (filter.kind === "codes") {
    const codes = [...new Set(filter.codes.map((code) => code.replace(/\D/g, "")).filter((code) => code.length >= 2))];
    codes.forEach((code, index) => {
      args[`sni${index}`] = code;
    });
    const names = codes.map((_, index) => `@sni${index}`);
    match = `EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND replace(i.sni, '.', '') IN (${names.join(", ")}))`;
  } else if (filter.kind === "prefix") {
    args.prefix = `${filter.prefix}%`;
    match = "EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND replace(i.sni, '.', '') LIKE @prefix)";
  } else {
    return [];
  }
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    return db
      .prepare(
        `SELECT c.org_nr AS orgNr, c.name AS name, coalesce(c.street, '') AS street,
           coalesce(c.postal_code, '') AS postalCode, coalesce(c.city, '') AS city,
           coalesce(c.county_code, '') AS countyCode, coalesce(c.legal_form, '') AS legalForm,
           coalesce(c.employee_class, '') AS employees, c.phone_block AS phoneBlock, c.email_block AS emailBlock,
           (SELECT i.sni FROM industries i WHERE i.org_nr = c.org_nr AND trim(i.sni) != '' ORDER BY i.rank LIMIT 1) AS sni,
           (SELECT group_concat(p.raw, ' | ') FROM phones p WHERE p.org_nr = c.org_nr AND p.removed_on IS NULL AND p.kind != 'signatory') AS phones,
           (SELECT group_concat(p.raw, ' | ') FROM phones p WHERE p.org_nr = c.org_nr AND p.removed_on IS NULL AND p.kind = 'signatory') AS signatories,
           (SELECT group_concat(e.address, ' | ') FROM emails e WHERE e.org_nr = c.org_nr AND e.removed_on IS NULL) AS emails
         FROM companies c
         WHERE ${SELLABLE} AND ${match}
         ORDER BY c.name
         LIMIT ${SAMPLE_SIZE}`,
      )
      .all(args) as Row[];
  } finally {
    db.close();
  }
}

function formatOrg(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return orgNr;
}

function dotted(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.length === 5 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : code;
}

function countyName(code: string): string {
  const padded = code.replace(/\D/g, "").padStart(2, "0");
  return COUNTIES.find((item) => item.code === padded)?.label ?? code;
}
