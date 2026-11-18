import { companyIsSellable, db, type CompanyRow } from "./db";
import { quote, type PriceCounts, type PriceQuote } from "./pricing";

export type Filters = {
  q: string;
  city: string;
  sni: string;
  flag: string;
  hasPhone: boolean;
  hasEmail: boolean;
  includeSuppressed: boolean;
};

export function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  return {
    q: one("q").trim(),
    city: one("ort").trim(),
    sni: one("sni").trim(),
    flag: one("flagga").trim(),
    hasPhone: one("telefon") === "1",
    hasEmail: one("epost") === "1",
    includeSuppressed: one("alla") === "1",
  };
}

export function filtersToSearch(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.city) params.set("ort", filters.city);
  if (filters.sni) params.set("sni", filters.sni);
  if (filters.flag) params.set("flagga", filters.flag);
  if (filters.hasPhone) params.set("telefon", "1");
  if (filters.hasEmail) params.set("epost", "1");
  if (filters.includeSuppressed) params.set("alla", "1");
  return params.toString();
}

/**
 * Aktiva företag som går att sälja. Samma regel som kundsidans urval:
 * SCB FtgStat 1 eller exempelvärdet "verksam", inte avslutade, och inte reklamspärrade.
 */
export const SELLABLE_SQL = `c.manual_exclude = 0
  AND (c.ended_on IS NULL OR trim(c.ended_on) = '')
  AND lower(trim(coalesce(c.status_code, ''))) IN ('1', 'verksam')
  AND c.reklam_block = 0
  AND trim(c.name) != ''
  AND c.street IS NOT NULL AND trim(c.street) != ''
  AND c.city IS NOT NULL AND trim(c.city) != ''
  AND EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND trim(i.sni) != '')`;

export function ftsMatch(query: string): string | null {
  const words = query
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
  if (words.length === 0) return null;
  return words.map((word) => `"${word}"*`).join(" AND ");
}

