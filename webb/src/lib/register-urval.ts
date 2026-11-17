import Database from "better-sqlite3";
import { COMPANIES, selectionSniFilter, type Selection } from "@/lib/catalog";
import { registerDatabasePath } from "@/lib/register-path";
import type { UrvalPreview, UrvalResult } from "@/lib/urval";

/**
 * SCB:s juridiska form. Handelsbolag och kommanditbolag delar kod 31,
 * så de kan inte skiljas åt i registret.
 */
const FORM_CODES: Record<string, string[]> = {
  ab: ["49", "41", "42"],
  ef: ["10"],
  hb: ["31"],
  kb: ["31"],
  ek: ["51"],
  brf: ["53"],
  if: ["61"],
  stiftelse: ["71", "72"],
  filial: ["96"],
  europabolag: ["43"],
  samfallighet: ["62"],
  trossamfund: ["63"],
  enkelt: ["21"],
  kommun: ["82"],
  region: ["84"],
  stat: ["81", "89"],
};

const CITY_SQL =
  "lower(replace(replace(replace(replace(replace(replace(c.city, 'Ö', 'o'), 'ö', 'o'), 'Ä', 'a'), 'ä', 'a'), 'Å', 'a'), 'å', 'a'))";

const SELLABLE = [
  "c.manual_exclude = 0",
  "(c.ended_on IS NULL OR trim(c.ended_on) = '')",
  "(c.status_code IS NULL OR c.status_code != 'avregistrerad')",
  "c.reklam_block = 0",
  "trim(c.name) != ''",
  "c.street IS NOT NULL AND trim(c.street) != ''",
  "c.city IS NOT NULL AND trim(c.city) != ''",
  "EXISTS (SELECT 1 FROM industries i0 WHERE i0.org_nr = c.org_nr AND trim(i0.sni) != '')",
].join(" AND ");

let connection: Database.Database | null = null;
let openedPath: string | null = null;

function foldCity(value: string): string {
  return value
    .toLocaleLowerCase("sv")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e");
}

function formatOrg(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  return orgNr;
}

function idle(source: UrvalResult["source"], note: string): UrvalResult {
  return {
    source,
    status: "idle",
    companies: 0,
    phones: 0,
    signatoryPhones: 0,
    emails: 0,
    preview: [],
    note,
  };
}

function ready(
  source: UrvalResult["source"],
  companies: number,
  phones: number,
  signatoryPhones: number,
  emails: number,
  preview: UrvalPreview[],
  note: string,
): UrvalResult {
  return { source, status: "ready", companies, phones, signatoryPhones, emails, preview, note };
}

function openDatabase(file: string): Database.Database {
  if (connection && openedPath === file) return connection;
  connection?.close();
  connection = new Database(file, { readonly: true, fileMustExist: true });
  openedPath = file;
  return connection;
}

type BuiltWhere =
  | { idle: true }
  | { idle: false; empty: true }
  | { idle: false; empty: false; sql: string; args: Record<string, string> };

function where(selection: Selection): BuiltWhere {
  const filter = selectionSniFilter(selection);
  if (filter.kind === "none") return { idle: false, empty: true };
  const city = selection.city.trim();
  const forms = selection.forms ?? [];
  if (filter.kind === "any" && !city && forms.length === 0) return { idle: true };

  const clauses = [SELLABLE];
  const args: Record<string, string> = {};
  if (city) {
    clauses.push(`${CITY_SQL} LIKE @city`);
    args.city = `%${foldCity(city)}%`;
  }
  if (filter.kind === "codes") {
    filter.codes.forEach((code, index) => {
      args[`sni${index}`] = code;
    });
    const names = filter.codes.map((_, index) => `@sni${index}`);
    clauses.push(
      `EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND i.sni IN (${names.join(", ")}))`,
    );
  }
  if (filter.kind === "prefix") {
    args.prefix = `${filter.prefix}%`;
    clauses.push(
      "EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND (i.sni LIKE @prefix OR replace(i.sni, '.', '') LIKE @prefix))",
    );
  }
  if (forms.length > 0) {
    const codes = [...new Set(forms.flatMap((form) => FORM_CODES[form] ?? []))];
    if (codes.length === 0) return { idle: false, empty: true };
    codes.forEach((code, index) => {
      args[`form${index}`] = code;
    });
    const names = codes.map((_, index) => `@form${index}`);
    clauses.push(`c.legal_form IN (${names.join(", ")})`);
  }
  return { idle: false, empty: false, sql: clauses.join(" AND "), args };
}

