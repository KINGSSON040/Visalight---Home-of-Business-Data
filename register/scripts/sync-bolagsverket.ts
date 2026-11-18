import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import { db } from "../src/lib/db";

/**
 * Hämtar organisationer som registrerats de senaste dagarna ur Bolagsverkets
 * avgiftsfria bulkfil för värdefulla datamängder.
 *
 * Filen: https://vardefulla-datamangder.bolagsverket.se/bolagsverket/bolagsverket_bulkfil.zip
 * API:t POST /organisationer tar en känd identitetsbeteckning och kan inte lista nya bolag.
 * Enskilda firmor har personnummer eller samordningsnummer och hoppas över. De kommer via SCB.
 *
 * Körs från register-mappen på den dator där sqlite-filen ligger.
 */

const BULK_URL = "https://vardefulla-datamangder.bolagsverket.se/bolagsverket/bolagsverket_bulkfil.zip";
const DEFAULT_DAYS = 40;

type FreshCompany = {
  org_nr: string;
  name: string;
  street: string | null;
  co_address: string | null;
  postal_code: string | null;
  city: string | null;
  legal_form: string | null;
  registered_on: string;
};

export function parseBolagsverketFields(fields: string[], fromDate: string): FreshCompany | null {
  if (fields.length < 9) return null;
  if (fields[0].toLowerCase().startsWith("organisationsidentitet")) return null;
  const identity = fields[0].split("$");
  const digits = (identity[0] ?? "").replace(/\D/g, "");
  const kind = (identity[1] ?? "").toUpperCase();
  if (digits.length !== 10 || kind.includes("PERSON") || kind.includes("SAMORDN")) return null;
  const form = fields[4].trim();
  const formCode = form.split("$")[0]?.toUpperCase() ?? "";
  if (/enskild/i.test(form) || formCode === "E-ORGFO" || formCode === "EN-ORGFO") return null;
  if (fields[5].trim()) return null;
  const registered = fields[8].trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(registered) || registered < fromDate) return null;
  const name = organisationName(fields[3]);
  if (!name) return null;
  const address = fields[10]?.split("$") ?? [];
  return {
    org_nr: digits,
    name,
    street: empty(address[0]),
    co_address: empty(address[1]),
    postal_code: empty(address[2]),
    city: empty(address[3]),
    legal_form: empty(formCode),
    registered_on: registered,
  };
}

function organisationName(raw: string): string {
  for (const part of raw.split("|")) {
    const bits = part.split("$");
    if ((bits[1] ?? "").toUpperCase().includes("FORETAGSNAMN") && bits[0].trim()) return bits[0].trim();
  }
  return raw.split("|")[0]?.split("$")[0]?.trim() ?? "";
}

function empty(value: string | undefined): string | null {
  const text = value?.trim() ?? "";
  return text ? text : null;
}

export function daysBack(value: string | undefined): number {
  const days = value ? Number(value) : DEFAULT_DAYS;
  if (!Number.isInteger(days) || days < 1 || days > 366) {
    throw new Error("BOLAGSVERKET_DAYS ska vara ett heltal mellan 1 och 366.");
  }
  return days;
}

export function fromDate(days: number, today = new Date()): string {
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

type ZipEntry = { method: number; dataStart: number; compSize: number };

export function locateZipEntry(file: string): ZipEntry {
  const stat = fs.statSync(file);
  const tailLen = Math.min(stat.size, 65_557);
  const fd = fs.openSync(file, "r");
  try {
    const tail = Buffer.alloc(tailLen);
    fs.readSync(fd, tail, 0, tailLen, stat.size - tailLen);
    const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd < 0) throw new Error("Zipfilen saknar katalog.");
    const cdOffset = tail.readUInt32LE(eocd + 16);
    const header = Buffer.alloc(46);
    fs.readSync(fd, header, 0, 46, cdOffset);
    if (header.readUInt32LE(0) !== 0x02014b50) throw new Error("Zipfilens katalog är ogiltig.");
    const method = header.readUInt16LE(10);
    const compSize = header.readUInt32LE(20);
    if (compSize === 0xffffffff) throw new Error("Zipfilen använder Zip64, som skriptet inte läser.");
    const localOffset = header.readUInt32LE(42);
    const local = Buffer.alloc(30);
    fs.readSync(fd, local, 0, 30, localOffset);
    if (local.readUInt32LE(0) !== 0x04034b50) throw new Error("Zipfilens filhuvud är ogiltigt.");
    const dataStart = localOffset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    return { method, dataStart, compSize };
  } finally {
    fs.closeSync(fd);
  }
}

