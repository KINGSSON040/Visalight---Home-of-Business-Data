import type { UrvalResult } from "@/lib/urval";

export type StatRow = {
  key: string;
  label: string;
  count: number;
  /** Öppnar byggaren med just den här delen ifylld. */
  href: string;
};

export type GrowthRow = StatRow & { added: number };

export type MonthRow = { month: string; label: string; count: number };

/**
 * Siffror om Sveriges näringsliv för kundsidan och /statistik.
 * example är true när siffrorna inte kommer från registret. De ska då alltid märkas "exempeldata".
 */
export type NaringslivStats = {
  source: "register" | "example";
  example: boolean;
  total: number;
  phones: number;
  signatoryPhones: number;
  emails: number;
  withPhone: number;
  withEmail: number;
  withSignatory: number;
  /** Nya bolag med registreringsdatum de senaste WINDOW_DAYS dagarna. */
  added: number;
  windowDays: number;
  byIndustry: StatRow[];
  byCounty: StatRow[];
  growing: GrowthRow[];
  monthly: MonthRow[];
  /** Senaste lyckade synk som ISO-datum, för automatiska nyhetsinlägg. */
  updatedIso: string;
};

export const WINDOW_DAYS = 30;

/**
 * Påhittade, avrundade tal som bara visar hur sidan ser ut. De är inte Sveriges riktiga siffror
 * och visas alltid med etiketten "exempeldata".
 */
export const EXAMPLE_STATS: NaringslivStats = {
  source: "example",
  example: true,
  total: 1_000_000,
  phones: 400_000,
  signatoryPhones: 150_000,
  emails: 250_000,
  withPhone: 350_000,
  withEmail: 220_000,
  withSignatory: 140_000,
  added: 5_000,
  windowDays: WINDOW_DAYS,
  byIndustry: [
    { key: "41200", label: "Byggande av hus", count: 60_000, href: "/?sni=41200#urval" },
    { key: "62010", label: "Datakonsulter", count: 45_000, href: "/?sni=62010#urval" },
    { key: "56110", label: "Restaurangverksamhet", count: 30_000, href: "/?sni=56110#urval" },
    { key: "69201", label: "Redovisning och bokföring", count: 20_000, href: "/?sni=69201#urval" },
    { key: "96210", label: "Frisörer och barberare", count: 15_000, href: "/?sni=96210#urval" },
    { key: "49410", label: "Vägtransport", count: 10_000, href: "/?sni=49410#urval" },
  ],
  byCounty: [
    { key: "01", label: "Stockholms län", count: 300_000, href: "/?lan=Stockholms+l%C3%A4n#urval" },
    { key: "14", label: "Västra Götalands län", count: 180_000, href: "/?lan=V%C3%A4stra+G%C3%B6talands+l%C3%A4n#urval" },
    { key: "12", label: "Skåne län", count: 140_000, href: "/?lan=Sk%C3%A5ne+l%C3%A4n#urval" },
    { key: "03", label: "Uppsala län", count: 40_000, href: "/?lan=Uppsala+l%C3%A4n#urval" },
    { key: "05", label: "Östergötlands län", count: 40_000, href: "/?lan=%C3%96sterg%C3%B6tlands+l%C3%A4n#urval" },
    { key: "06", label: "Jönköpings län", count: 35_000, href: "/?lan=J%C3%B6nk%C3%B6pings+l%C3%A4n#urval" },
  ],
  growing: [
    { key: "62010", label: "Datakonsulter", count: 45_000, added: 600, href: "/?sni=62010#urval" },
    { key: "41200", label: "Byggande av hus", count: 60_000, added: 500, href: "/?sni=41200#urval" },
    { key: "96220", label: "Skönhetsvård", count: 8_000, added: 300, href: "/?sni=96220#urval" },
    { key: "56110", label: "Restaurangverksamhet", count: 30_000, added: 200, href: "/?sni=56110#urval" },
  ],
  monthly: [
    { month: "2025-10", label: "okt", count: 4_000 },
    { month: "2025-11", label: "nov", count: 4_500 },
    { month: "2025-12", label: "dec", count: 3_500 },
    { month: "2026-01", label: "jan", count: 6_000 },
    { month: "2026-02", label: "feb", count: 5_500 },
    { month: "2026-03", label: "mar", count: 5_000 },
  ],
  updatedIso: "2026-03-12T09:00:00+01:00",
};

/** Byggarens tal när inget filter är valt: hela registret. */
export function totalUrval(stats: NaringslivStats): UrvalResult {
  return {
    source: stats.source,
    status: "ready",
    companies: stats.total,
    phones: stats.phones,
    signatoryPhones: stats.signatoryPhones,
    emails: stats.emails,
    withPhone: stats.withPhone,
    withEmail: stats.withEmail,
    withSignatory: stats.withSignatory,
    preview: [],
    note: stats.example ? "Exempeldata. Registret är inte inkopplat, så hela-Sverige-talet är ett påhittat exempel." : "",
  };
}

export function formatCount(value: number): string {
  return value.toLocaleString("sv-SE");
}
