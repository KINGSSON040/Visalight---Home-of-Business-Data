import { formatCount, type RegisterStats } from "@/lib/naringsliv";

/**
 * Inlägg på /nyheter. example: true betyder exempeltext som ska bytas mot ett riktigt inlägg.
 * Inlägg från registret skapas i registerPost() och kan ersätta exemplen helt.
 */
export type NewsPost = {
  slug: string;
  /** ISO-datum, YYYY-MM-DD. */
  date: string;
  kind: "Uppdatering" | "Statistik" | "Nyhet";
  title: string;
  lead: string;
  body: string[];
  cta?: { label: string; href: string };
  example: boolean;
};

export const NEWS_POSTS: NewsPost[] = [
  {
    slug: "fler-datakonsulter-startar-bolag",
    date: "2026-11-10",
    kind: "Statistik",
    title: "Dataprogrammering startar flest nya bolag i höst",
    lead: "Exempeltext om nya bolag inom dataprogrammering. Siffrorna byts när registret är inkopplat.",
    body: [
      "Exempeltext. När registret är inkopplat skrivs den här texten om med riktiga siffror från den senaste uppdateringen.",
      "Nya bolag är ofta små och har färre kontaktuppgifter. Därför syns det tydligt i utdraget hur många som har telefon och e-post innan ni köper.",
    ],
    cta: { label: "Bygg ett utdrag på dataprogrammering", href: "/?sni=62010#urval" },
    example: true,
  },
  {
    slug: "sni-2025-i-utdraget",
    date: "2026-10-28",
    kind: "Nyhet",
    title: "SNI 2025 gäller nu i alla utdrag",
    lead: "Branschkoderna följer SCB:s nya indelning. Gamla koder översätts automatiskt i sökrutan.",
    body: [
      "Exempeltext. Skriver ni en äldre SNI-kod hittar sökrutan den nya koden åt er, och antalet räknas på samma sätt.",
      "Frisörer och barberare har till exempel gått från 96.021 till 96.210. Båda koderna ger samma urval.",
    ],
    cta: { label: "Sök på en SNI-kod", href: "/#urval" },
    example: true,
  },
  {
    slug: "reklamsparr-rensas-vid-varje-uppdatering",
    date: "2026-10-14",
    kind: "Uppdatering",
    title: "Reklamspärrade bolag rensas vid varje uppdatering",
    lead: "Bolag som spärrat reklam, gått i konkurs eller avregistrerats följer aldrig med i filen.",
    body: [
      "Exempeltext. Varje gång registret uppdateras tas bolag bort som inte ska kontaktas, så filen går att använda direkt.",
      "Ni betalar bara för de bolag och uppgifter som faktiskt finns i utdraget.",
    ],
    example: true,
  },
];

/** Ett automatiskt inlägg om senaste registeruppdateringen. Utan register: inga tal. */
export function registerPost(stats: RegisterStats, updatedLabel: string, isoDate: string): NewsPost {
  if (stats.source !== "register") {
    return {
      slug: "registret-uppdaterat",
      date: "",
      kind: "Uppdatering",
      title: "Ingen uppdatering från registret",
      lead: "Registret är inte inkopplat.",
      body: ["Antal per bransch, område och storlek publiceras när registret är inkopplat."],
      example: false,
    };
  }
  const top = stats.byIndustry[0]?.label.toLocaleLowerCase("sv");
  return {
    slug: "registret-uppdaterat",
    date: isoDate,
    kind: "Uppdatering",
    title: `Registret uppdaterat, ${formatCount(stats.newLastMonth)} nya bolag`,
    lead: `Senaste uppdateringen ${updatedLabel}. ${formatCount(stats.total)} aktiva företag som inte spärrat reklam. Siffran följer den uppdateringen.`,
    body: [
      "Inlägget skapas automatiskt från den senaste lyckade uppdateringen av registret.",
      `${formatCount(stats.newLastMonth)} bolag har registrerats den senaste månaden.${top ? ` Störst bransch just nu är ${top}.` : ""}`,
    ],
    cta: { label: "Bygg ett utdrag på färska bolag", href: "/#urval" },
    example: false,
  };
}

/** Bara uppdateringen från registret. Påhittade exempelinlägg visas inte. */
export function allPosts(stats: RegisterStats, updatedLabel: string, isoDate: string): NewsPost[] {
  return [registerPost(stats, updatedLabel, isoDate)];
}

export function formatNewsDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
