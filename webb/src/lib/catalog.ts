import { quote, type PriceCounts, type PriceQuote } from "@/lib/pricing";

export type Company = {
  orgNr: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  sni: string;
  industry: string;
  form: string;
  county: string;
  employees: string;
  phones: string[];
  signatoryPhones: string[];
  emails: string[];
};

export type Selection = {
  query: string;
  city: string;
  bransch: string;
  sni: string;
  forms: string[];
  phones: boolean;
  signatory: boolean;
  emails: boolean;
};

/** Bolagsformer som förekommer i Sverige. Koden är intern, etiketten är den som visas. */
export const LEGAL_FORMS: { code: string; label: string }[] = [
  { code: "ab", label: "Aktiebolag" },
  { code: "ef", label: "Enskild firma" },
  { code: "hb", label: "Handelsbolag" },
  { code: "kb", label: "Kommanditbolag" },
  { code: "ek", label: "Ekonomisk förening" },
  { code: "brf", label: "Bostadsrättsförening" },
  { code: "if", label: "Ideell förening" },
  { code: "stiftelse", label: "Stiftelse" },
  { code: "filial", label: "Filial" },
  { code: "europabolag", label: "Europabolag" },
  { code: "samfallighet", label: "Samfällighet" },
  { code: "trossamfund", label: "Trossamfund" },
  { code: "enkelt", label: "Enkelt bolag" },
  { code: "kommun", label: "Kommun" },
  { code: "region", label: "Region" },
  { code: "stat", label: "Statlig enhet" },
];

export const INDUSTRIES: { sni: string; label: string }[] = [
  { sni: "56101", label: "Restauranger" },
  { sni: "41200", label: "Byggande av hus" },
  { sni: "62010", label: "Datakonsulter" },
  { sni: "47112", label: "Livsmedelshandel" },
  { sni: "86211", label: "Vårdcentraler" },
  { sni: "49410", label: "Vägtransport" },
  { sni: "96021", label: "Frisörsalonger" },
  { sni: "69201", label: "Redovisning" },
];


const COUNTY_BY_CITY: Record<string, string> = {
  Stockholm: "Stockholms län",
  Malmö: "Skåne län",
  Göteborg: "Västra Götalands län",
  Umeå: "Västerbottens län",
  Västerås: "Västmanlands län",
  Uppsala: "Uppsala län",
  Linköping: "Östergötlands län",
  Helsingborg: "Skåne län",
};

const EMPLOYEE_BY_ORG: Record<string, string> = {
  "559100-1001": "10–19",
  "559100-1002": "5–9",
  "559100-1003": "1–4",
  "559100-1004": "20–49",
  "559100-1005": "10–19",
  "559100-1006": "5–9",
  "559100-1007": "20–49",
  "559100-1008": "50–99",
  "559100-1009": "100–199",
  "559100-1010": "1–4",
  "559100-1011": "5–9",
  "559100-1012": "0",
  "559100-1013": "50–99",
  "559100-1014": "1–4",
  "559100-1015": "10–19",
  "559100-1016": "20–49",
  "559100-1017": "50–99",
  "559100-1018": "5–9",
  "559100-1019": "1–4",
  "559100-1020": "5–9",
  "559100-1021": "0",
  "559100-1022": "10–19",
  "559100-1023": "20–49",
  "559100-1024": "5–9",
};

/** Län som används i urvalet. Alla län finns med, även när exempelregistret saknar bolag där. */
export const COUNTIES = [
  "Stockholms län",
  "Uppsala län",
  "Södermanlands län",
  "Östergötlands län",
  "Jönköpings län",
  "Kronobergs län",
  "Kalmar län",
  "Gotlands län",
  "Blekinge län",
  "Skåne län",
  "Hallands län",
  "Västra Götalands län",
  "Värmlands län",
  "Örebro län",
  "Västmanlands län",
  "Dalarnas län",
  "Gävleborgs län",
  "Västernorrlands län",
  "Jämtlands län",
  "Västerbottens län",
  "Norrbottens län",
];

/** Storleksklasser i samma indelning som SCB brukar redovisa anställda. */
export const EMPLOYEE_BANDS = ["0", "1–4", "5–9", "10–19", "20–49", "50–99", "100–199", "200 eller fler"];

