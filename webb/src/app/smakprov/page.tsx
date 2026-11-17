import type { Metadata } from "next";
import Link from "next/link";
import { legalFormLabel } from "@/lib/catalog";
import { sampleCompanies } from "@/lib/sample-file";

export const metadata: Metadata = {
  title: "Smakprov — VisaLight",
  description:
    "Ladda ner 16 påhittade rader i CSV eller Excel och se hur en VisaLight-fil ser ut innan ni köper.",
};

export default function SamplePage() {
  const rows = sampleCompanies().slice(0, 5);
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Kostnadsfritt smakprov</p>
      <h1 className="mt-3 max-w-3xl text-4xl tracking-tight sm:text-5xl">Öppna filen i ert CRM innan ni köper.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        16 påhittade rader, samma kolumner som en köpt lista. Tomma kontaktfält är tomma. Inget konto och ingen
        betalning.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/smakprov/csv" className="btn-fade-amber inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink">
          Ladda ner CSV
        </a>
        <a href="/smakprov/xls" className="btn-fade-sea inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
          Ladda ner Excel
        </a>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        CSV-filen använder semikolon och UTF-8, så svensk Excel delar upp kolumnerna. Organisationsnumren börjar på
        559100 och är inte riktiga bolag.
      </p>
      <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Bolag</th>
              <th className="px-4 py-3 font-medium">Ort</th>
              <th className="px-4 py-3 font-medium">Bransch</th>
              <th className="px-4 py-3 font-medium">SNI</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.orgNr} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-medium">{row.name}</span>
                  <span className="text-muted">
                    {row.orgNr} · {legalFormLabel(row.form)}
                  </span>
                </td>
                <td className="px-4 py-3">{row.city}</td>
                <td className="px-4 py-3">{row.industry}</td>
                <td className="px-4 py-3">{row.sni}</td>
                <td className="px-4 py-3">{row.phones[0] ?? "Tomt"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/#urval" className="font-medium text-sea">
          Bygg en riktig beställning
        </Link>
      </p>
    </main>
  );
}
