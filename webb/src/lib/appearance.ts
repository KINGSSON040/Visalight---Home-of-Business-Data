/** Byt DEFAULT_THEME när ett utseende ska bli den fasta standarden. */
export const DEFAULT_THEME = "norrsken" as const;

export const THEMES = [
  {
    id: "norrsken",
    name: "Norrsken",
    intent: "För mejlutskick. Blå header, grön siffra, norrsken i märket.",
  },
  {
    id: "klardag",
    name: "Klar dag",
    intent: "För den som jämför priser. Mycket vitt, blå text, gul knapp.",
  },
  {
    id: "natt",
    name: "Natthimmel",
    intent: "För kvällsläsning. Mörkblå botten, cyan och grönt som lyser.",
  },
  {
    id: "signal",
    name: "Signal",
    intent: "För den som bara vill se antalet. Gröna siffror, rött bara som varning.",
  },
  {
    id: "violett",
    name: "Kvällsljus",
    intent: "För en mjukare kampanj. Violett header, gul gnista, grön bekräftelse.",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_FILTER = "kompakt" as const;

export const FILTERS = [
  {
    id: "steg",
    name: "Steg för steg",
    intent: "En fråga i taget. Bra första gången, särskilt på mobilen.",
  },
  {
    id: "kompakt",
    name: "Kompakt kort",
    intent: "Allt synligt. Rekommenderas på laptop när besökaren kommer från mejl.",
  },
  {
    id: "fraga",
    name: "Frågor",
    intent: "Korta val med stora svar. Bra när man inte vet vad man ska skriva.",
  },
  {
    id: "sida",
    name: "Sidopanel",
    intent: "Filter i två kolumner under det stora antalet, så resultatet alltid syns.",
  },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export function themeFromParam(value: string | null): ThemeId {
  return THEMES.some((item) => item.id === value) ? (value as ThemeId) : DEFAULT_THEME;
}

export function filterFromParam(value: string | null): FilterId {
  return FILTERS.some((item) => item.id === value) ? (value as FilterId) : DEFAULT_FILTER;
}
