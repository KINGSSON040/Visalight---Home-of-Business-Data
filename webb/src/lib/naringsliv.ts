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

/**
 * Märkt exempel på aktiva företag som inte spärrat reklam, när registret inte är inkopplat.
 * Talen ska inte se ut som hela SCB-registret. Vilande, inaktiva, avregistrerade
 * och reklamspärrade ingår inte. Länets tal summerar till 420 000.
 */
const EXAMPLE_INDUSTRY_COUNTS: Record<string, number> = {
  "41200": 17100,
  "62010": 14600,
  "56110": 8200,
  "69201": 5000,
  "96210": 4300,
  "49410": 3900,
  "96220": 3200,
  "47112": 2100,
  "69202": 1100,
  "86211": 400,
  "43210": 7600,
  "43221": 5400,
  "43341": 3100,
  "81210": 6800,
  "69101": 2400,
  "68320": 1900,
  "55101": 1500,
  "86230": 2800,
  "95311": 4500,
  "73111": 2200,
  "71110": 1800,
  "78201": 900,
  "56210": 700,
  "10710": 600,
  "81300": 1600,
  "49420": 800,
  "80010": 500,
  "47123": 3400,
  "75000": 700,
  "93130": 1100,
  "85100": 1300,
  "74200": 2100,
  "68310": 1700,
};

const EXAMPLE_COUNTY_COUNTS: Record<string, number> = {
  "01": 103220,
  "14": 71186,
  "12": 60508,
  "05": 17797,
  "03": 16373,
  "06": 14237,
  "13": 14237,
  "20": 11746,
  "18": 10678,
  "17": 10678,
  "24": 10678,
  "04": 9966,
  "08": 9966,
  "21": 9966,
  "19": 8898,
  "25": 8898,
  "22": 8186,
  "07": 7831,
  "23": 6763,
  "10": 4985,
  "09": 3203,
};

const EXAMPLE_MONTHLY = [1850, 1990, 2460, 2240, 2100, 1710, 1460, 1920, 2350, 2210, 2170, 2280];

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

/** Exempel på aktiva, säljbara företag när registret saknas. Ska alltid visas märkt som exempel, aldrig som hela registret. */
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
      { sni: "62010", label: "Datakonsulter", recent: 420, previous: 356, changePct: 18 },
      { sni: "96220", label: "Skönhetsvård", recent: 122, previous: 107, changePct: 14 },
      { sni: "41200", label: "Byggande av hus", recent: 388, previous: 356, changePct: 9 },
      { sni: "49410", label: "Vägtransport", recent: 113, previous: 107, changePct: 6 },
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
 * så resultatet inte ska läsas som hela registret.
 */
export function exampleEstimate(selection: Selection, stats: RegisterStats = exampleStats()): UrvalResult {
  const filter = selectionSniFilter(selection);
  let share = 1;
  if (filter.kind === "none") share = 0;
  if (filter.kind === "codes") {
    const known = [...new Set(filter.codes.map((code) => code.replace(/\D/g, "")))].filter((code) => EXAMPLE_INDUSTRY_COUNTS[code] != null);
    share = known.length ? known.reduce((sum, code) => sum + EXAMPLE_INDUSTRY_COUNTS[code], 0) / stats.total : 0.004;
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
    note: "Exempelsiffror. Registret är inte inkopplat. Antalet är aktiva företag som inte spärrat reklam, inte hela registret.",
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
    detail: "14 600 aktiva bolag med telefon, e-post och beslutsfattare",
    counts: { companies: 14600, phones: 9052, signatoryPhones: 5110, emails: 5986 },
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