/** Påhittade bolag. Tomma kontaktfält är tomma med flit. */
export const COMPANIES: Company[] = [
  company("559100-1001", "Exempelbageriet Nord AB", "Exempelgatan 4", "111 22", "Stockholm", "56101", ["010-000 00 01", "010-000 00 02"], ["010-000 00 91"], ["bakern@exempel.test"], "ab"),
  company("559100-1002", "Södra Kajens Kök AB", "Exempelgatan 18", "117 33", "Stockholm", "56101", ["010-000 00 03"], [], ["kajen@exempel.test"], "ab"),
  company("559100-1003", "Hornstulls Matsal", "Exempelgatan 27", "117 28", "Stockholm", "56101", [], [], [], "ef"),
  company("559100-1004", "Hamnens Snickeri AB", "Exempelgatan 6", "211 20", "Malmö", "41200", ["010-000 00 04"], [], [], "ab"),
  company("559100-1005", "Västra Taket HB", "Exempelgatan 9", "411 03", "Göteborg", "41200", ["010-000 00 05"], ["010-000 00 92"], ["taket@exempel.test"], "hb"),
  company("559100-1006", "Björkens Bygg KB", "Exempelgatan 2", "903 26", "Umeå", "41200", [], [], ["bjorken@exempel.test"], "kb"),
  company("559100-1007", "Norrlands Kod AB", "Exempelgatan 11", "903 26", "Umeå", "62010", ["010-000 00 06"], [], ["kod@exempel.test"], "ab"),
  company("559100-1008", "Mälarens System AB", "Exempelgatan 8", "722 12", "Västerås", "62010", [], [], ["system@exempel.test"], "ab"),
  company("559100-1009", "Kajplatsens Data AB", "Exempelgatan 15", "411 03", "Göteborg", "62010", ["010-000 00 07", "010-000 00 08"], ["010-000 00 93"], ["data@exempel.test"], "ab"),
  company("559100-1010", "Torgets Handel ekonomisk förening", "Exempelgatan 1", "753 20", "Uppsala", "47112", ["010-000 00 09"], [], [], "ek"),
  company("559100-1011", "Lindens Livs AB", "Exempelgatan 14", "582 22", "Linköping", "47112", ["010-000 00 10"], [], ["livs@exempel.test"], "ab"),
  company("559100-1012", "Hamnpaviljongen BRF", "Exempelgatan 3", "252 20", "Helsingborg", "47112", [], [], [], "brf"),
  company("559100-1013", "Exempelvården City AB", "Exempelgatan 20", "111 22", "Stockholm", "86211", ["010-000 00 11"], ["010-000 00 94"], ["varden@exempel.test"], "ab"),
  company("559100-1014", "Åsens Mottagning", "Exempelgatan 7", "753 20", "Uppsala", "86211", ["010-000 00 12"], [], [], "ef"),
  company("559100-1015", "Kustens Vård AB", "Exempelgatan 16", "211 20", "Malmö", "86211", [], [], ["kusten@exempel.test"], "ab"),
  company("559100-1016", "Inlandets Åkeri AB", "Exempelgatan 5", "582 22", "Linköping", "49410", ["010-000 00 13"], ["010-000 00 95"], ["akeriet@exempel.test"], "ab"),
  company("559100-1017", "Nattens Transport HB", "Exempelgatan 19", "411 03", "Göteborg", "49410", ["010-000 00 14", "010-000 00 15"], [], [], "hb"),
  company("559100-1018", "Fjällens Frakt KB", "Exempelgatan 10", "903 26", "Umeå", "49410", [], [], [], "kb"),
  company("559100-1019", "Salongen vid Ån AB", "Exempelgatan 21", "111 22", "Stockholm", "96021", ["010-000 00 16"], [], ["salongen@exempel.test"], "ab"),
  company("559100-1020", "Klippans Salong AB", "Exempelgatan 12", "211 20", "Malmö", "96021", ["010-000 00 17"], [], ["klippan@exempel.test"], "ab"),
  company("559100-1021", "Bryggans Sax AB", "Exempelgatan 13", "252 20", "Helsingborg", "96021", [], [], [], "ab"),
  company("559100-1022", "Kontoret vid Hamnen AB", "Exempelgatan 17", "211 20", "Malmö", "69201", ["010-000 00 18"], ["010-000 00 96"], ["kontoret@exempel.test"], "ab"),
  company("559100-1023", "Siffrans Byrå AB", "Exempelgatan 22", "722 12", "Västerås", "69201", ["010-000 00 19"], [], ["siffran@exempel.test"], "ab"),
  company("559100-1024", "Nordlig Revision AB", "Exempelgatan 23", "903 26", "Umeå", "69201", [], [], ["revision@exempel.test"], "ab"),
];

