import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "visalight.sqlite");

let database: Database.Database | null = null;

export function db(): Database.Database {
  if (database) return database;
  fs.mkdirSync(dataDir, { recursive: true });
  const connection = new Database(dbPath);
  connection.pragma("journal_mode = WAL");
  connection.pragma("foreign_keys = ON");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      org_nr TEXT PRIMARY KEY,
      pe_org_nr TEXT,
      name TEXT NOT NULL,
      street TEXT,
      co_address TEXT,
      postal_code TEXT,
      city TEXT,
      municipality_code TEXT,
      county_code TEXT,
      legal_form TEXT,
      status_code TEXT,
      employee_class TEXT,
      turnover_class TEXT,
      workplace_count INTEGER,
      reklam_block INTEGER NOT NULL DEFAULT 0,
      phone_block INTEGER NOT NULL DEFAULT 0,
      email_block INTEGER NOT NULL DEFAULT 0,
      started_on TEXT,
      ended_on TEXT,
      registered_on TEXT,
      manual_exclude INTEGER NOT NULL DEFAULT 0,
      internal_note TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL,
      fetched_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS industries (
      org_nr TEXT NOT NULL,
      rank INTEGER NOT NULL,
      sni TEXT NOT NULL,
      share INTEGER,
      PRIMARY KEY (org_nr, rank)
    );

    CREATE TABLE IF NOT EXISTS phones (
      id INTEGER PRIMARY KEY,
      org_nr TEXT NOT NULL,
      e164 TEXT NOT NULL,
      raw TEXT NOT NULL,
      kind TEXT NOT NULL,
      source TEXT NOT NULL,
      source_url TEXT,
      evidence TEXT,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      removed_on TEXT,
      UNIQUE (org_nr, e164, kind)
    );

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY,
      org_nr TEXT NOT NULL,
      address TEXT NOT NULL,
      kind TEXT NOT NULL,
      source TEXT NOT NULL,
      source_url TEXT,
      evidence TEXT,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      removed_on TEXT,
      UNIQUE (org_nr, address)
    );

    CREATE TABLE IF NOT EXISTS flags (
      id INTEGER PRIMARY KEY,
      org_nr TEXT NOT NULL,
      label TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      filters_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      status TEXT NOT NULL,
      pages INTEGER NOT NULL DEFAULT 0,
      rows INTEGER NOT NULL DEFAULT 0,
      message TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS code_labels (
      kind TEXT NOT NULL,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      PRIMARY KEY (kind, code)
    );

    CREATE INDEX IF NOT EXISTS companies_city ON companies(city);
    CREATE INDEX IF NOT EXISTS industries_sni ON industries(sni);
    CREATE INDEX IF NOT EXISTS phones_org ON phones(org_nr);
    CREATE INDEX IF NOT EXISTS emails_org ON emails(org_nr);

    CREATE VIRTUAL TABLE IF NOT EXISTS company_fts USING fts5(
      org_nr UNINDEXED,
      name,
      tokenize = "unicode61 remove_diacritics 2"
    );

    CREATE TABLE IF NOT EXISTS company_fts_row (
      org_nr TEXT PRIMARY KEY,
      fts_rowid INTEGER NOT NULL
    );

    CREATE TRIGGER IF NOT EXISTS companies_fts_insert AFTER INSERT ON companies BEGIN
      INSERT INTO company_fts(org_nr, name) VALUES (new.org_nr, new.name);
      INSERT INTO company_fts_row(org_nr, fts_rowid) VALUES (new.org_nr, last_insert_rowid());
    END;

    CREATE TRIGGER IF NOT EXISTS companies_fts_delete AFTER DELETE ON companies BEGIN
      DELETE FROM company_fts WHERE rowid = (
        SELECT fts_rowid FROM company_fts_row WHERE org_nr = old.org_nr
      );
      DELETE FROM company_fts_row WHERE org_nr = old.org_nr;
    END;

    CREATE TRIGGER IF NOT EXISTS companies_fts_update AFTER UPDATE OF name ON companies BEGIN
      DELETE FROM company_fts WHERE rowid = (
        SELECT fts_rowid FROM company_fts_row WHERE org_nr = old.org_nr
      );
      DELETE FROM company_fts_row WHERE org_nr = old.org_nr;
      INSERT INTO company_fts(org_nr, name) VALUES (new.org_nr, new.name);
      INSERT INTO company_fts_row(org_nr, fts_rowid) VALUES (new.org_nr, last_insert_rowid());
    END;
  `);
  const count = connection.prepare("SELECT COUNT(*) AS n FROM companies").get() as { n: number };
  if (count.n === 0) seed(connection);
  ensureCompanySearch(connection);
  database = connection;
  return connection;
}

function ensureCompanySearch(connection: Database.Database) {
  const companies = (connection.prepare("SELECT COUNT(*) AS n FROM companies").get() as { n: number }).n;
  const indexed = (connection.prepare("SELECT COUNT(*) AS n FROM company_fts").get() as { n: number }).n;
  const mapped = (connection.prepare("SELECT COUNT(*) AS n FROM company_fts_row").get() as { n: number }).n;
  if (companies === indexed && indexed === mapped) return;
  console.log(`Bygger sökindex för ${companies.toLocaleString("sv-SE")} bolag. Första starten tar en stund.`);
  const rebuild = connection.transaction(() => {
    connection.exec("DELETE FROM company_fts");
    connection.exec("DELETE FROM company_fts_row");
    connection.exec("INSERT INTO company_fts(org_nr, name) SELECT org_nr, name FROM companies");
    connection.exec("INSERT INTO company_fts_row(org_nr, fts_rowid) SELECT org_nr, rowid FROM company_fts");
  });
  rebuild();
  console.log("Sökindex klart.");
}

export type CompanyRow = {
  org_nr: string;
  pe_org_nr: string | null;
  name: string;
  street: string | null;
  co_address: string | null;
  postal_code: string | null;
  city: string | null;
  municipality_code: string | null;
  county_code: string | null;
  legal_form: string | null;
  status_code: string | null;
  employee_class: string | null;
  turnover_class: string | null;
  workplace_count: number | null;
  reklam_block: number;
  phone_block: number;
  email_block: number;
  started_on: string | null;
  ended_on: string | null;
  registered_on: string | null;
  manual_exclude: number;
  internal_note: string;
  source: string;
  fetched_at: string;
};

export function companyIsSellable(company: {
  name?: string | null;
  street?: string | null;
  city?: string | null;
  sni?: string | null;
  manual_exclude?: number | null;
}): boolean {
  if (company.manual_exclude) return false;
  return Boolean(company.name?.trim() && company.street?.trim() && company.city?.trim() && company.sni?.trim());
}

function seed(connection: Database.Database) {
  const now = new Date().toISOString();
  const insertCompany = connection.prepare(`
    INSERT INTO companies (
      org_nr, name, street, postal_code, city, municipality_code, county_code,
      legal_form, status_code, employee_class, turnover_class, workplace_count,
      reklam_block, phone_block, email_block, started_on, ended_on,
      manual_exclude, internal_note, source, fetched_at
    ) VALUES (
      @org_nr, @name, @street, @postal_code, @city, @municipality_code, @county_code,
      @legal_form, @status_code, @employee_class, @turnover_class, @workplace_count,
      @reklam_block, @phone_block, @email_block, @started_on, @ended_on,
      @manual_exclude, @internal_note, 'exempel', @fetched_at
    )
  `);
  const insertSni = connection.prepare(
    "INSERT INTO industries (org_nr, rank, sni, share) VALUES (?, ?, ?, ?)",
  );
  const insertPhone = connection.prepare(`
    INSERT INTO phones (org_nr, e164, raw, kind, source, source_url, evidence, first_seen, last_seen, removed_on)
    VALUES (@org_nr, @e164, @raw, @kind, @source, @source_url, @evidence, @first_seen, @last_seen, @removed_on)
  `);
  const insertEmail = connection.prepare(`
    INSERT INTO emails (org_nr, address, kind, source, source_url, evidence, first_seen, last_seen)
    VALUES (@org_nr, @address, @kind, @source, @source_url, @evidence, @first_seen, @last_seen)
  `);

  const rows = [
    {
      org_nr: "5591000001",
      name: "Exempelbageriet Nord AB",
      street: "Storgatan 1",
      postal_code: "11122",
      city: "Stockholm",
      municipality_code: "0180",
      county_code: "01",
      legal_form: "AB",
      status_code: "verksam",
      employee_class: "5-9",
      turnover_class: "1-5",
      workplace_count: 1,
      reklam_block: 0,
      phone_block: 0,
      email_block: 0,
      started_on: "2018-03-01",
      ended_on: null,
      manual_exclude: 0,
      internal_note: "",
      sni: "10710",
      phones: [
        { e164: "+468123456", raw: "08-123 456", kind: "register", source: "scb", source_url: null, evidence: null },
        { e164: "+46701234567", raw: "070-123 45 67", kind: "published", source: "webbplats", source_url: "https://exempel.invalid/kontakt", evidence: "Organisationsnumret står i sidfoten." },
      ],
      emails: [{ address: "kontakt@exempel.invalid", kind: "register", source: "scb", source_url: null, evidence: null }],
    },
    {
      org_nr: "5591000002",
      name: "Hamnens Snickeri AB",
      street: "Kajen 4",
      postal_code: "21124",
      city: "Malmö",
      municipality_code: "1280",
      county_code: "12",
      legal_form: "AB",
      status_code: "verksam",
      employee_class: "1-4",
      turnover_class: "<1",
      workplace_count: 1,
      reklam_block: 0,
      phone_block: 0,
      email_block: 0,
      started_on: "2021-01-15",
      ended_on: null,
      manual_exclude: 0,
      internal_note: "Saknar publicerat nummer.",
      sni: "16230",
      phones: [],
      emails: [],
    },
    {
      org_nr: "5591000003",
      name: "Spärrad Konsult AB",
      street: "Reklamvägen 2",
      postal_code: "41103",
      city: "Göteborg",
      municipality_code: "1480",
      county_code: "14",
      legal_form: "AB",
      status_code: "verksam",
      employee_class: "1-4",
      turnover_class: "1-5",
      workplace_count: 1,
      reklam_block: 1,
      phone_block: 0,
      email_block: 0,
      started_on: "2016-06-01",
      ended_on: null,
      manual_exclude: 0,
      internal_note: "",
      sni: "70220",
      phones: [{ e164: "+4631123456", raw: "031-123 456", kind: "register", source: "scb", source_url: null, evidence: null }],
      emails: [{ address: "info@sparrad.invalid", kind: "register", source: "scb", source_url: null, evidence: null }],
    },
    {
      org_nr: "5591000004",
      name: "Avslutad Handel AB",
      street: "Torget 9",
      postal_code: "75320",
      city: "Uppsala",
      municipality_code: "0380",
      county_code: "03",
      legal_form: "AB",
      status_code: "avregistrerad",
      employee_class: "0",
      turnover_class: "<1",
      workplace_count: 0,
      reklam_block: 0,
      phone_block: 0,
      email_block: 0,
      started_on: "2012-04-01",
      ended_on: "2024-11-01",
      manual_exclude: 0,
      internal_note: "",
      sni: "47110",
      phones: [],
      emails: [],
    },
    {
      org_nr: "5591000005",
      name: "Telefonspärrat Tryckeri AB",
      street: "Industrigatan 12",
      postal_code: "58222",
      city: "Linköping",
      municipality_code: "0580",
      county_code: "05",
      legal_form: "AB",
      status_code: "verksam",
      employee_class: "10-19",
      turnover_class: "5-10",
      workplace_count: 2,
      reklam_block: 0,
      phone_block: 1,
      email_block: 0,
      started_on: "2009-09-01",
      ended_on: null,
      manual_exclude: 0,
      internal_note: "",
      sni: "18120",
      phones: [{ e164: "+4613123456", raw: "013-123 456", kind: "register", source: "scb", source_url: null, evidence: null }],
      emails: [{ address: "order@tryck.invalid", kind: "published", source: "webbplats", source_url: "https://tryck.invalid/kontakt", evidence: "Organisationsnumret står på kontaktsidan." }],
    },
    {
      org_nr: "5591000006",
      name: "Firmatecknarens Verkstad AB",
      street: "Verkstadsvägen 3",
      postal_code: "90326",
      city: "Umeå",
      municipality_code: "2480",
      county_code: "24",
      legal_form: "AB",
      status_code: "verksam",
      employee_class: "5-9",
      turnover_class: "5-10",
      workplace_count: 1,
      reklam_block: 0,
      phone_block: 0,
      email_block: 0,
      started_on: "2014-02-01",
      ended_on: null,
      manual_exclude: 0,
      internal_note: "",
      sni: "45201",
      phones: [
        { e164: "+4690123456", raw: "090-123 456", kind: "register", source: "scb", source_url: null, evidence: null },
        { e164: "+46709876543", raw: "070-987 65 43", kind: "signatory", source: "webbplats", source_url: "https://verkstad.invalid/om", evidence: "Sidan anger organisationsnummer och numret som firmatecknarens." },
      ],
      emails: [],
    },
  ];

  const tx = connection.transaction(() => {
    for (const row of rows) {
      insertCompany.run({ ...row, fetched_at: now });
      insertSni.run(row.org_nr, 1, row.sni, 100);
      for (const phone of row.phones) {
        insertPhone.run({ ...phone, org_nr: row.org_nr, first_seen: now, last_seen: now, removed_on: null });
      }
      for (const email of row.emails) {
        insertEmail.run({ ...email, org_nr: row.org_nr, first_seen: now, last_seen: now });
      }
    }
  });
  tx();
}
