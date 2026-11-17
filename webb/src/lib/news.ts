import type { RegisterOverview } from "@/lib/register-stats";

export type NewsKind = "uppdatering" | "statistik" | "nyhet";

export type NewsItem = {
  slug: string;
  kind: NewsKind;
  /** ISO-datum, YYYY-MM-DD. */
  date: string;
  title: string;
  lead: string;
  body: string[];
  /** true när texten är en platshållare och inte en riktig nyhet. */
  example: boolean;
  cta?: { label: string; href: string };
};

export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  uppdatering: "Registret",
  statistik: "Statistik",
  nyhet: "Nyhet",
};

/**
 * Redaktionella inlägg. Byt mot riktiga texter, eller låt en synk skriva hit.
 * Allt med example: true märks som exempeltext på sidan.
 */
const EDITORIAL: NewsItem[] = [
  {
    slug: "sa-raknar-vi-nya-bolag",
    kind: "statistik",
    date: "2026-11-10",
    title: "Så räknar vi nya bolag i statistiken",
    lead: "Ett bolag räknas som nytt den månad det registreras. Avregistrerade och reklamspärrade bolag räknas aldrig.",
    body: [
      "Siffrorna under Sveriges näringsliv i siffror bygger på samma register som utdragen. Ett bolag räknas när det har namn, gatuadress, ort och bransch.",
      "Nya bolag räknas på registreringsdatum. Ett bolag som registrerades och avregistrerades samma månad räknas inte.",
      "Det här är en exempeltext. Den byts mot en riktig beskrivning när registret är inkopplat.",
    ],
    example: true,
    cta: { label: "Se all statistik", href: "/statistik" },
  },
  {
    slug: "fem-branscher-att-halla-koll-pa",
    kind: "nyhet",
    date: "2026-11-03",
    title: "Fem branscher att hålla koll på i vinter",
    lead: "Restaurang, bygg och redovisning brukar röra sig mest när året tar slut. Här är hur ni hittar dem i listbyggaren.",
    body: [
      "Vintern är högsäsong för bokslut, julbord och renoveringar inomhus. Det märks på vilka bolag som startas och vilka som söker leverantörer.",
      "Välj branschen i listbyggaren och se direkt hur många bolag som finns och vad utdraget kostar.",
      "Det här är en exempeltext. Siffror i texten är inte hämtade från registret.",
    ],
    example: true,
    cta: { label: "Öppna listbyggaren", href: "/#urval" },
  },
];

function formatCount(value: number): string {
  return value.toLocaleString("sv-SE");
}

/** Inlägget som skrivs automatiskt från registret vid varje uppdatering. */
export function registerUpdateNews(overview: RegisterOverview, isoDate: string): NewsItem {
  return {
    slug: "registret-uppdaterat",
    kind: "uppdatering",
    date: isoDate,
    title: `Registret uppdaterat: ${formatCount(overview.newLastMonth)} nya bolag`,
    lead: `${formatCount(overview.total)} säljbara företag finns nu i registret. ${formatCount(
      overview.newLastMonth,
    )} har tillkommit den senaste månaden.`,
    body: [
      `Vid den senaste uppdateringen fanns ${formatCount(overview.total)} säljbara företag i registret.`,
      `${formatCount(overview.newLastMonth)} bolag har registrerats den senaste månaden. De kommer med i nästa utdrag automatiskt.`,
      overview.real
        ? "Talen kommer direkt från registret."
        : "Registret är inte inkopplat i den här körningen. Talen är exempeldata.",
    ],
    example: !overview.real,
    cta: { label: `Bygg ett utdrag bland ${formatCount(overview.newLastMonth)} nya bolag`, href: "/#urval" },
  };
}

export function allNews(overview: RegisterOverview, isoDate: string): NewsItem[] {
  return [registerUpdateNews(overview, isoDate), ...EDITORIAL].sort((a, b) => b.date.localeCompare(a.date));
}

export function newsBySlug(overview: RegisterOverview, isoDate: string, slug: string): NewsItem | undefined {
  return allNews(overview, isoDate).find((item) => item.slug === slug);
}

export function formatNewsDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