function likeContains(value: string) {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function where(filters: Filters, sellableOnly: boolean) {
  const clauses = ["1=1"];
  const args: Record<string, string | number> = {};
  const match = filters.q ? ftsMatch(filters.q) : null;
  let from = "companies c";
  if (sellableOnly || !filters.includeSuppressed) {
    clauses.push(SELLABLE_SQL);
  }
  if (match) {
    args.fts = match;
    const digits = filters.q.replace(/\D/g, "");
    const hasLetter = /\p{L}/u.test(filters.q);
    const orgDigits = !hasLetter || digits.length >= 6 ? digits : "";
    const nameHit = `SELECT c.* FROM company_fts JOIN companies c ON c.org_nr = company_fts.org_nr WHERE company_fts MATCH @fts`;
    from = orgDigits
      ? `(${nameHit} UNION SELECT c.* FROM companies c WHERE c.org_nr LIKE @orgPrefix) c`
      : `(${nameHit}) c`;
    if (orgDigits) args.orgPrefix = `${orgDigits}%`;
  } else if (filters.q) {
    const digits = filters.q.replace(/\D/g, "");
    const parts = ["c.name LIKE @q ESCAPE '\\'"];
    args.q = likeContains(filters.q);
    if (digits) {
      parts.push("c.org_nr LIKE @qDigits ESCAPE '\\'");
      args.qDigits = likeContains(digits);
    }
    clauses.push(`(${parts.join(" OR ")})`);
  }
  if (filters.city) {
    clauses.push("c.city LIKE @city");
    args.city = `%${filters.city}%`;
  }
  if (filters.sni) {
    clauses.push("EXISTS (SELECT 1 FROM industries i WHERE i.org_nr = c.org_nr AND i.sni LIKE @sni)");
    args.sni = `${filters.sni}%`;
  }
  if (filters.flag) {
    clauses.push("EXISTS (SELECT 1 FROM flags f WHERE f.org_nr = c.org_nr AND f.label = @flag)");
    args.flag = filters.flag;
  }
  if (filters.hasPhone) {
    clauses.push(`EXISTS (
      SELECT 1 FROM phones p
      WHERE p.org_nr = c.org_nr AND p.removed_on IS NULL AND p.kind != 'signatory'
    )`);
  }
  if (filters.hasEmail) {
    clauses.push(`EXISTS (
      SELECT 1 FROM emails e
      WHERE e.org_nr = c.org_nr AND e.removed_on IS NULL
    )`);
  }
  return { sql: clauses.join(" AND "), args, from };
}

export type CompanyListItem = CompanyRow & { sni: string | null; flag_count: number };

export function listCompanies(filters: Filters, limit = 50): CompanyListItem[] {
  const filter = where(filters, false);
  return db()
    .prepare(
      `SELECT c.*, (
         SELECT i.sni FROM industries i WHERE i.org_nr = c.org_nr ORDER BY i.rank LIMIT 1
       ) AS sni,
       (SELECT COUNT(*) FROM flags f WHERE f.org_nr = c.org_nr) AS flag_count
       FROM ${filter.from}
       WHERE ${filter.sql}
       ORDER BY c.name
       LIMIT @limit`,
    )
    .all({ ...filter.args, limit }) as CompanyListItem[];
}

export function countCompanies(filters: Filters, sellableOnly: boolean): number {
  const filter = where(filters, sellableOnly);
  const row = db().prepare(`SELECT COUNT(*) AS n FROM ${filter.from} WHERE ${filter.sql}`).get(filter.args) as { n: number };
  return row.n;
}

export function priceFor(filters: Filters): { counts: PriceCounts; quote: PriceQuote } {
  const sellable = { ...filters, includeSuppressed: false };
  const filter = where(sellable, true);
  const connection = db();
  const companies = (
    connection.prepare(`SELECT COUNT(*) AS n FROM ${filter.from} WHERE ${filter.sql}`).get(filter.args) as { n: number }
  ).n;
  const phones = (
    connection
      .prepare(
        `SELECT COUNT(*) AS n FROM phones p
         JOIN ${filter.from} ON c.org_nr = p.org_nr
         WHERE ${filter.sql}
           AND p.removed_on IS NULL AND p.kind != 'signatory'`,
      )
      .get(filter.args) as { n: number }
  ).n;
  const signatoryPhones = (
    connection
      .prepare(
        `SELECT COUNT(*) AS n FROM phones p
         JOIN ${filter.from} ON c.org_nr = p.org_nr
         WHERE ${filter.sql}
           AND p.removed_on IS NULL AND p.kind = 'signatory'`,
      )
      .get(filter.args) as { n: number }
  ).n;
  const emails = (
    connection
      .prepare(
        `SELECT COUNT(*) AS n FROM emails e
         JOIN ${filter.from} ON c.org_nr = e.org_nr
         WHERE ${filter.sql}
           AND e.removed_on IS NULL`,
      )
      .get(filter.args) as { n: number }
  ).n;
  const counts = { companies, phones, signatoryPhones, emails };
  return { counts, quote: quote(counts) };
}

export function getCompany(orgNr: string): CompanyRow | undefined {
  return db().prepare("SELECT * FROM companies WHERE org_nr = ?").get(orgNr) as CompanyRow | undefined;
}

export function companyIndustries(orgNr: string) {
  return db()
    .prepare("SELECT rank, sni, share FROM industries WHERE org_nr = ? ORDER BY rank")
    .all(orgNr) as { rank: number; sni: string; share: number | null }[];
}

export function companyPhones(orgNr: string) {
  return db()
    .prepare("SELECT * FROM phones WHERE org_nr = ? ORDER BY removed_on IS NOT NULL, kind, e164")
    .all(orgNr) as {
    id: number;
    e164: string;
    raw: string;
    kind: string;
    source: string;
    source_url: string | null;
    evidence: string | null;
    first_seen: string;
    last_seen: string;
    removed_on: string | null;
  }[];
}

export function companyEmails(orgNr: string) {
  return db()
    .prepare("SELECT * FROM emails WHERE org_nr = ? ORDER BY removed_on IS NOT NULL, address")
    .all(orgNr) as {
    id: number;
    address: string;
    kind: string;
    source: string;
    source_url: string | null;
    evidence: string | null;
    first_seen: string;
    last_seen: string;
    removed_on: string | null;
  }[];
}

export function companyFlags(orgNr: string) {
  return db()
    .prepare("SELECT id, label, note, created_at FROM flags WHERE org_nr = ? ORDER BY created_at DESC")
    .all(orgNr) as { id: number; label: string; note: string; created_at: string }[];
}

export function overview() {
  const connection = db();
  const total = (connection.prepare("SELECT COUNT(*) AS n FROM companies").get() as { n: number }).n;
  const sellable = (connection.prepare(`SELECT COUNT(*) AS n FROM companies c WHERE ${SELLABLE_SQL}`).get() as { n: number }).n;
  const phones = (
    connection
      .prepare(
        `SELECT COUNT(*) AS n FROM phones p JOIN companies c ON c.org_nr = p.org_nr
         WHERE p.removed_on IS NULL AND p.kind != 'signatory' AND ${SELLABLE_SQL}`,
      )
      .get() as { n: number }
  ).n;
  const emails = (
    connection
      .prepare(
        `SELECT COUNT(*) AS n FROM emails e JOIN companies c ON c.org_nr = e.org_nr
         WHERE e.removed_on IS NULL AND ${SELLABLE_SQL}`,
      )
      .get() as { n: number }
  ).n;
  const examples = (connection.prepare("SELECT COUNT(*) AS n FROM companies WHERE source = 'exempel'").get() as { n: number }).n;
  const lastSync = connection
    .prepare("SELECT * FROM sync_runs ORDER BY id DESC LIMIT 1")
    .get() as
    | { id: number; started_at: string; finished_at: string | null; status: string; pages: number; rows: number; message: string }
    | undefined;
  return {
    total,
    sellable,
    held: total - sellable,
    phones,
    emails,
    examples,
    lastSync,
  };
}

export function savedSegments() {
  return db()
    .prepare("SELECT id, name, filters_json, created_at FROM segments ORDER BY id DESC")
    .all() as { id: number; name: string; filters_json: string; created_at: string }[];
}

export function suppressionReason(company: CompanyRow & { sni?: string | null }): string | null {
  if (companyIsSellable(company)) return null;
  const reasons = [];
  if (!company.name?.trim()) reasons.push("saknar namn");
  if (!company.street?.trim()) reasons.push("saknar gatuadress");
  if (!company.city?.trim()) reasons.push("saknar ort");
  if (!company.sni?.trim()) reasons.push("saknar SNI-kod");
  if (company.manual_exclude) reasons.push("manuellt utesluten");
  if (company.reklam_block) reasons.push("reklamspärr");
  if (company.ended_on?.trim() || (company.status_code ?? "").trim().toLowerCase() === "avregistrerad") reasons.push("avregistrerat");
  const status = (company.status_code ?? "").trim().toLowerCase();
  if (status !== "1" && status !== "verksam") reasons.push("inte aktivt");
  return reasons.join(", ") || "ofullständig";
}
