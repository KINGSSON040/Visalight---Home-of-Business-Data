import Database from "better-sqlite3";
import { COUNTIES, INDUSTRIES } from "@/lib/catalog";
import { EXAMPLE_STATS, WINDOW_DAYS, type MonthRow, type NaringslivStats, type StatRow } from "@/lib/naringsliv";
import { registerDatabasePath } from "@/lib/register-path";
import { SELLABLE } from "@/lib/register-urval";

const TTL_MS = 10 * 60 * 1000;
const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const REG_DATE = "COALESCE(NULLIF(trim(c.registered_on), ''), NULLIF(trim(c.started_on), ''))";
const FIRST_SNI =
  "(SELECT replace(i.sni, '.', '') FROM industries i WHERE i.org_nr = c.org_nr AND trim(i.sni) != '' ORDER BY i.rank LIMIT 1)";

let cache: { at: number; file: string; value: NaringslivStats } | null = null;

function industryRow(code: string, count: number): StatRow {
  const digits = code.replace(/\D/g, "");
  const known = INDUSTRIES.find(
    (item) => item.sni === digits || (item.legacy ?? []).some((legacy) => legacy.replace(/\D/g, "") === digits),
  );
  if (known) return { key: digits, label: known.label, count, href: `/?sni=${known.sni}#urval` };
  const label = digits.length === 5 ? `SNI ${digits.slice(0, 2)}.${digits.slice(2)}` : `SNI ${digits}`;
  return { key: digits, label, count, href: `/?bransch=${encodeURIComponent(`SNI ${digits}`)}#urval` };
}

function countyRow(code: string, count: number): StatRow | null {
  const padded = code.trim().padStart(2, "0");
  const county = COUNTIES.find((item) => item.code === padded);
  if (!county) return null;
  return { key: padded, label: county.label, count, href: `/?lan=${encodeURIComponent(county.label)}#urval` };
}

function read(file: string): NaringslivStats | null {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const scb = (db.prepare("SELECT COUNT(*) AS n FROM companies WHERE source = 'scb'").get() as { n: number }).n;
    const base = `FROM companies c WHERE ${SELLABLE}`;
    const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
    const total = one(`SELECT COUNT(*) AS n ${base}`);
    const inBase = `p.org_nr IN (SELECT c.org_nr ${base})`;
    const phones = one(`SELECT COUNT(*) AS n FROM phones p WHERE p.removed_on IS NULL AND p.kind != 'signatory' AND ${inBase}`);
    const signatoryPhones = one(`SELECT COUNT(*) AS n FROM phones p WHERE p.removed_on IS NULL AND p.kind = 'signatory' AND ${inBase}`);
    const withPhone = one(`SELECT COUNT(DISTINCT p.org_nr) AS n FROM phones p WHERE p.removed_on IS NULL AND p.kind != 'signatory' AND ${inBase}`);
    const withSignatory = one(`SELECT COUNT(DISTINCT p.org_nr) AS n FROM phones p WHERE p.removed_on IS NULL AND p.kind = 'signatory' AND ${inBase}`);
    const emailBase = `e.org_nr IN (SELECT c.org_nr ${base})`;
    const emails = one(`SELECT COUNT(*) AS n FROM emails e WHERE e.removed_on IS NULL AND ${emailBase}`);
    const withEmail = one(`SELECT COUNT(DISTINCT e.org_nr) AS n FROM emails e WHERE e.removed_on IS NULL AND ${emailBase}`);

    const finished = db
      .prepare("SELECT finished_at FROM sync_runs WHERE status = 'klar' AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1")
      .get() as { finished_at: string } | undefined;
    const fetched = db.prepare("SELECT MAX(fetched_at) AS at FROM companies").get() as { at: string | null };
    const updatedIso = finished?.finished_at || fetched.at || new Date().toISOString();

    const anchor = updatedIso.slice(0, 10);
    const added = (
      db
        .prepare(`SELECT COUNT(*) AS n ${base} AND ${REG_DATE} > date(@anchor, @window) AND ${REG_DATE} <= @anchor`)
        .get({ anchor, window: `-${WINDOW_DAYS} day` }) as { n: number }
    ).n;

    const byIndustry = (
      db
        .prepare(`SELECT ${FIRST_SNI} AS sni, COUNT(*) AS n ${base} GROUP BY sni HAVING sni IS NOT NULL ORDER BY n DESC LIMIT 8`)
        .all() as { sni: string; n: number }[]
    ).map((row) => industryRow(row.sni, row.n));

    const byCounty = (
      db
        .prepare(`SELECT c.county_code AS code, COUNT(*) AS n ${base} AND c.county_code IS NOT NULL GROUP BY c.county_code ORDER BY n DESC`)
        .all() as { code: string; n: number }[]
    )
      .map((row) => countyRow(row.code, row.n))
      .filter((row): row is StatRow => row !== null);

    const growth = db
      .prepare(
        `SELECT ${FIRST_SNI} AS sni, COUNT(*) AS n,
           SUM(CASE WHEN ${REG_DATE} > date(@anchor, @window) AND ${REG_DATE} <= @anchor THEN 1 ELSE 0 END) AS added
         ${base} GROUP BY sni HAVING sni IS NOT NULL AND added > 0 ORDER BY added DESC LIMIT 5`,
      )
      .all({ anchor, window: `-${WINDOW_DAYS} day` }) as { sni: string; n: number; added: number }[];
    const growing = growth.map((row) => ({ ...industryRow(row.sni, row.n), added: row.added }));

    const monthRows = db
      .prepare(
        `SELECT substr(${REG_DATE}, 1, 7) AS month, COUNT(*) AS n ${base}
           AND ${REG_DATE} > date(@anchor, 'start of month', '-5 month', '-1 day') AND ${REG_DATE} <= @anchor
         GROUP BY month ORDER BY month`,
      )
      .all({ anchor }) as { month: string; n: number }[];
    const monthly: MonthRow[] = monthRows.map((row) => ({
      month: row.month,
      label: MONTHS[Number(row.month.slice(5, 7)) - 1] ?? row.month,
      count: row.n,
    }));

    return {
      source: "register",
      example: scb === 0,
      total,
      phones,
      signatoryPhones,
      emails,
      withPhone,
      withEmail,
      withSignatory,
      added,
      windowDays: WINDOW_DAYS,
      byIndustry,
      byCounty,
      growing,
      monthly,
      updatedIso,
    };
  } finally {
    db.close();
  }
}

/** Statistik från registret, eller EXAMPLE_STATS när registret saknas eller inte går att läsa. */
export function loadNaringsliv(): NaringslivStats {
  const file = registerDatabasePath();
  if (!file) return EXAMPLE_STATS;
  if (cache && cache.file === file && Date.now() - cache.at < TTL_MS) return cache.value;
  try {
    const value = read(file) ?? EXAMPLE_STATS;
    cache = { at: Date.now(), file, value };
    return value;
  } catch {
    return EXAMPLE_STATS;
  }
}
