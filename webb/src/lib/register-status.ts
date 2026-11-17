import Database from "better-sqlite3";
import { registerDatabasePath } from "@/lib/register-path";

/** Tidpunkt för senaste lyckade synk, formaterad på svenska. Null om registret saknas. */
export function registerUpdatedLabel(): string | null {
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
  } catch {
    return null;
  } finally {
    connection.close();
  }
}
