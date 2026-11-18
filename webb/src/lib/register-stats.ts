import fs from "node:fs";
import Database from "better-sqlite3";
import { COUNTIES, EMPLOYEE_RANGES } from "@/lib/catalog";
import { exampleStats, industryName, type RegisterStats, type SizeStat } from "@/lib/naringsliv";
import { registerDatabasePath } from "@/lib/register-path";
import { SELLABLE, employeeRangeForClass } from "@/lib/register-urval";

const REG_DATE = `(CASE
  WHEN length(trim(coalesce(nullif(c.registered_on, ''), c.started_on, ''))) = 8
    THEN substr(coalesce(nullif(c.registered_on, ''), c.started_on), 1, 4) || '-' || substr(coalesce(nullif(c.registered_on, ''), c.started_on), 5, 2) || '-' || substr(coalesce(nullif(c.registered_on, ''), c.started_on), 7, 2)
  ELSE substr(coalesce(nullif(c.registered_on, ''), c.started_on, ''), 1, 10)
END)`;

const MAIN_SNI = "(SELECT org_nr, replace(sni, '.', '') AS sni, MIN(rank) FROM industries WHERE trim(sni) != '' GROUP BY org_nr)";

let cached: { key: string; stats: RegisterStats } | null = null;

/** Statistik från registret. Utan register är talen tomma och får inte visas. */
export function loadStats(): RegisterStats {
  const file = registerDatabasePath();
  if (!file) return exampleStats();
  try {
    const key = `${file}:${fs.statSync(file).mtimeMs}`;
    if (cached?.key === key) return cached.stats;
    const stats = fromDatabase(file);
    cached = { key, stats };
    return stats;
  } catch {
    return exampleStats();
  }
}

function fromDatabase(file: string): RegisterStats {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const labels = new Map<string, string>();
    try {
      for (const row of db.prepare("SELECT code, label FROM code_labels WHERE lower(kind) = 'sni'").all() as { code: string; label: string }[]) {
        labels.set(row.code.replace(/\D/g, ""), row.label);
      }
    } catch {
      // code_labels kan saknas i äldre register.
    }
    const label = (sni: string) => labels.get(sni) ?? industryName(sni);

    const total = (db.prepare(`SELECT COUNT(*) AS n FROM companies c WHERE ${SELLABLE}`).get() as { n: number }).n;
    const newLastMonth = (
      db.prepare(`SELECT COUNT(*) AS n FROM companies c WHERE ${SELLABLE} AND ${REG_DATE} >= date('now', '-1 month')`).get() as { n: number }
    ).n;

    const monthRows = db
      .prepare(
        `SELECT substr(${REG_DATE}, 1, 7) AS month, COUNT(*) AS n FROM companies c
         WHERE ${SELLABLE} AND ${REG_DATE} >= date('now', 'start of month', '-11 months')
         GROUP BY month`,
      )
      .all() as { month: string; n: number }[];
    const byMonth = new Map(monthRows.map((row) => [row.month, row.n]));
    const now = new Date();
    const monthly = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1));
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      return { month, count: byMonth.get(month) ?? 0 };
    });

    const byIndustry = (
      db
        .prepare(
          `SELECT m.sni AS sni, COUNT(*) AS n FROM companies c JOIN ${MAIN_SNI} m ON m.org_nr = c.org_nr
           WHERE ${SELLABLE} GROUP BY m.sni ORDER BY n DESC LIMIT 12`,
        )
        .all() as { sni: string; n: number }[]
    ).map((row) => ({ sni: row.sni, label: label(row.sni), count: row.n }));

    const countyRows = db
      .prepare(`SELECT c.county_code AS code, COUNT(*) AS n FROM companies c WHERE ${SELLABLE} GROUP BY c.county_code`)
      .all() as { code: string | null; n: number }[];
    const countyCounts = new Map<string, number>();
    for (const row of countyRows) {
      const code = String(row.code ?? "").trim().padStart(2, "0");
      countyCounts.set(code, (countyCounts.get(code) ?? 0) + row.n);
    }
    const byCounty = COUNTIES.map((county) => ({ ...county, count: countyCounts.get(county.code) ?? 0 })).sort((a, b) => b.count - a.count);

    const sizeRows = db
      .prepare(`SELECT trim(coalesce(c.employee_class, '')) AS class, COUNT(*) AS n FROM companies c WHERE ${SELLABLE} GROUP BY class`)
      .all() as { class: string; n: number }[];
    const sizeCounts = new Map<string, number>();
    for (const row of sizeRows) {
      const label = employeeRangeForClass(row.class) ?? (row.class ? "Annan storleksklass" : "Storleksklass saknas");
      sizeCounts.set(label, (sizeCounts.get(label) ?? 0) + row.n);
    }
    const bySize: SizeStat[] = [
      ...EMPLOYEE_RANGES.map((range) => ({ label: range.label, count: sizeCounts.get(range.label) ?? 0 })),
      ...["Annan storleksklass", "Storleksklass saknas"]
        .filter((label) => (sizeCounts.get(label) ?? 0) > 0)
        .map((label) => ({ label, count: sizeCounts.get(label) ?? 0 })),
    ];

    const growthRows = db
      .prepare(
        `SELECT m.sni AS sni,
           SUM(CASE WHEN ${REG_DATE} >= date('now', '-3 months') THEN 1 ELSE 0 END) AS recent,
           SUM(CASE WHEN ${REG_DATE} < date('now', '-3 months') AND ${REG_DATE} >= date('now', '-6 months') THEN 1 ELSE 0 END) AS previous
         FROM companies c JOIN ${MAIN_SNI} m ON m.org_nr = c.org_nr
         WHERE ${SELLABLE} AND ${REG_DATE} >= date('now', '-6 months')
         GROUP BY m.sni HAVING recent >= 5 AND previous >= 5`,
      )
      .all() as { sni: string; recent: number; previous: number }[];
    const growing = growthRows
      .map((row) => ({
        sni: row.sni,
        label: label(row.sni),
        recent: row.recent,
        previous: row.previous,
        changePct: Math.round(((row.recent - row.previous) / row.previous) * 100),
      }))
      .filter((row) => row.changePct > 0)
      .sort((a, b) => b.changePct - a.changePct)
      .slice(0, 5);

    return { source: "register", total, newLastMonth, monthly, byIndustry, byCounty, bySize, growing };
  } finally {
    db.close();
  }
}
