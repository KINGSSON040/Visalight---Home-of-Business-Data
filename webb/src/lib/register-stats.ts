import Database from "better-sqlite3";
import { COUNTIES, INDUSTRIES } from "@/lib/catalog";
import { registerDatabasePath } from "@/lib/register-path";

export type StatBar = { key: string; label: string; count: number; href: string };
export type GrowthRow = { key: string; label: string; added: number; share: number; href: string };

export type RegisterOverview = {
  /** false betyder att talen är exempeldata och inte kommer från registret. */
  real: boolean;
  total: number;
  newLastMonth: number;
  byIndustry: StatBar[];
  byCounty: StatBar[];
  growing: GrowthRow[];
};

const SELLABLE = [
  "c.manual_exclude = 0",
  "(c.ended_on IS NULL OR trim(c.ended_on) = '')",
  "(c.status_code IS NULL OR c.status_code != 'avregistrerad')",
  "c.reklam_block = 0",
  "trim(c.name) != ''",
  "c.street IS NOT NULL AND trim(c.street) != ''",
  "c.city IS NOT NULL AND trim(c.city) != ''",
].join(" AND ");

/** Påhittade tal som bara visas när registret saknas. De märks alltid som exempeldata på sidan. */
const EXAMPLE_TOTAL = 1_234_567;
const EXAMPLE_NEW = 1_234;
const EXAMPLE_INDUSTRY_WEIGHTS = [9, 14, 11, 6, 4, 5, 7, 8];
const EXAMPLE_COUNTY_WEIGHTS: Record<string, number> = { "01": 24, "14": 17, "12": 13, "03": 4, "05": 4, "06": 4, "13": 3, "24": 2 };

function industryHref(sni: string): string {
  return `/?sni=${sni}#urval`;
}

function countyHref(label: string): string {
  return `/?lan=${encodeURIComponent(label)}#urval`;
}

function exampleOverview(): RegisterOverview {
  const industries = INDUSTRIES.slice(0, EXAMPLE_INDUSTRY_WEIGHTS.length);
  const byIndustry = industries
    .map((item, index) => ({
      key: item.sni,
      label: item.label,
      count: EXAMPLE_INDUSTRY_WEIGHTS[index] * 1_000 + 234,
      href: industryHref(item.sni),
    }))
    .sort((a, b) => b.count - a.count);
  const byCounty = COUNTIES.filter((county) => EXAMPLE_COUNTY_WEIGHTS[county.code])
    .map((county) => ({
      key: county.code,
      label: county.label,
      count: EXAMPLE_COUNTY_WEIGHTS[county.code] * 10_000 + 567,
      href: countyHref(county.label),
    }))
    .sort((a, b) => b.count - a.count);
  const growing = industries.slice(0, 5).map((item, index) => ({
    key: item.sni,
    label: item.label,
    added: 120 - index * 18,
    share: 4.5 - index * 0.7,
    href: industryHref(item.sni),
  }));
  return { real: false, total: EXAMPLE_TOTAL, newLastMonth: EXAMPLE_NEW, byIndustry, byCounty, growing };
}

function fromDatabase(file: string): RegisterOverview {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const total = (db.prepare(`SELECT COUNT(*) AS n FROM companies c WHERE ${SELLABLE}`).get() as { n: number }).n;
    const newLastMonth = (
      db
        .prepare(
          `SELECT COUNT(*) AS n FROM companies c WHERE ${SELLABLE}
             AND coalesce(nullif(trim(c.registered_on), ''), nullif(trim(c.started_on), '')) >= date('now', '-1 month')`,
        )
        .get() as { n: number }
    ).n;

    const industryCount = db.prepare(
      `SELECT COUNT(DISTINCT c.org_nr) AS total,
         COUNT(DISTINCT CASE WHEN coalesce(nullif(trim(c.registered_on), ''), nullif(trim(c.started_on), '')) >= date('now', '-12 months') THEN c.org_nr END) AS added
       FROM companies c JOIN industries i ON i.org_nr = c.org_nr
       WHERE ${SELLABLE} AND replace(i.sni, '.', '') IN (SELECT value FROM json_each(@codes))`,
    );
    const industries = INDUSTRIES.map((item) => {
      const codes = JSON.stringify([item.sni, ...(item.legacy ?? [])]);
      const row = industryCount.get({ codes }) as { total: number; added: number };
      return { item, total: row.total, added: row.added };
    });
    const byIndustry = industries
      .filter((row) => row.total > 0)
      .map((row) => ({ key: row.item.sni, label: row.item.label, count: row.total, href: industryHref(row.item.sni) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const growing = industries
      .filter((row) => row.total > 0 && row.added > 0)
      .map((row) => ({
        key: row.item.sni,
        label: row.item.label,
        added: row.added,
        share: Math.round((row.added / row.total) * 1000) / 10,
        href: industryHref(row.item.sni),
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 5);

    const countyRows = db
      .prepare(`SELECT c.county_code AS code, COUNT(*) AS n FROM companies c WHERE ${SELLABLE} GROUP BY c.county_code`)
      .all() as { code: string | null; n: number }[];
    const byCounty = COUNTIES.map((county) => {
      const count = countyRows
        .filter((row) => (row.code ?? "").padStart(2, "0") === county.code)
        .reduce((sum, row) => sum + row.n, 0);
      return { key: county.code, label: county.label, count, href: countyHref(county.label) };
    })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { real: true, total, newLastMonth, byIndustry, byCounty, growing };
  } finally {
    db.close();
  }
}

/** Siffrorna om näringslivet. Läses från registret när det finns, annars exempeldata. */
export function registerOverview(): RegisterOverview {
  const file = registerDatabasePath();
  if (!file) return exampleOverview();
  try {
    const overview = fromDatabase(file);
    return overview.total > 0 ? overview : exampleOverview();
  } catch {
    return exampleOverview();
  }
}