function storeFresh(companies: FreshCompany[], seenAt: string) {
  const connection = db();
  const upsert = connection.prepare(`
    INSERT INTO companies (
      org_nr, name, street, co_address, postal_code, city, legal_form,
      registered_on, source, fetched_at, first_seen_at,
      reklam_block, phone_block, email_block, manual_exclude, internal_note
    ) VALUES (
      @org_nr, @name, @street, @co_address, @postal_code, @city, @legal_form,
      @registered_on, 'bolagsverket', @fetched_at, @first_seen_at,
      0, 0, 0, 0, ''
    )
    ON CONFLICT(org_nr) DO UPDATE SET
      name = excluded.name,
      street = COALESCE(excluded.street, companies.street),
      co_address = COALESCE(excluded.co_address, companies.co_address),
      postal_code = COALESCE(excluded.postal_code, companies.postal_code),
      city = COALESCE(excluded.city, companies.city),
      legal_form = COALESCE(excluded.legal_form, companies.legal_form),
      registered_on = excluded.registered_on,
      first_seen_at = COALESCE(companies.first_seen_at, excluded.first_seen_at),
      fetched_at = excluded.fetched_at
  `);
  const tx = connection.transaction((batch: FreshCompany[]) => {
    for (const company of batch) upsert.run({ ...company, fetched_at: seenAt, first_seen_at: seenAt });
  });
  tx(companies);
}

export async function importBolagsverketZip(file: string, days: number): Promise<{ read: number; kept: number }> {
  const entry = locateZipEntry(file);
  const raw = fs.createReadStream(file, { start: entry.dataStart, end: entry.dataStart + entry.compSize - 1 });
  const source = entry.method === 0 ? raw : raw.pipe(zlib.createInflateRaw());
  const cutoff = fromDate(days);
  const seenAt = new Date().toISOString();
  const decoder = new TextDecoder("utf-8");
  let inQuotes = false;
  let field = "";
  let row: string[] = [];
  let held: string | null = null;
  let read = 0;
  let kept = 0;
  let batch: FreshCompany[] = [];

  function flush() {
    if (batch.length === 0) return;
    storeFresh(batch, seenAt);
    kept += batch.length;
    batch = [];
  }

  function finishRow() {
    row.push(field);
    field = "";
    const parsed = parseBolagsverketFields(row, cutoff);
    row = [];
    read += 1;
    if (parsed) {
      batch.push(parsed);
      if (batch.length >= 200) flush();
    }
    if (read % 200_000 === 0) console.log(`Läst ${read.toLocaleString("sv-SE")} rader, sparat ${kept.toLocaleString("sv-SE")}.`);
  }

  function feed(text: string) {
    if (held !== null) {
      text = held + text;
      held = null;
    }
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (inQuotes) {
        if (char === "\\") {
          if (index + 1 >= text.length) {
            held = "\\";
            return;
          }
          if (text[index + 1] === '"') {
            field += '"';
            index += 1;
            continue;
          }
        }
        if (char === '"') {
          if (index + 1 >= text.length) {
            held = '"';
            return;
          }
          if (text[index + 1] === '"') {
            field += '"';
            index += 1;
            continue;
          }
          inQuotes = false;
          continue;
        }
        field += char;
        continue;
      }
      if (char === '"') {
        inQuotes = true;
        continue;
      }
      if (char === ";") {
        row.push(field);
        field = "";
        continue;
      }
      if (char === "\n") {
        finishRow();
        continue;
      }
      if (char !== "\r") field += char;
    }
  }

  for await (const chunk of source) {
    feed(decoder.decode(chunk as Buffer, { stream: true }));
  }
  feed(decoder.decode());
  if (held === '"') inQuotes = false;
  if (field || row.length) finishRow();
  flush();
  return { read, kept };
}

async function downloadBulk(): Promise<string> {
  const local = process.env.BOLAGSVERKET_FILE?.trim();
  if (local) {
    if (!fs.existsSync(local)) throw new Error(`BOLAGSVERKET_FILE finns inte: ${local}`);
    return local;
  }
  console.log("Hämtar Bolagsverkets bulkfil. Filen är stor och uppdateras veckovis.");
  const response = await fetch(BULK_URL);
  if (!response.ok || !response.body) throw new Error(`Bolagsverket svarade ${response.status}`);
  const file = path.join(os.tmpdir(), "bolagsverket_bulkfil.zip");
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(file));
  return file;
}

async function main() {
  const days = daysBack(process.env.BOLAGSVERKET_DAYS);
  const file = await downloadBulk();
  const result = await importBolagsverketZip(file, days);
  console.log(
    `Klart. ${result.kept.toLocaleString("sv-SE")} bolag med registreringsdatum de senaste ${days} dagarna. ${result.read.toLocaleString("sv-SE")} rader lästa. Enskilda firmor och personnummer skrevs inte.`,
  );
}

const entry = process.argv[1]?.replace(/\\/g, "/");
if (entry?.endsWith("sync-bolagsverket.ts")) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