export const CITIES = [...new Set(COMPANIES.map((item) => item.city))].sort((a, b) =>
  a.localeCompare(b, "sv"),
);

export const defaultSelection: Selection = {
  query: "",
  city: "",
  bransch: "",
  sni: "",
  forms: [],
  phones: true,
  signatory: true,
  emails: true,
};

export type SuggestionKind = "bolag" | "bransch" | "ort" | "form";

export type Suggestion = {
  id: string;
  kind: SuggestionKind;
  title: string;
  detail: string;
  apply: {
    query?: string;
    city?: string;
    bransch?: string;
    sni?: string;
    form?: string;
  };
};

function company(
  orgNr: string,
  name: string,
  street: string,
  postalCode: string,
  city: string,
  sni: string,
  phones: string[],
  signatoryPhones: string[],
  emails: string[],
  form: string,
): Company {
  const industry = INDUSTRIES.find((item) => item.sni === sni)?.label ?? sni;
  return {
    orgNr,
    name,
    street,
    postalCode,
    city,
    sni,
    industry,
    form,
    county: COUNTY_BY_CITY[city] ?? "",
    employees: EMPLOYEE_BY_ORG[orgNr] ?? "",
    phones,
    signatoryPhones,
    emails,
  };
}


export function lookupCompanies(query: string): Company[] {
  const raw = fold(query.trim());
  if (raw.length < 2) return [];
  const digits = query.replace(/\D/g, "");
  return COMPANIES.filter((item) => {
    const org = item.orgNr.replace("-", "");
    return (
      fold(item.name).includes(raw) ||
      fold(item.city).includes(raw) ||
      (digits.length >= 2 && (org.includes(digits) || item.sni.startsWith(digits)))
    );
  }).slice(0, 8);
}

export function countAudience(input: { sni: string; county: string; employees: string }): {
  companies: number;
  decisionMakers: number;
} {
  const rows = COMPANIES.filter((item) => {
    if (input.sni && item.sni !== input.sni) return false;
    if (input.county && item.county !== input.county) return false;
    if (input.employees && item.employees !== input.employees) return false;
    return true;
  });
  const decisionMakers = rows.reduce((sum, item) => sum + item.signatoryPhones.length, 0);
  return { companies: rows.length, decisionMakers };
}

export function legalFormLabel(code: string): string {
  return LEGAL_FORMS.find((item) => item.code === code)?.label ?? code;
}

export function industryLabel(sni: string): string {
  return INDUSTRIES.find((item) => item.sni === sni)?.label ?? sni;
}

