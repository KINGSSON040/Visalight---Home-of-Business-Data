import { COUNTIES, INDUSTRIES, selectionSniFilter, type Selection } from "@/lib/catalog";
import { quote } from "@/lib/pricing";
import type { UrvalResult } from "@/lib/urval";

export type IndustryStat = { sni: string; label: string; count: number };
export type CountyStat = { code: string; label: string; count: number };
export type GrowthStat = { sni: string; label: string; recent: number; previous: number; changePct: number };
export type MonthStat = { month: string; count: number };

/** Siffrorna om näringslivet. source "example" betyder påhittade exempeltal, aldrig riktiga. */
export type RegisterStats = {
  source: "register" | "example";
  total: number;
  newLastMonth: number;
  monthly: MonthStat[];
  byIndustry: IndustryStat[];
  byCounty: CountyStat[];
  growing: GrowthStat[];
};

const EXAMPLE_INDUSTRY_COUNTS: Record<string, number> = {
  "41200": 48000,
  "62010": 41000,
  "56110": 23000,
  "69201": 14000,
  "96210": 12000,
  "49410": 11000,
  "96220": 9000,
  "47112": 6000,
  "69202": 3000,
  "86211": 1200,
};

const EXAMPLE_COUNTY_COUNTS: Record<string, number> = {
  "01": 290000,
  "14": 200000,
  "12": 170000,
  "05": 50000,
  "03": 46000,
  "06": 40000,
  "13": 40000,
  "20": 33000,
  "18": 30000,
  "17": 30000,
  "24": 30000,
  "04": 28000,
  "08": 28000,
  "21": 28000,
  "19": 25000,
  "25": 25000,
  "22": 23000,
  "07": 22000,
  "23": 19000,
  "10": 14000,
  "09": 9000,
};

const EXAMPLE_MONTHLY = [5200, 5600, 6900, 6300, 5900, 4800, 4100, 5400, 6600, 6200, 6100, 6400];

