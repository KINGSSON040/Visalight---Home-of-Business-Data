import type { Metadata } from "next";
import Link from "next/link";
import { selectionIndustries } from "@/lib/catalog";
import { countNewCompanies, freshQuery } from "@/lib/nystartade";
import { formatKronor } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Nystartade bolag — VisaLight",
  description:
    "Nya bolag kommer in från Bolagsverket, och filen uppdateras varje vecka. Filtrera på 7 eller 30 dagar, bransch och ort, och se priset innan betalning.",
};

export default async function NewCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = freshQuery({
    dagar: typeof params.dagar === "string" ? params.dagar : undefined,
    sni: typeof params.sni === "string" ? params.sni : undefined,
    ort: typeof params.ort === "string" ? params.ort : undefined,
  });
  const count = countNewCompanies(query);
  const checkout = `/kassa?dagar=${count.days}${query.sni ? `&sni=${query.sni}` : ""}${query.city ? `&ort=${encodeURIComponent(query.city)}` : ""}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Bolagsverket</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Nystartade bolag</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        Nya bolag kommer in från Bolagsverket, och filen uppdateras varje vecka. Ett nytt bolag behöver ofta bank, redovisning, försäkring, telefoni, webb och lokal.
      </p>
      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <fieldset className="flex gap-2">
          <legend className="mb-1 text-xs font-semibold">Registrerade</legend>
          <label className="chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
            <input type="radio" name="dagar" value="7" defaultChecked={count.days === 7} className="accent-[#1b1023]" />
            7 dagar
          </label>
          <label className="chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
            <input type="radio" name="dagar" value="30" defaultChecked={count.days === 30} className="accent-[#1b1023]" />
            30 dagar
          </label>
        </fieldset>
        <label className="text-xs font-semibold">
          Bransch
          <select name="sni" defaultValue={query.sni} className="field-box mt-1 block h-10 rounded-xl px-3 text-sm font-medium">
            <option value="">Alla branscher</option>
            {selectionIndustries().map((item) => (
              <option key={item.sni} value={item.sni}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          Ort
          <input name="ort" defaultValue={query.city} placeholder="Till exempel Malmö" className="field-box mt-1 block h-10 rounded-xl px-3 text-sm font-medium" />
        </label>
        <button type="submit" className="btn-neon inline-flex h-10 items-center rounded-xl px-4 text-sm font-bold">
          Visa antal och pris
        </button>
      </form>
      <p className="mt-8 font-price text-[0.7rem] font-bold tracking-[0.14em] text-muted uppercase">
        Registrerade de senaste {count.days} dagarna
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-[2.9rem] leading-none font-extrabold tracking-[-0.03em] text-ink sm:text-[3.6rem]">
          {count.companies.toLocaleString("sv-SE")}
        </span>
        <span className="font-display text-lg font-bold">bolag</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">{count.note}</p>
      <p className="mt-3 text-sm font-semibold">
        <span className="price-figure font-price text-base font-bold">{formatKronor(count.price.totalOre)} kr</span>{" "}
        <span className="text-muted">exkl. moms för grunduppgifterna. Priset syns innan betalning.</span>
      </p>
      {count.price.minimumApplied ? <p className="mt-1 text-xs text-muted">Lägsta order 399 kr.</p> : null}
      <p className="mt-2 text-xs leading-5 text-muted">Ingen betalning dras och ingen fil skickas ännu.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={checkout} className="btn-neon inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold">
          Köp utdrag
        </Link>
        <Link href="/#urval" className="inline-flex h-11 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline">
          Öppna byggaren
        </Link>
      </div>
    </main>
  );
}
