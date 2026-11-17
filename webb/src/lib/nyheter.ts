import { formatCount, type NaringslivStats } from "@/lib/naringsliv";

export type NewsKind = "uppdatering" | "statistik" | "guide";

export type NewsPost = {
  slug: string;
  title: string;
  /** ISO-datum, YYYY-MM-DD. */
  date: string;
  kind: NewsKind;
  excerpt: string;
  body: string[];
  /** Sant när texten är ett exempel och inte en riktig nyhet. Visas då som "Exempeltext". */
  example: boolean;
  cta: { label: string; href: string };
};

export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  uppdatering: "Registret",
  statistik: "Statistik",
  guide: "Guide",
};

/**
 * Handskrivna inlägg. Byt mot riktiga inlägg, eller ett flöde från CMS, genom att ersätta listan.
 * Alla har example: true tills en människa har skrivit och granskat dem.
 */
export const WRITTEN_POSTS: NewsPost[] = [
  {
    slug: "sa-raknar-vi-ett-saljbart-bolag",
    title: "Så räknar vi ett bolag som säljbart",
    date: "2026-03-10",
    kind: "guide",
    excerpt: "Avregistrerade bolag, reklamspärr och bolag utan adress följer aldrig med. Här är hela listan.",
    body: [
      "Ett bolag räknas i utdraget när namn, gatuadress, ort och minst en SNI-kod finns.",
      "Bolag som är avregistrerade, har ett slutdatum, har reklamspärr eller är manuellt undantagna räknas inte. De tas bort vid varje uppdatering av registret.",
      "Saknas telefonnummer eller e-post lämnas fältet tomt, och ett tomt fält kostar inget.",
    ],
    example: true,
    cta: { label: "Se antalet i ert utdrag", href: "/#urval" },
  },
  {
    slug: "branschkoder-sni-i-utdraget",
    title: "Branschkoder: så hittar ni rätt SNI",
    date: "2026-03-05",
    kind: "guide",
    excerpt: "Skriv frisör, bygg eller 56110. Byggaren förstår både vardagsord och SNI-koder, även äldre koder.",
    body: [
      "SNI är koden som beskriver vad ett bolag gör. I byggaren kan ni skriva ett vanligt ord, som restaurang, eller själva koden.",
      "Några branscher finns kvar med äldre koder i registret. Byggaren räknar dem till samma bransch, så att inget bolag faller bort.",
      "Förslagen i sökrutan är alltid branscher, orter eller län. Vi säljer inte uppgifter om enskilda bolag.",
    ],
    example: true,
    cta: { label: "Prova en bransch", href: "/#urval" },
  },
  {
    slug: "sa-laser-ni-statistiken",
    title: "Sveriges näringsliv i siffror: så läser ni sidan",
    date: "2026-02-26",
    kind: "statistik",
    excerpt: "Antal bolag, nya bolag och branscher som växer. Varje siffra går att göra till ett utdrag med ett klick.",
    body: [
      "Statistiksidan räknar samma säljbara bolag som byggaren. Ett nytt bolag är ett bolag med registreringsdatum de senaste 30 dagarna fram till senaste uppdateringen.",
      "Branscher räknas på bolagets första SNI-kod. Län räknas på sätet i registret.",
      "Klicka på en stapel så öppnas byggaren med den branschen eller det länet ifyllt.",
    ],
    example: true,
    cta: { label: "Öppna statistiken", href: "/statistik" },
  },
];

function isoDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(date);
}

/** Inlägget som skrivs av sig självt vid varje lyckad synk av registret. */
export function registerUpdatePost(stats: NaringslivStats): NewsPost {
  const day = isoDay(stats.updatedIso);
  const top = stats.growing[0];
  return {
    slug: `registret-uppdaterat-${day}`,
    title: `Registret uppdaterat: ${formatCount(stats.added)} nya bolag`,
    date: day,
    kind: "uppdatering",
    excerpt: `${formatCount(stats.total)} säljbara bolag i registret just nu. ${formatCount(stats.added)} har registrerats de senaste ${stats.windowDays} dagarna${top ? `, flest inom ${top.label.toLowerCase()}` : ""}.`,
    body: [
      `Registret uppdaterades ${day}. Det innehåller nu ${formatCount(stats.total)} bolag som går att ta med i ett utdrag.`,
      `${formatCount(stats.added)} bolag har registreringsdatum de senaste ${stats.windowDays} dagarna.`,
      ...(top ? [`Flest nya bolag finns inom ${top.label.toLowerCase()}: ${formatCount(top.added)} stycken.`] : []),
      "Utdrag som skapas från och med nu tas från den här uppdateringen.",
    ],
    example: stats.example,
    cta: { label: "Bygg ett utdrag från uppdateringen", href: "/#urval" },
  };
}

/** Alla inlägg, nyast först. */
export function newsFeed(stats: NaringslivStats): NewsPost[] {
  return [registerUpdatePost(stats), ...WRITTEN_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function newsDate(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