function lastMonths(count: number, now = new Date()): string[] {
  const months: string[] = [];
  for (let back = count - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    months.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function industryName(sni: string): string {
  return INDUSTRIES.find((item) => item.sni === sni)?.label ?? `SNI ${sni.slice(0, 2)}.${sni.slice(2)}`;
}

/** Exempeltal för en körning utan register. Ska alltid visas märkta som exempeldata. */
export function exampleStats(): RegisterStats {
  const months = lastMonths(12);
  const byCounty = COUNTIES.map((county) => ({
    code: county.code,
    label: county.label,
    count: EXAMPLE_COUNTY_COUNTS[county.code] ?? 0,
  })).sort((a, b) => b.count - a.count);
  return {
    source: "example",
    total: byCounty.reduce((sum, item) => sum + item.count, 0),
    newLastMonth: EXAMPLE_MONTHLY[EXAMPLE_MONTHLY.length - 1],
    monthly: months.map((month, index) => ({ month, count: EXAMPLE_MONTHLY[index] })),
    byIndustry: INDUSTRIES.map((item) => ({ sni: item.sni, label: item.label, count: EXAMPLE_INDUSTRY_COUNTS[item.sni] ?? 0 })).sort(
      (a, b) => b.count - a.count,
    ),
    byCounty,
    growing: [
      { sni: "62010", label: "Datakonsulter", recent: 1180, previous: 1000, changePct: 18 },
      { sni: "96220", label: "Skönhetsvård", recent: 342, previous: 300, changePct: 14 },
      { sni: "41200", label: "Byggande av hus", recent: 1090, previous: 1000, changePct: 9 },
      { sni: "49410", label: "Vägtransport", recent: 318, previous: 300, changePct: 6 },
    ],
  };
}

const CITY_SHARE: Record<string, number> = {
  stockholm: 0.1,
  goteborg: 0.055,
  malmo: 0.035,
  uppsala: 0.022,
  linkoping: 0.016,
  vasteras: 0.014,
  helsingborg: 0.013,
  umea: 0.012,
};

const FORM_SHARE: Record<string, number> = { ab: 0.55, ef: 0.3, hb: 0.04, kb: 0.02, ek: 0.02, brf: 0.02 };

const SIZE_SHARE: Record<string, number> = {
  "0": 0.7,
  "1–4": 0.18,
  "5–9": 0.05,
  "10–19": 0.03,
  "20–49": 0.02,
  "50–99": 0.007,
  "100–199": 0.003,
  "200 eller fler": 0.002,
};

function fold(value: string): string {
  return value.toLocaleLowerCase("sv").replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/é/g, "e").trim();
}

/**
 * Ett räkneexempel för urvalet när registret inte är inkopplat. Andelarna är påhittade,
 * så resultatet märks alltid som exempeldata.
 */
export function exampleEstimate(selection: Selection, stats: RegisterStats = exampleStats()): UrvalResult {
  const filter = selectionSniFilter(selection);
  let share = 1;
  if (filter.kind === "none") share = 0;
  if (filter.kind === "codes") {
    const hits = stats.byIndustry.filter((item) => filter.codes.some((code) => code.replace(/\D/g, "") === item.sni));
    share = hits.length ? hits.reduce((sum, item) => sum + item.count, 0) / stats.total : 0.004;
  }
  if (filter.kind === "prefix") share = 0.02;
  const city = fold(selection.city ?? "");
  const county = stats.byCounty.find((item) => item.label === (selection.county ?? "").trim());
  if (city) share *= CITY_SHARE[city] ?? 0.006;
  else if (county) share *= county.count / stats.total;
  const forms = selection.forms ?? [];
  if (forms.length) share *= Math.min(1, forms.reduce((sum, form) => sum + (FORM_SHARE[form] ?? 0.01), 0));
  if (selection.employees) share *= SIZE_SHARE[selection.employees] ?? 0.01;
  const companies = Math.round(stats.total * share);
  const withPhone = Math.round(companies * 0.62);
  const withEmail = Math.round(companies * 0.41);
  const withSignatory = Math.round(companies * 0.35);
  return {
    source: "example",
    status: "ready",
    companies,
    phones: Math.round(withPhone * 1.3),
    signatoryPhones: withSignatory,
    emails: withEmail,
    withPhone,
    withEmail,
    withSignatory,
    preview: [],
    note: "Exempeldata: registret är inte inkopplat, så antalet är ett räkneexempel och inte riktiga bolag.",
  };
}

/** Länk som öppnar listbyggaren med branschen ifylld. */
export function builderHrefForSni(sni: string): string {
  if (INDUSTRIES.some((item) => item.sni === sni)) return `/?sni=${sni}#urval`;
  return `/?bransch=${encodeURIComponent(sni)}#urval`;
}

export function builderHrefForCounty(label: string): string {
  return `/?lan=${encodeURIComponent(label)}#urval`;
}

export const PRICE_EXAMPLES = [
  {
    title: "Frisörer i en stad",
    detail: "300 bolag, bara grunduppgifter",
    counts: { companies: 300, phones: 0, signatoryPhones: 0, emails: 0 },
    href: "/?sni=96210&tel=0&epost=0&firma=0#urval",
  },
  {
    title: "Byggbolag i ett län",
    detail: "4 000 bolag med 2 500 telefonnummer",
    counts: { companies: 4000, phones: 2500, signatoryPhones: 0, emails: 0 },
    href: "/?sni=41200&tel=1&epost=0&firma=0#urval",
  },
  {
    title: "Datakonsulter i hela Sverige",
    detail: "20 000 bolag med telefon, e-post och beslutsfattare",
    counts: { companies: 20000, phones: 12000, signatoryPhones: 7000, emails: 8000 },
    href: "/?sni=62010#urval",
  },
].map((item) => ({ ...item, quote: quote(item.counts) }));

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("sv-SE");
}

export function monthLabel(month: string): string {
  const [year, mm] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, mm - 1, 1)));
}

export function industryRows(rows: IndustryStat[]) {
  return rows.map((row) => ({ key: row.sni, label: row.label, count: row.count, detail: `SNI ${row.sni.slice(0, 2)}.${row.sni.slice(2)}` }));
}

export function countyRows(rows: CountyStat[]) {
  return rows.map((row) => ({ key: row.label, label: row.label, count: row.count }));
}