function fold(value: string): string {
  return value
    .toLocaleLowerCase("sv")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function formsOf(selection: { forms?: string[] }): string[] {
  return Array.isArray(selection.forms) ? selection.forms : [];
}

function countWhere(predicate: (company: Company) => boolean): number {
  return COMPANIES.filter(predicate).length;
}

export function suggestQuery(text: string): Suggestion[] {
  const needle = fold(text.trim());
  if (needle.length < 1) return [];
  const digits = text.replace(/\D/g, "");
  const found: Suggestion[] = [];

  for (const item of COMPANIES) {
    const hay = [item.name, item.orgNr, item.industry, item.sni, item.city, legalFormLabel(item.form)];
    const hit =
      hay.some((part) => fold(part).includes(needle)) ||
      (digits.length >= 2 && (item.sni.startsWith(digits) || item.orgNr.replace("-", "").includes(digits)));
    if (!hit) continue;
    found.push({
      id: `bolag-${item.orgNr}`,
      kind: "bolag",
      title: item.name,
      detail: `${item.city} · ${item.industry} · ${legalFormLabel(item.form)}`,
      apply: { query: item.name },
    });
  }

  for (const item of INDUSTRIES) {
    if (!fold(item.label).includes(needle) && !(digits.length > 0 && item.sni.startsWith(digits))) continue;
    const count = countWhere((company) => company.sni === item.sni);
    found.push({
      id: `bransch-${item.sni}`,
      kind: "bransch",
      title: item.label,
      detail: `SNI ${item.sni} · ${count.toLocaleString("sv-SE")} exempelbolag`,
      apply: { query: item.label },
    });
  }

  for (const city of CITIES) {
    if (!fold(city).includes(needle)) continue;
    const count = countWhere((company) => company.city === city);
    found.push({
      id: `ort-${city}`,
      kind: "ort",
      title: city,
      detail: `${count.toLocaleString("sv-SE")} exempelbolag`,
      apply: { city, query: "" },
    });
  }

  for (const form of LEGAL_FORMS) {
    if (!fold(form.label).includes(needle)) continue;
    const count = countWhere((company) => company.form === form.code);
    found.push({
      id: `form-${form.code}`,
      kind: "form",
      title: form.label,
      detail: count
        ? `${count.toLocaleString("sv-SE")} exempelbolag`
        : "Bolagsform i Sverige · inga exempelbolag i förhandsvisningen",
      apply: { form: form.code, query: "" },
    });
  }

  const limits: Record<SuggestionKind, number> = { bolag: 4, bransch: 3, ort: 3, form: 3 };
  const used: Record<SuggestionKind, number> = { bolag: 0, bransch: 0, ort: 0, form: 0 };
  return found.filter((item) => {
    if (used[item.kind] >= limits[item.kind]) return false;
    used[item.kind] += 1;
    return true;
  });
}

export function suggestCities(text: string): Suggestion[] {
  const needle = fold(text.trim());
  return CITIES.filter((city) => !needle || fold(city).includes(needle)).map((city) => {
    const count = countWhere((company) => company.city === city);
    return {
      id: `ort-${city}`,
      kind: "ort" as const,
      title: city,
      detail: `${count.toLocaleString("sv-SE")} exempelbolag`,
      apply: { city },
    };
  });
}

export function suggestIndustries(text: string): Suggestion[] {
  const needle = fold(text.trim());
  const digits = text.replace(/\D/g, "");
  return INDUSTRIES.filter((item) => {
    if (!needle) return true;
    return fold(item.label).includes(needle) || (digits.length > 0 && item.sni.startsWith(digits));
  }).map((item) => {
    const count = countWhere((company) => company.sni === item.sni);
    return {
      id: `bransch-${item.sni}`,
      kind: "bransch" as const,
      title: item.label,
      detail: `SNI ${item.sni} · ${count.toLocaleString("sv-SE")} exempelbolag`,
      apply: { bransch: item.label, sni: item.sni },
    };
  });
}

export function selectionToQuery(selection: Selection): string {
  const params = new URLSearchParams();
  if (selection.query.trim()) params.set("q", selection.query.trim());
  if (selection.city.trim()) params.set("ort", selection.city.trim());
  if ((selection.bransch ?? "").trim()) params.set("bransch", selection.bransch.trim());
  if (selection.sni) params.set("sni", selection.sni);
  const forms = formsOf(selection);
  if (forms.length) params.set("form", forms.join(","));
  params.set("tel", selection.phones ? "1" : "0");
  params.set("firma", selection.signatory ? "1" : "0");
  params.set("epost", selection.emails ? "1" : "0");
  return params.toString();
}

export function selectionFromQuery(params: URLSearchParams): Selection {
  const sniParam = params.get("sni") ?? "";
  const branschParam = params.get("bransch") ?? "";
  const byLabel = INDUSTRIES.find((item) => branschParam && fold(item.label) === fold(branschParam));
  const byCode = INDUSTRIES.find((item) => item.sni === sniParam);
  let sni = "";
  let bransch = branschParam;
  if (byLabel) {
    sni = byLabel.sni;
    bransch = byLabel.label;
  } else if (!branschParam && byCode) {
    sni = byCode.sni;
    bransch = byCode.label;
  }
  const forms = (params.get("form") ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter((code) => LEGAL_FORMS.some((item) => item.code === code));
  return {
    query: params.get("q") ?? "",
    city: params.get("ort") ?? "",
    bransch,
    sni,
    forms,
    phones: params.get("tel") !== "0",
    signatory: params.get("firma") !== "0",
    emails: params.get("epost") !== "0",
  };
}

export function selectionFromRecord(raw: Record<string, string | string[] | undefined>): Selection {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return selectionFromQuery(params);
}

export function sameSearch(a: Selection, b: Selection): boolean {
  const forms = (selection: Selection) => [...formsOf(selection)].sort().join(",");
  return (
    a.query.trim() === b.query.trim() &&
    a.city.trim() === b.city.trim() &&
    (a.bransch ?? "").trim() === (b.bransch ?? "").trim() &&
    (a.sni ?? "") === (b.sni ?? "") &&
    forms(a) === forms(b)
  );
}

export function hasCompleteBasics(row: Company): boolean {
  return [row.name, row.orgNr, row.street, row.postalCode, row.city, row.sni, row.industry].every(
    (value) => value.trim() !== "",
  );
}

export function filterCompanies(selection: Selection): Company[] {
  const forms = formsOf(selection);
  const raw = fold(selection.query.trim());
  const queryDigits = selection.query.replace(/\D/g, "");
  const orgQuery = selection.query.trim().toLowerCase().replace(/[-\s]/g, "");
  const bransch = (selection.bransch ?? "").trim();
  const branschFold = fold(bransch);
  const branschDigits = bransch.replace(/\D/g, "");
  const cityFold = fold(selection.city.trim());

  return COMPANIES.filter((item) => {
    if (forms.length > 0 && !forms.includes(item.form)) return false;
    if (cityFold) {
      const itemCity = fold(item.city);
      if (itemCity !== cityFold && !itemCity.includes(cityFold)) return false;
    }
    if (selection.sni) {
      if (!item.sni.startsWith(selection.sni)) return false;
    } else if (bransch) {
      const labelHit = fold(item.industry).includes(branschFold);
      const codeHit = branschDigits.length > 0 && item.sni.startsWith(branschDigits);
      if (!labelHit && !codeHit) return false;
    }
    if (!raw) return true;
    const org = item.orgNr.toLowerCase().replace("-", "");
    return (
      fold(item.name).includes(raw) ||
      org.includes(orgQuery) ||
      fold(item.industry).includes(raw) ||
      fold(item.city).includes(raw) ||
      fold(legalFormLabel(item.form)).includes(raw) ||
      (queryDigits.length >= 2 && (item.sni.startsWith(queryDigits) || org.includes(queryDigits)))
    );
  });
}

export function countSelection(rows: Company[], selection: Selection): PriceCounts {
  let phones = 0;
  let signatoryPhones = 0;
  let emails = 0;
  for (const row of rows) {
    if (selection.phones) phones += row.phones.length;
    if (selection.signatory) signatoryPhones += row.signatoryPhones.length;
    if (selection.emails) emails += row.emails.length;
  }
  return { companies: rows.length, phones, signatoryPhones, emails };
}

export type Summary = {
  rows: Company[];
  counts: PriceCounts;
  price: PriceQuote;
  gaps: string[];
};

export function summarize(selection: Selection): Summary {
  const rows = filterCompanies(selection);
  const counts = countSelection(rows, selection);
  const gaps: string[] = [];
  if (selection.phones) {
    const missing = rows.filter((row) => row.phones.length === 0).length;
    if (missing) gaps.push(`${missing} utan telefon`);
  }
  if (selection.signatory) {
    const missing = rows.filter((row) => row.signatoryPhones.length === 0).length;
    if (missing) gaps.push(`${missing} utan beslutsfattarnummer`);
  }
  if (selection.emails) {
    const missing = rows.filter((row) => row.emails.length === 0).length;
    if (missing) gaps.push(`${missing} utan e-post`);
  }
  return { rows, counts, price: quote(counts), gaps };
}

export function describeSelection(selection: Selection): string {
  const forms = formsOf(selection).map(legalFormLabel);
  const bransch = (selection.bransch ?? "").trim();
  const parts = [
    selection.city.trim() || "Alla orter",
    bransch || (selection.sni ? industryLabel(selection.sni) : "Alla branscher"),
    forms.length ? forms.join(", ") : "Alla bolagsformer",
  ];
  if (selection.query.trim()) parts.push(`"${selection.query.trim()}"`);
  return parts.join(" · ");
}

export type OrderDraft = {
  id: string;
  email: string;
  company: string;
  orgNr: string;
  contact: string;
  payment: "kort" | "faktura";
  selection: Selection;
  createdAt: string;
};

export const ORDER_STORAGE_KEY = "visalight-order";

export const SUGGESTION_KIND_LABEL: Record<SuggestionKind, string> = {
  bolag: "Bolag",
  bransch: "Bransch",
  ort: "Ort",
  form: "Bolagsform",
};
