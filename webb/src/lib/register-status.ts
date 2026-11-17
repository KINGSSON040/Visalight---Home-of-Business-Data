import Database from "better-sqlite3";
import { registerDatabasePath } from "@/lib/register-path";

/** Exempelvärde när registret inte är inkopplat. Ska aldrig se ut som en riktig import. */
export const EXAMPLE_REGISTER_WHEN = "12 mars 2026 kl. 09.00";

/** En tidpunkt för kundsidan. example är true när siffran inte kommer från registret. */
export function registerStamp(): { when: string; example: boolean; isoDate: string } {
  const at = registerUpdatedAt();
  if (at) return { when: formatStamp(at), example: false, isoDate: at.toISOString().slice(0, 10) };
  return { when: EXAMPLE_REGISTER_WHEN, example: true, isoDate: "2026-03-12" };
}

/** Tidpunkt för senaste lyckade synk, formaterad på svenska. Null om registret saknas. */
export function registerUpdatedLabel(): string | null {
  const at = registerUpdatedAt();
  return at ? formatStamp(at) : null;
}

function formatStamp(date: Date): string {
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${day} kl. ${time}`;
}

function registerUpdatedAt(): Date | null {
  const file = registerDatabasePath();
  if (!file) return null;
  const connection = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const finished = connection
      .prepare(
        "SELECT finished_at FROM sync_runs WHERE status = 'klar' AND finished_at IS NOT NULL AND trim(finished_at) != '' ORDER BY finished_at DESC LIMIT 1",
      )
      .get() as { finished_at: string } | undefined;
    const fetched = connection
      .prepare("SELECT MAX(fetched_at) AS at FROM companies WHERE source = 'scb' AND trim(fetched_at) != ''")
      .get() as { at: string | null };
    const iso = finished?.finished_at || fetched.at;
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  } finally {
    connection.close();
  }
}
