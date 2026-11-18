import { INDUSTRIES } from "@/lib/catalog";

export type IndustryStat = { sni: string; label: string; count: number };
export type CountyStat = { code: string; label: string; count: number };
export type SizeStat = { label: string; count: number };
export type GrowthStat = { sni: string; label: string; recent: number; previous: number; changePct: number };
export type MonthStat = { month: string; count: number };

/** Siffrorna om näringslivet. source "example" betyder att registret saknas och att inga tal får visas. */
export type RegisterStats = {
  source: "register" | "example";
  total: number;
  newLastMonth: number;
  monthly: MonthStat[];
  byIndustry: IndustryStat[];
  byCounty: CountyStat[];
  bySize: SizeStat[];
  growing: GrowthStat[];
};

export function industryName(sni: string): string {
  return INDUSTRIES.find((item) => item.sni === sni)?.label ?? `SNI ${sni.slice(0, 2)}.${sni.slice(2)}`;
}

/** Tom statistik. Inga tal, eftersom registret inte är inkopplat. */
export function exampleStats(): RegisterStats {
  return {
    source: "example",
    total: 0,
    newLastMonth: 0,
    monthly: [],
    byIndustry: [],
    byCounty: [],
    bySize: [],
    growing: [],
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

export function builderHrefForSize(label: string): string {
  return `/?anst=${encodeURIComponent(label)}#urval`;
}

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

export function sizeRows(rows: SizeStat[]) {
  return rows.map((row) => ({ key: row.label, label: row.label, count: row.count }));
}