function fromDatabase(selection: Selection): UrvalResult | null {
  const file = registerDatabasePath();
  if (!file) return null;
  const built = where(selection);
  if (built.idle) {
    return idle("register", "Välj bransch eller ort och tryck Sök bolag. Antal och pris räknas då här.");
  }
  if (built.empty) {
    return ready(
      "register",
      0,
      0,
      0,
      0,
      [],
      "Ingen bransch matchar det ni skrev. Välj ett förslag under sökfältet.",
    );
  }
  const db = openDatabase(file);
  const base = `FROM companies c WHERE ${built.sql}`;
  const companies = (db.prepare(`SELECT COUNT(*) AS n ${base}`).get(built.args) as { n: number }).n;
  const phones = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM phones p
         WHERE p.removed_on IS NULL AND p.kind != 'signatory'
           AND p.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const signatoryPhones = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM phones p
         WHERE p.removed_on IS NULL AND p.kind = 'signatory'
           AND p.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const emails = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM emails e
         WHERE e.removed_on IS NULL AND e.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const rows = db
    .prepare(
      `SELECT c.org_nr AS orgNr, c.name AS name, c.city AS city,
         (SELECT i.sni FROM industries i WHERE i.org_nr = c.org_nr ORDER BY i.rank LIMIT 1) AS sni
       ${base}
       ORDER BY c.name
       LIMIT 8`,
    )
    .all(built.args) as { orgNr: string; name: string; city: string; sni: string | null }[];
  const preview = rows.map((row) => ({
    orgNr: formatOrg(row.orgNr),
    name: row.name,
    city: row.city,
    sni: row.sni ?? "",
  }));
  const note =
    companies === 0
      ? "Inget säljbart bolag matchar. Ett bolag räknas när namn, gatuadress, ort och SNI finns, och det inte är avregistrerat eller reklamspärrat."
      : "Namnen kommer från det lokala registret. Filen innehåller hela urvalet, inte bara raderna som visas.";
  return ready("register", companies, phones, signatoryPhones, emails, preview, note);
}

function exampleUrval(selection: Selection): UrvalResult {
  const filter = selectionSniFilter(selection);
  const city = foldCity(selection.city.trim());
  const forms = selection.forms ?? [];
  if (filter.kind === "any" && !city && forms.length === 0) {
    return idle(
      "example",
      "Registret är inte inkopplat i den här körningen, så bara exempelbolag kan visas. Välj bransch och tryck Sök bolag.",
    );
  }
  if (filter.kind === "none") {
    return ready("example", 0, 0, 0, 0, [], "Ingen bransch matchar det ni skrev. Välj ett förslag under sökfältet.");
  }
  const rows = COMPANIES.filter((company) => {
    if (forms.length > 0 && !forms.includes(company.form)) return false;
    if (city && !foldCity(company.city).includes(city)) return false;
    if (filter.kind === "codes" && !filter.codes.includes(company.sni)) return false;
    if (filter.kind === "prefix" && !company.sni.startsWith(filter.prefix)) return false;
    return true;
  });
  return ready(
    "example",
    rows.length,
    rows.reduce((sum, row) => sum + row.phones.length, 0),
    rows.reduce((sum, row) => sum + row.signatoryPhones.length, 0),
    rows.reduce((sum, row) => sum + row.emails.length, 0),
    rows.slice(0, 8).map((row) => ({
      orgNr: row.orgNr,
      name: row.name,
      city: row.city,
      sni: row.sni,
    })),
    "Det här är exempelbolag. Synka registret så att register/data/visalight.sqlite finns, och starta om sidan.",
  );
}

export function loadUrval(selection: Selection): UrvalResult {
  try {
    const fromDb = fromDatabase(selection);
    if (fromDb) return fromDb;
  } catch (error) {
    const message = error instanceof Error ? error.message : "okänt fel";
    return ready("register", 0, 0, 0, 0, [], `Registret kunde inte läsas. ${message}`);
  }
  return exampleUrval(selection);
}
