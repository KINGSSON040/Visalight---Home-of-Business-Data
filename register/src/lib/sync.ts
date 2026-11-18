import { db } from "./db";
import { normalizePhone } from "./phones";

type ScbAddress = {
  gatuAdress?: string | null;
  coAdress?: string | null;
  postNr?: string | null;
  postOrt?: string | null;
};

type ScbIndustry = {
  rangordning?: number | null;
  naringsgren?: string | null;
  andelProcent?: number | null;
};

type ScbCompany = {
  peOrgNr?: string | null;
  orgNr?: string | null;
  namn?: string | null;
  postAdress?: ScbAddress | null;
  kommunSate?: string | null;
  lanSate?: string | null;
  aeAnt?: number | null;
  anstKl?: string | null;
  ftgStat?: string | null;
  jurform?: string | null;
  reklamSparrTyp?: number | null;
  telefonSparrTyp?: number | null;
  epostSparrTyp?: number | null;
  startDat?: string | null;
  slutDat?: string | null;
  regDat?: string | null;
  tel?: string | null;
  epost?: string | null;
  omsKl?: string | null;
  naringsgrenar?: ScbIndustry[] | null;
};

type Page = {
  jes?: ScbCompany[];
  pagination?: { nextCursorId?: string | null; hasMore?: boolean };
};

