import Link from "next/link";
import { FilterForm } from "@/components/Filters";
import { Shell } from "@/components/Shell";
import { companyIsSellable } from "@/lib/db";
import { displayOrgNr } from "@/lib/phones";
import { countCompanies, listCompanies, readFilters } from "@/lib/queries";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(await searchParams);
  const rows = listCompanies(filters);
  const total = countCompanies(filters, false);
  return (
    <Shell>
      <h1 className="text-3xl font-semibold tracking-tight">Företag</h1>
      <p className="mt-2 mb-5 text-sm text-[var(--muted)]">
        {total.toLocaleString("sv-SE")} träffar. Listan visar de första 50.
      </p>
      <FilterForm filters={filters} action="/foretag" />
      <div className="mt-4 overflow-x-auto rounded-2xl">
        <table>
          <thead>
            <tr>
              <th>Bolag</th>
              <th>Ort</th>
              <th>SNI</th>
              <th>I filen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const sellable = companyIsSellable(row);
              return (
                <tr key={row.org_nr}>
                  <td>
                    <Link href={`/foretag/${row.org_nr}`} className="font-medium underline decoration-[var(--line)]">
                      {row.name}
                    </Link>
                    <div className="font-mono text-xs text-[var(--muted)]">{displayOrgNr(row.org_nr)}</div>
                  </td>
                  <td>{row.city}</td>
                  <td className="font-mono text-sm">{row.sni}</td>
                  <td style={{ color: sellable ? "var(--green)" : "var(--rust)" }}>
                    {sellable ? "Ja" : "Nej"}
                    {row.flag_count ? ` · ${row.flag_count} flagga` : ""}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>Inget bolag matchar urvalet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
