import { Shell } from "@/components/Shell";
import { db } from "@/lib/db";

export default function UpdatePage() {
  const runs = db()
    .prepare("SELECT id, started_at, finished_at, status, pages, rows, message FROM sync_runs ORDER BY id DESC LIMIT 8")
    .all() as { id: number; started_at: string; status: string; pages: number; rows: number; message: string }[];
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Uppdatering</h1>
      <div className="mt-4 card max-w-3xl text-sm leading-6">
        <p>
          Nyckeln söks med BankID på{" "}
          <a className="underline" href="https://registreraafr.scb.se/">
            registreraafr.scb.se
          </a>
          . Ingen webbplats och ingen domän behövs. SCB skickar nyckeln till e-postadressen du anger, oftast samma dag. Nyckeln är personlig och ska läggas i miljövariabeln <span className="font-mono">SCB_API_KEY</span> på maskinen som kör inläsningen.
        </p>
        <p className="mt-3 font-mono text-xs">npm run sync</p>
        <p className="mt-3">
          Körningen läser hela registret, 5 000 bolag åt gången, och skriver över grunduppgifterna. Anteckningar och flaggor lämnas kvar. Ett nummer eller en e-post från SCB sparas bara när fältet har ett värde. Exempelraderna tas bort vid första körningen.
        </p>
      </div>
      <h2 className="mt-8 font-semibold">Körningar</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {runs.map((run) => (
          <li key={run.id}>
            {run.started_at.slice(0, 16).replace("T", " ")} · {run.status} · {run.rows.toLocaleString("sv-SE")} rader
            {run.message ? ` · ${run.message}` : ""}
          </li>
        ))}
        {runs.length === 0 ? <li>Ingen körning ännu.</li> : null}
      </ul>
    </Shell>
  );
}