export async function syncFromScb(options: { maxPages?: number } = {}) {
  const apiKey = process.env.SCB_API_KEY;
  if (!apiKey) {
    throw new Error("SCB_API_KEY saknas. Nyckeln hämtas med BankID på registreraafr.scb.se och läggs i miljön, inte i koden.");
  }
  const connection = db();
  const started = new Date().toISOString();
  const run = connection
    .prepare("INSERT INTO sync_runs (started_at, status, message) VALUES (?, 'pågår', '')")
    .run(started);
  const runId = Number(run.lastInsertRowid);
  let pages = 0;
  let rows = 0;
  try {
    connection.prepare("DELETE FROM companies WHERE source = 'exempel'").run();
    let cursor: string | null = null;
    const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY;
    while (pages < maxPages) {
      const url = new URL("https://apiafr.scb.se/v1/juridiskaenheter/full");
      url.searchParams.set("limit", "5000");
      if (cursor) url.searchParams.set("cursorId", cursor);
      const response = await fetch(url, { headers: { "X-API-Key": apiKey, accept: "application/json" } });
      if (response.status === 429) {
        await sleep(2000);
        continue;
      }
      if (!response.ok) {
        throw new Error(`SCB svarade ${response.status}`);
      }
      const body = (await response.json()) as Page;
      const batch = body.jes ?? [];
      upsertBatch(batch);
      pages += 1;
      rows += batch.length;
      connection
        .prepare("UPDATE sync_runs SET pages = ?, rows = ? WHERE id = ?")
        .run(pages, rows, runId);
      if (!body.pagination?.hasMore || !body.pagination.nextCursorId) break;
      cursor = body.pagination.nextCursorId;
      await sleep(220);
    }
    connection
      .prepare("UPDATE sync_runs SET finished_at = ?, status = 'klar', pages = ?, rows = ?, message = ? WHERE id = ?")
      .run(new Date().toISOString(), pages, rows, `${rows} bolag lästa`, runId);
    return { pages, rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : "okänt fel";
    connection
      .prepare("UPDATE sync_runs SET finished_at = ?, status = 'fel', pages = ?, rows = ?, message = ? WHERE id = ?")
      .run(new Date().toISOString(), pages, rows, message, runId);
    throw error;
  }
}

function upsertBatch(companies: ScbCompany[]) {
  const connection = db();
  const now = new Date().toISOString();
  const upsert = connection.prepare(`
    INSERT INTO companies (
      org_nr, pe_org_nr, name, street, co_address, postal_code, city,
      municipality_code, county_code, legal_form, status_code, employee_class,
      turnover_class, workplace_count, reklam_block, phone_block, email_block,
      started_on, ended_on, registered_on, source, fetched_at, first_seen_at
    ) VALUES (
      @org_nr, @pe_org_nr, @name, @street, @co_address, @postal_code, @city,
      @municipality_code, @county_code, @legal_form, @status_code, @employee_class,
      @turnover_class, @workplace_count, @reklam_block, @phone_block, @email_block,
      @started_on, @ended_on, @registered_on, 'scb', @fetched_at, @fetched_at
    )
    ON CONFLICT(org_nr) DO UPDATE SET
      pe_org_nr = excluded.pe_org_nr,
      name = excluded.name,
      street = excluded.street,
      co_address = excluded.co_address,
      postal_code = excluded.postal_code,
      city = excluded.city,
      municipality_code = excluded.municipality_code,
      county_code = excluded.county_code,
      legal_form = excluded.legal_form,
      status_code = excluded.status_code,
      employee_class = excluded.employee_class,
      turnover_class = excluded.turnover_class,
      workplace_count = excluded.workplace_count,
      reklam_block = excluded.reklam_block,
      phone_block = excluded.phone_block,
      email_block = excluded.email_block,
      started_on = excluded.started_on,
      ended_on = excluded.ended_on,
      registered_on = COALESCE(excluded.registered_on, companies.registered_on),
      source = 'scb',
      fetched_at = excluded.fetched_at
  `);
  const clearIndustries = connection.prepare("DELETE FROM industries WHERE org_nr = ?");
  const insertIndustry = connection.prepare(
    "INSERT INTO industries (org_nr, rank, sni, share) VALUES (?, ?, ?, ?)",
  );
  const touchPhone = connection.prepare(`
    INSERT INTO phones (org_nr, e164, raw, kind, source, source_url, evidence, first_seen, last_seen, removed_on)
    VALUES (@org_nr, @e164, @raw, 'register', 'scb', NULL, NULL, @now, @now, NULL)
    ON CONFLICT(org_nr, e164, kind) DO UPDATE SET
      raw = excluded.raw,
      last_seen = excluded.last_seen,
      removed_on = NULL
  `);

  const tx = connection.transaction((batch: ScbCompany[]) => {
    for (const company of batch) {
      const orgNr = (company.orgNr ?? "").replace(/\D/g, "");
      if (!orgNr || !company.namn) continue;
      const ended = company.slutDat ? company.slutDat.slice(0, 10) : null;
      const status = ended ? "avregistrerad" : company.ftgStat || null;
      upsert.run({
        org_nr: orgNr,
        pe_org_nr: company.peOrgNr ?? null,
        name: company.namn,
        street: company.postAdress?.gatuAdress ?? null,
        co_address: company.postAdress?.coAdress ?? null,
        postal_code: company.postAdress?.postNr ?? null,
        city: company.postAdress?.postOrt ?? null,
        municipality_code: company.kommunSate ?? null,
        county_code: company.lanSate ?? null,
        legal_form: company.jurform ?? null,
        status_code: status,
        employee_class: company.anstKl ?? null,
        turnover_class: company.omsKl ?? null,
        workplace_count: company.aeAnt ?? null,
        reklam_block: scbCode(company.reklamSparrTyp) === 4 ? 1 : 0,
        phone_block: [2, 3].includes(scbCode(company.telefonSparrTyp) ?? -1) ? 1 : 0,
        email_block: scbCode(company.epostSparrTyp) === 2 ? 1 : 0,
        started_on: company.startDat ? company.startDat.slice(0, 10) : null,
        ended_on: ended,
        registered_on: company.regDat ? company.regDat.slice(0, 10) : null,
        fetched_at: now,
      });
      clearIndustries.run(orgNr);
      for (const industry of company.naringsgrenar ?? []) {
        if (!industry.naringsgren) continue;
        insertIndustry.run(orgNr, industry.rangordning ?? 1, industry.naringsgren, industry.andelProcent ?? null);
      }
      const phone = company.tel ? normalizePhone(company.tel) : null;
      if (phone) {
        touchPhone.run({ org_nr: orgNr, e164: phone.e164, raw: company.tel, now });
      }
      const email = (company.epost ?? "").trim().toLowerCase();
      if (email.includes("@")) {
        connection
          .prepare(
            `INSERT INTO emails (org_nr, address, kind, source, source_url, evidence, first_seen, last_seen, removed_on)
             VALUES (?, ?, 'register', 'scb', NULL, NULL, ?, ?, NULL)
             ON CONFLICT(org_nr, address) DO UPDATE SET last_seen = excluded.last_seen, removed_on = NULL`,
          )
          .run(orgNr, email, now, now);
      }
    }
  });
  tx(companies);
}

function scbCode(value: unknown): number | null {
  if (value == null || value === "") return null;
  const code = Number(value);
  return Number.isFinite(code) ? code : null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
