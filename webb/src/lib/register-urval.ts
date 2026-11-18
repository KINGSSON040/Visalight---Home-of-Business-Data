import fs from "node:fs";
import Database from "better-sqlite3";
import { COMPANIES, countyCode, employeeBands, listParts, selectionSniFilter, type Selection } from "@/lib/catalog";
import { registerDatabasePath } from "@/lib/register-path";
import { exampleEstimate } from "@/lib/naringsliv";
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

const SIZE_VALUES: Record<string, string[]> = {
  "0": ["0"],
  "1–4": ["1–4", "1-4", "1"],
  "5–9": ["5–9", "5-9", "2"],
  "10–19": ["10–19", "10-19", "3"],
  "20–49": ["20–49", "20-49", "4"],
  "50–99": ["50–99", "50-99", "5"],
  "100–199": ["100–199", "100-199", "6"],
  "200 eller fler": ["200 eller fler", "200-499", "200–499", "500-999", "7", "8", "9"],
};

const NOT_A_COMPANY =
  "Vi säljer inte enskilda företag. Välj bransch, ort, län, bolagsform eller storlek i förslagen.";

const NO_SNI_YET =
  "Branschen är ifylld, men den har ingen SNI-kod i urvalet ännu. Antalet kan inte räknas.";

function emptyNote(selection: Selection): string {
  const name = (selection.bransch ?? "").trim();
  if (name && selectionSniFilter(selection).kind === "none") return NO_SNI_YET;
  return NOT_A_COMPANY;
}

const CITY_SQL =
  "lower(replace(replace(replace(replace(replace(replace(c.city, 'Ö', 'o'), 'ö', 'o'), 'Ä', 'a'), 'ä', 'a'), 'Å', 'a'), 'å', 'a'))";

/** Datum som redan finns i registret. Ingen ny hämtning. */
const START_DATE = `(CASE
  WHEN length(trim(coalesce(nullif(c.registered_on, ''), c.started_on, ''))) = 8
    THEN substr(coalesce(nullif(c.registered_on, ''), c.started_on), 1, 4) || '-' || substr(coalesce(nullif(c.registered_on, ''), c.started_on), 5, 2) || '-' || substr(coalesce(nullif(c.registered_on, ''), c.started_on), 7, 2)
  ELSE substr(coalesce(nullif(c.registered_on, ''), c.started_on, ''), 1, 10)
END)`;

function foundedMonths(value: string | undefined): string {
  return value === "3" || value === "6" || value === "12" ? value : "";
}

/**
 * Bara aktiva företag som inte spärrat reklam.
 * SCB FtgStat 1 (och exempelvärdet "verksam") betyder verksamt.
 * 0 har aldrig varit verksamt, 9 är inte längre verksamt. De, liksom
 * avregistrerade, vilande, inaktiva och reklamspärrade, räknas inte och följer inte med i utdraget.
 */
export const ACTIVE_STATUS = "lower(trim(coalesce(c.status_code, ''))) IN ('1', 'verksam')";

