"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { compactOrgNr, normalizePhone } from "@/lib/phones";
import type { Filters } from "@/lib/queries";

function orgPath(orgNr: string) {
  return `/foretag/${orgNr}`;
}

export async function saveNote(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const note = String(formData.get("note") ?? "").slice(0, 2000);
  db().prepare("UPDATE companies SET internal_note = ? WHERE org_nr = ?").run(note, orgNr);
  revalidatePath(orgPath(orgNr));
}

export async function setManualExclude(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const exclude = formData.get("exclude") === "1" ? 1 : 0;
  db().prepare("UPDATE companies SET manual_exclude = ? WHERE org_nr = ?").run(exclude, orgNr);
  revalidatePath(orgPath(orgNr));
  revalidatePath("/foretag");
}

export async function addFlag(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const label = String(formData.get("label") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 500);
  const allowed = new Set(["bevaka", "prioritet", "granska"]);
  if (!allowed.has(label)) redirect(`${orgPath(orgNr)}?fel=flagga`);
  db()
    .prepare("INSERT INTO flags (org_nr, label, note, created_at) VALUES (?, ?, ?, ?)")
    .run(orgNr, label, note, new Date().toISOString());
  revalidatePath(orgPath(orgNr));
}

export async function removeFlag(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const id = Number(formData.get("id"));
  db().prepare("DELETE FROM flags WHERE id = ? AND org_nr = ?").run(id, orgNr);
  revalidatePath(orgPath(orgNr));
}

export async function addPhone(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const kind = String(formData.get("kind") ?? "");
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const evidence = String(formData.get("evidence") ?? "").trim();
  const phone = normalizePhone(String(formData.get("raw") ?? ""));
  if (!phone || (kind !== "published" && kind !== "signatory")) {
    redirect(`${orgPath(orgNr)}?fel=nummer`);
  }
  if (!sourceUrl.startsWith("http") || evidence.length < 12) {
    redirect(`${orgPath(orgNr)}?fel=belagg`);
  }
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO phones (org_nr, e164, raw, kind, source, source_url, evidence, first_seen, last_seen, removed_on)
       VALUES (?, ?, ?, ?, 'webbplats', ?, ?, ?, ?, NULL)
       ON CONFLICT(org_nr, e164, kind) DO UPDATE SET
         raw = excluded.raw, source_url = excluded.source_url, evidence = excluded.evidence,
         last_seen = excluded.last_seen, removed_on = NULL`,
    )
    .run(orgNr, phone.e164, String(formData.get("raw")).trim(), kind, sourceUrl, evidence, now, now);
  revalidatePath(orgPath(orgNr));
}

export async function retirePhone(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const id = Number(formData.get("id"));
  db()
    .prepare("UPDATE phones SET removed_on = ? WHERE id = ? AND org_nr = ? AND removed_on IS NULL")
    .run(new Date().toISOString(), id, orgNr);
  revalidatePath(orgPath(orgNr));
}

export async function addEmail(formData: FormData) {
  const orgNr = compactOrgNr(String(formData.get("orgNr") ?? ""));
  const address = String(formData.get("address") ?? "").trim().toLowerCase();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const evidence = String(formData.get("evidence") ?? "").trim();
  if (!address.includes("@") || address.startsWith("@") || !sourceUrl.startsWith("http") || evidence.length < 12) {
    redirect(`${orgPath(orgNr)}?fel=epost`);
  }
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO emails (org_nr, address, kind, source, source_url, evidence, first_seen, last_seen, removed_on)
       VALUES (?, ?, 'published', 'webbplats', ?, ?, ?, ?, NULL)
       ON CONFLICT(org_nr, address) DO UPDATE SET
         source_url = excluded.source_url, evidence = excluded.evidence,
         last_seen = excluded.last_seen, removed_on = NULL`,
    )
    .run(orgNr, address, sourceUrl, evidence, now, now);
  revalidatePath(orgPath(orgNr));
}

export async function saveSegment(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const filters: Filters = {
    q: String(formData.get("q") ?? ""),
    city: String(formData.get("city") ?? ""),
    sni: String(formData.get("sni") ?? ""),
    flag: String(formData.get("flag") ?? ""),
    hasPhone: formData.get("hasPhone") === "1",
    hasEmail: formData.get("hasEmail") === "1",
    includeSuppressed: false,
  };
  if (!name) redirect("/segment?fel=namn");
  db()
    .prepare("INSERT INTO segments (name, filters_json, created_at) VALUES (?, ?, ?)")
    .run(name, JSON.stringify(filters), new Date().toISOString());
  revalidatePath("/segment");
}
