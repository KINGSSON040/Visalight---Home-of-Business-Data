/** Byt DEFAULT_THEME när ett utseende ska bli den fasta standarden. */
export const DEFAULT_THEME = "norrsken" as const;

export const THEMES = [
  {
    id: "norrsken",
    name: "Norrsken",
    intent: "Tänkt för säljsidan: grönt, korall och magenta. Inget blått.",
  },
  {
    id: "klardag",
    name: "Klar dag",
    intent: "Tänkt för luft: vit botten, magenta text, gul knapp.",
  },
  {
    id: "natt",
    name: "Natthimmel",
    intent: "Tänkt för kvällsläsning: mörk plommon och skogsgrönt.",
  },
  {
    id: "signal",
    name: "Signal",
    intent: "Tänkt för siffrorna: stora gröna tal, gult och rött bara på pris och varning.",
  },
  {
    id: "varm",
    name: "Varm kväll",
    intent: "Tänkt för en varm kväll: magenta header och orangea tal.",
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