export const SELLABLE = [
  "c.manual_exclude = 0",
  "(c.ended_on IS NULL OR trim(c.ended_on) = '')",
  ACTIVE_STATUS,
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

function ready(
  source: UrvalResult["source"],
  companies: number,
  phones: number,
  signatoryPhones: number,
  emails: number,
  preview: UrvalPreview[],
  note: string,
  coverage: { withPhone: number; withEmail: number; withSignatory: number } = {
    withPhone: 0,
    withEmail: 0,
    withSignatory: 0,
  },
): UrvalResult {
  return {
    source,
    status: "ready",
    companies,
    phones,
    signatoryPhones,
    emails,
    withPhone: coverage.withPhone,
    withEmail: coverage.withEmail,
    withSignatory: coverage.withSignatory,
    preview,
    note,
  };
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

function employeeClassValues(label: string): string[] {
  return [...new Set(employeeBands(label).flatMap((band) => SIZE_VALUES[band] ?? []))];
}

function where(selection: Selection): BuiltWhere {
  const filter = selectionSniFilter(selection);
  if (filter.kind === "none") return { idle: false, empty: true };
  const cities = listParts(selection.city);
  const forms = selection.forms ?? [];
  const counties = listParts(selection.county ?? "").map(countyCode).filter((code): code is string => Boolean(code));
  const sizes = employeeClassValues(selection.employees ?? "");
  const months = foundedMonths(selection.founded);
  const narrowed = Boolean(cities.length || forms.length > 0 || counties.length || sizes.length > 0 || months);
  if (filter.kind === "any" && !narrowed) return { idle: true };

  const clauses = [SELLABLE];
  const args: Record<string, string> = {};
  if (cities.length || counties.length) {
    const parts: string[] = [];
    cities.forEach((city, index) => {
      args[`city${index}`] = `%${foldCity(city)}%`;
      parts.push(`${CITY_SQL} LIKE @city${index}`);
    });
    counties.forEach((code, index) => {
      args[`county${index}`] = code;
      args[`countyShort${index}`] = code.replace(/^0/, "");
      parts.push(`(c.county_code = @county${index} OR c.county_code = @countyShort${index})`);
    });
    clauses.push(`(${parts.join(" OR ")})`);
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
  if (sizes.length > 0) {
    sizes.forEach((value, index) => {
      args[`size${index}`] = value;
    });
    const names = sizes.map((_, index) => `@size${index}`);
    clauses.push(`c.employee_class IN (${names.join(", ")})`);
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
  if (months) {
    args.startedAfter = `-${months} months`;
    clauses.push(`length(trim(${START_DATE})) >= 10 AND ${START_DATE} >= date('now', @startedAfter)`);
  }
  return { idle: false, empty: false, sql: clauses.join(" AND "), args };
}

function fromDatabase(selection: Selection): UrvalResult | null {
  const file = registerDatabasePath();
  if (!file) return null;
  const built = where(selection);
  if (built.idle) return wholeRegister(file);
  if (built.empty) {
    return ready(
      "register",
      0,
      0,
      0,
      0,
      [],
      emptyNote(selection),
    );
  }
  return countWhere(file, built.sql, built.args, true);
}

let wholeCache: { key: string; result: UrvalResult } | null = null;

/** Aktiva, säljbara företag utan urval. Räknas en gång per registerfil. */
function wholeRegister(file: string): UrvalResult {
  const key = `${file}:${fs.statSync(file).mtimeMs}`;
  if (wholeCache?.key === key) return wholeCache.result;
  const result = countWhere(file, SELLABLE, {}, false);
  result.note = "Aktiva företag i dag som inte spärrat reklam. Vilande, inaktiva, avregistrerade och reklamspärrade ingår inte. Siffran följer den senaste uppdateringen. Välj bransch eller ort för att smalna av.";
  wholeCache = { key, result };
  return result;
}

function countWhere(file: string, sql: string, args: Record<string, string>, withPreview: boolean): UrvalResult {
  const built = { sql, args };
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
  const withPhone = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT p.org_nr) AS n FROM phones p
         WHERE p.removed_on IS NULL AND p.kind != 'signatory'
           AND p.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const withSignatory = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT p.org_nr) AS n FROM phones p
         WHERE p.removed_on IS NULL AND p.kind = 'signatory'
           AND p.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const withEmail = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT e.org_nr) AS n FROM emails e
         WHERE e.removed_on IS NULL AND e.org_nr IN (SELECT c.org_nr ${base})`,
      )
      .get(built.args) as { n: number }
  ).n;
  const rows = !withPreview ? [] : db
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
      ? "Inget aktivt, säljbart bolag matchar. Ett bolag räknas bara när det är verksamt, har namn, gatuadress, ort och SNI, och inte är vilande, inaktivt, avregistrerat eller reklamspärrat."
      : "Namnen kommer från det lokala registret. Filen innehåller hela urvalet, inte bara raderna som visas.";
  return ready("register", companies, phones, signatoryPhones, emails, preview, note, {
    withPhone,
    withEmail,
    withSignatory,
  });
}

function exampleUrval(selection: Selection): UrvalResult {
  const filter = selectionSniFilter(selection);
  const cities = listParts(selection.city).map(foldCity);
  const forms = selection.forms ?? [];
  const counties = listParts(selection.county ?? "");
  const bands = employeeBands(selection.employees ?? "");
  const narrowed = Boolean(cities.length || forms.length > 0 || counties.length || bands.length);
  if (filter.kind === "any" && !narrowed) {
    return {
      ...exampleEstimate(selection),
      note: "Exempelsiffror. Registret är inte inkopplat. Antalet är aktiva företag som inte spärrat reklam, inte hela registret.",
    };
  }
  if (filter.kind === "none") {
    return ready("example", 0, 0, 0, 0, [], emptyNote(selection));
  }
  const rows = COMPANIES.filter((company) => {
    if (forms.length > 0 && !forms.includes(company.form)) return false;
    if (cities.length || counties.length) {
      const cityHit = cities.some((city) => foldCity(company.city).includes(city));
      const countyHit = counties.includes(company.county);
      if (!cityHit && !countyHit) return false;
    }
    if (bands.length && !bands.includes(company.employees)) return false;
    if (filter.kind === "codes" && !filter.codes.includes(company.sni)) return false;
    if (filter.kind === "prefix" && !company.sni.startsWith(filter.prefix)) return false;
    return true;
  });
  return {
    ...exampleEstimate(selection),
    preview: rows.slice(0, 8).map((row) => ({ orgNr: row.orgNr, name: row.name, city: row.city, sni: row.sni })),
  };
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
