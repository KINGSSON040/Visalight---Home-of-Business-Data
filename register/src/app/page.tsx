import Link from "next/link";
import { Shell } from "@/components/Shell";
import { overview } from "@/lib/queries";

export default function HomePage() {
  const stats = overview();
  return (
    <Shell>
      <p className="text-sm text-[var(--muted)]">Register</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Vad som går att sälja just nu</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Ett bolag räknas som säljbart när organisationsnummer, företagsnamn, gatuadress, ort och SNI-kod finns. Saknas något av det hålls raden utanför filen. Tom telefon eller e-post betyder att källan inte hade uppgiften, och det kostar inget.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Säljbara bolag" value={stats.sellable} />
        <Stat label="Hålls utanför filen" value={stats.held} />
        <Stat label="Nummer som får säljas" value={stats.phones} />
        <Stat label="E-post som får säljas" value={stats.emails} />
      </div>
      {stats.examples > 0 ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm">
          {stats.examples} rader är exempeldata, märkta i källan. De tas bort när den första inläsningen från SCB körs.
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Link className="button" href="/foretag">
          Bläddra i bolagen
        </Link>
        <Link className="button secondary" href="/segment">
          Räkna ett segment
        </Link>
      </div>
      <p className="mt-8 text-sm text-[var(--muted)]">
        Senaste uppdatering: {stats.lastSync ? `${stats.lastSync.status}, ${stats.lastSync.rows} rader` : "ingen körning ännu"}
      </p>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString("sv-SE")}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}
