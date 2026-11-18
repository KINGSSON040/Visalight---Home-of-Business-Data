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
  /** Län, till exempel "Skåne län". Tomt betyder alla län. */
  county: string;
  bransch: string;
  sni: string;
  forms: string[];
  /** Storleksklass, samma text som i EMPLOYEE_BANDS. Tomt betyder alla storlekar. */
  employees: string;
  /** Nystartade: "3", "6" eller "12" månader. Tomt betyder alla åldrar. */
  founded: string;
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

/**
 * Butikens sju val. Koderna är samma som LEGAL_FORMS och det urvalet räknar på.
 * Stiftelse och ideell förening är ett val. Övriga samlar former som inte har egen rad.
 */
export const FORM_GROUPS: { label: string; codes: string[] }[] = [
  { label: "Aktiebolag", codes: ["ab"] },
  { label: "Enskild firma", codes: ["ef"] },
  { label: "Handelsbolag", codes: ["hb"] },
  { label: "Kommanditbolag", codes: ["kb"] },
  { label: "Ekonomisk förening", codes: ["ek"] },
  { label: "Stiftelse/Ideell förening", codes: ["stiftelse", "if"] },
  {
    label: "Övriga",
    codes: ["brf", "filial", "europabolag", "samfallighet", "trossamfund", "enkelt", "kommun", "region", "stat"],
  },
];

export type Industry = {
  sni: string;
  code: string;
  label: string;
  words: string[];
  /** SNI 2007-koder som motsvarar samma bransch i registret. */
  legacy?: string[];
  note?: string;
};

/** SNI 2025. words är det folk skriver, label är SCB:s namn. */
export const INDUSTRIES: Industry[] = [
  { sni: "56110", code: "56.110", label: "Restaurangverksamhet", words: ["restaurang", "restauranger"], legacy: ["56101"] },
  { sni: "41200", code: "41.200", label: "Byggande av hus", words: ["bygg", "byggföretag"] },
  { sni: "62010", code: "62.010", label: "Datakonsulter", words: ["data", "programmering"] },
  { sni: "47112", code: "47.112", label: "Livsmedelshandel", words: ["livsmedel", "mataffär"] },
  { sni: "86211", code: "86.211", label: "Vårdcentraler", words: ["vård", "vårdcentral"] },
  { sni: "49410", code: "49.410", label: "Vägtransport", words: ["åkeri", "transport"] },
  {
    sni: "96210",
    code: "96.210",
    label: "Frisörer och barberare",
    words: ["frisör", "frisörsalong", "frisörsalonger", "hårvård", "barberare"],
    legacy: ["96021"],
    note: "frisörsalonger",
  },
  {
    sni: "96220",
    code: "96.220",
    label: "Skönhetsvård",
    words: ["skönhet", "skönhetssalong", "skönhetssalonger", "skönhetsbehandling"],
    legacy: ["96022"],
    note: "skönhetssalonger, inte frisörer",
  },
  {
    sni: "69201",
    code: "69.201",
    label: "Redovisning och bokföring",
    words: ["redovisning", "redovisningsbyrå", "bokföring"],
  },
  {
    sni: "69202",
    code: "69.202",
    label: "Revision",
    words: ["revisor", "revisionsbyrå", "revisorbyrå", "revision"],
    note: "revisionsbyråer, skilt från redovisning",
  },
];

/**
 * Branscher som söks vid namn. Samma urval som INDUSTRIES, men de visas inte som egna staplar.
 * Koderna är SNI 2025. legacy är äldre koder för samma verksamhet.
 */
export const SEARCH_INDUSTRIES: Industry[] = [
  { sni: "43210", code: "43.210", label: "Elinstallationer", words: ["elektriker", "elinstallatör", "elinstallation"] },
  { sni: "43221", code: "43.221", label: "Värme- och sanitetsarbeten", words: ["rörmokare", "vvs", "rörläggare"], legacy: ["43220", "43222", "43223", "43229"] },
  { sni: "43341", code: "43.341", label: "Måleriarbeten", words: ["målare", "måleri", "målerifirma", "målerifirmor"] },
  { sni: "81210", code: "81.210", label: "Lokalvård", words: ["städ", "städfirma", "städfirmor", "lokalvård"] },
  { sni: "69101", code: "69.101", label: "Advokatbyråverksamhet", words: ["advokat", "advokatbyrå", "advokatbyråer"] },
  { sni: "68320", code: "68.320", label: "Fastighetsförvaltning på uppdrag", words: ["fastighetsförvaltare", "förvaltare"], legacy: ["68320"] },
  { sni: "55101", code: "55.101", label: "Hotellverksamhet med restaurangrörelse", words: ["hotell"], legacy: ["55102"] },
  { sni: "86230", code: "86.230", label: "Tandläkarverksamhet", words: ["tandläkare", "tandvård"] },
  { sni: "95311", code: "95.311", label: "Allmän service och reparation av motorfordon utom motorcyklar", words: ["bilverkstad", "bilverkstäder", "verkstad"], legacy: ["45201"] },
  { sni: "73111", code: "73.111", label: "Reklambyråverksamhet", words: ["reklambyrå", "reklambyråer", "reklam"] },
  { sni: "71110", code: "71.110", label: "Arkitektverksamhet", words: ["arkitekt", "arkitektkontor"] },
  { sni: "78201", code: "78.201", label: "Personaluthyrning", words: ["bemanning", "bemanningsföretag", "personaluthyrning"], legacy: ["78200"] },
  { sni: "56210", code: "56.210", label: "Cateringverksamhet vid enskilda evenemang", words: ["catering"] },
  { sni: "10710", code: "10.710", label: "Tillverkning av mjukt matbröd och färska bakverk", words: ["bageri", "bagerier"], legacy: ["47241"] },
  { sni: "81300", code: "81.300", label: "Skötsel och underhåll av grönytor", words: ["trädgård", "trädgårdsföretag", "grönytor"] },
  { sni: "49420", code: "49.420", label: "Flyttjänster", words: ["flytt", "flyttfirma", "flyttfirmor"] },
  { sni: "80010", code: "80.010", label: "Bevakningsverksamhet och privat säkerhetsverksamhet", words: ["säkerhet", "säkerhetsföretag", "bevakning"], legacy: ["80100"] },
  { sni: "47123", code: "47.123", label: "Detaljhandel via internet eller postorder med brett sortiment", words: ["e-handel", "ehandel", "webbutik"], legacy: ["47911"] },
  { sni: "75000", code: "75.000", label: "Veterinärverksamhet", words: ["veterinär", "veterinärklinik", "veterinärkliniker"] },
  { sni: "93130", code: "93.130", label: "Drift av gymanläggningar", words: ["gym", "träningsanläggning"] },
  { sni: "85100", code: "85.100", label: "Förskoleutbildning", words: ["förskola", "förskoleföretag"] },
  { sni: "74200", code: "74.200", label: "Fotoverksamhet", words: ["fotograf", "fotografer"], legacy: ["74201"] },
  { sni: "68310", code: "68.310", label: "Fastighetsförmedling", words: ["mäklare", "mäklarfirma"] },
];

export function selectionIndustries(): Industry[] {
  return [...INDUSTRIES, ...SEARCH_INDUSTRIES];
}

const LEGACY_SNI: Record<string, string> = {
  "56101": "56110",
  "96021": "96210",
};


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
  "559100-1025": "10–19",
  "559100-1026": "1–4",
};

/** Län som används i urvalet. Koden är SCB:s länsnummer. */
export const COUNTIES: { code: string; label: string }[] = [
  { code: "01", label: "Stockholms län" },
  { code: "03", label: "Uppsala län" },
  { code: "04", label: "Södermanlands län" },
  { code: "05", label: "Östergötlands län" },
  { code: "06", label: "Jönköpings län" },
  { code: "07", label: "Kronobergs län" },
  { code: "08", label: "Kalmar län" },
  { code: "09", label: "Gotlands län" },
  { code: "10", label: "Blekinge län" },
  { code: "12", label: "Skåne län" },
  { code: "13", label: "Hallands län" },
  { code: "14", label: "Västra Götalands län" },
  { code: "17", label: "Värmlands län" },
  { code: "18", label: "Örebro län" },
  { code: "19", label: "Västmanlands län" },
  { code: "20", label: "Dalarnas län" },
  { code: "21", label: "Gävleborgs län" },
  { code: "22", label: "Västernorrlands län" },
  { code: "23", label: "Jämtlands län" },
  { code: "24", label: "Västerbottens län" },
  { code: "25", label: "Norrbottens län" },
];

export function countyCode(label: string): string | null {
  return COUNTIES.find((item) => item.label === label)?.code ?? null;
}

/** Storleksklasser i samma indelning som SCB brukar redovisa anställda. */
export const EMPLOYEE_BANDS = ["0", "1–4", "5–9", "10–19", "20–49", "50–99", "100–199", "200 eller fler"];

/**
 * Intervall utan överlapp. Flera kan väljas samtidigt.
 * Registrets klass slutar vid 199 och fortsätter med 200 eller fler, så 200–249 följer med 250+.
 */
export const EMPLOYEE_RANGES: { label: string; bands: string[] }[] = [
  { label: "0", bands: ["0"] },
  { label: "1–9", bands: ["1–4", "5–9"] },
  { label: "10–49", bands: ["10–19", "20–49"] },
  { label: "50–99", bands: ["50–99"] },
  { label: "100–249", bands: ["100–199"] },
  { label: "250+", bands: ["200 eller fler"] },
];

export function listParts(value: string): string[] {
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

export function togglePart(current: string, value: string): string {
  const items = listParts(current);
  const next = items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
  return next.join(",");
}

export function employeeBands(value: string): string[] {
  const bands = listParts(value).flatMap((part) => {
    if (part === "1–99" || part === "1-99") return ["1–4", "5–9", "10–19", "20–49", "50–99"];
    const range = EMPLOYEE_RANGES.find((item) => item.label === part);
    if (range) return range.bands;
    return EMPLOYEE_BANDS.includes(part) ? [part] : [];
  });
  return [...new Set(bands)];
}

/** Påhittade bolag. Tomma kontaktfält är tomma med flit. */
export const COMPANIES: Company[] = [
  company("559100-1001", "Exempelbageriet Nord AB", "Exempelgatan 4", "111 22", "Stockholm", "56110", ["010-000 00 01", "010-000 00 02"], ["010-000 00 91"], ["bakern@exempel.test"], "ab"),
  company("559100-1002", "Södra Kajens Kök AB", "Exempelgatan 18", "117 33", "Stockholm", "56110", ["010-000 00 03"], [], ["kajen@exempel.test"], "ab"),
  company("559100-1003", "Hornstulls Matsal", "Exempelgatan 27", "117 28", "Stockholm", "56110", [], [], [], "ef"),
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
  company("559100-1019", "Salongen vid Ån AB", "Exempelgatan 21", "111 22", "Stockholm", "96210", ["010-000 00 16"], [], ["salongen@exempel.test"], "ab"),
  company("559100-1020", "Klippans Salong AB", "Exempelgatan 12", "211 20", "Malmö", "96210", ["010-000 00 17"], [], ["klippan@exempel.test"], "ab"),
  company("559100-1021", "Bryggans Sax AB", "Exempelgatan 13", "252 20", "Helsingborg", "96210", [], [], [], "ab"),
  company("559100-1022", "Kontoret vid Hamnen AB", "Exempelgatan 17", "211 20", "Malmö", "69201", ["010-000 00 18"], ["010-000 00 96"], ["kontoret@exempel.test"], "ab"),
  company("559100-1023", "Siffrans Byrå AB", "Exempelgatan 22", "722 12", "Västerås", "69201", ["010-000 00 19"], [], ["siffran@exempel.test"], "ab"),
  company("559100-1024", "Nordlig Revision AB", "Exempelgatan 23", "903 26", "Umeå", "69202", [], [], ["revision@exempel.test"], "ab"),
  company("559100-1025", "Möllevångens Kök AB", "Exempelgatan 30", "214 24", "Malmö", "56110", ["010-000 00 20", "010-000 00 21"], ["010-000 00 97"], ["mollevang@exempel.test"], "ab"),
  company("559100-1026", "Limhamns Matsal", "Exempelgatan 31", "216 13", "Malmö", "56110", ["010-000 00 22"], [], [], "ef"),
];

export const CITIES = [...new Set(COMPANIES.map((item) => item.city))].sort((a, b) =>
  a.localeCompare(b, "sv"),
);

export const defaultSelection: Selection = {
  query: "",
  city: "",
  county: "",
  bransch: "",
  sni: "",
  forms: [],
  employees: "",
  founded: "",
  phones: true,
  signatory: true,
  emails: true,
};

export type SuggestionKind = "bolag" | "bransch" | "ort" | "lan" | "form" | "storlek";

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
    county?: string;
    employees?: string;
  };
};

/** Sant när besökaren har valt bransch, område, bolagsform eller storlek. */
export function hasSegment(selection: Selection): boolean {
  return Boolean(
    selection.city.trim() ||
      (selection.county ?? "").trim() ||
      (selection.bransch ?? "").trim() ||
      selection.sni ||
      (selection.employees ?? "").trim() ||
      (selection.founded ?? "").trim() ||
      formsOf(selection).length > 0,
  );
}

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

/** Stängd bolagsform: "Alla", ett namn, eller "Aktiebolag +2". */
export function formGroupLabel(forms: string[]): string {
  const picked = FORM_GROUPS.filter((group) => group.codes.some((code) => forms.includes(code)));
  if (picked.length === 0) return "Alla";
  if (picked.length === 1) return picked[0].label;
  return `${picked[0].label} +${picked.length - 1}`;
}

export function industryLabel(sni: string): string {
  const digits = sni.replace(/\D/g, "");
  return selectionIndustries().find((item) => item.sni === digits)?.label ?? sni;
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


function industrySuggestMatch(item: Industry, needle: string, digits: string): boolean {
  if (digits.length >= 1 && (item.sni.startsWith(digits) || item.code.replace(/\D/g, "").startsWith(digits))) {
    return true;
  }
  if (needle.length < 1) return false;
  return [item.label, item.code, ...item.words].some((part) => fold(part).includes(needle));
}

/** Ett färdigt sökord: hela branschen, orten, länet, bolagsformen, storleken eller SNI-koden. */
export function resolveQuery(text: string): (Partial<Selection> & { form?: string }) | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const needle = fold(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  const industry = selectionIndustries().find((item) => {
    const codes = [item.sni, item.code, ...(item.legacy ?? [])].map((code) => code.replace(/\D/g, ""));
    if (digits.length >= 2 && codes.includes(digits)) return true;
    return fold(item.label) === needle || item.words.some((word) => fold(word) === needle);
  });
  if (industry) return { bransch: industry.label, sni: industry.sni };
  const city = CITIES.find((item) => fold(item) === needle);
  if (city) return { city };
  const county = COUNTIES.find((item) => fold(item.label) === needle || fold(item.label.replace(/ län$/, "")) === needle);
  if (county) return { county: county.label };
  const form = LEGAL_FORMS.find((item) => fold(item.label) === needle);
  if (form) return { form: form.code };
  const band = EMPLOYEE_BANDS.find((item) => fold(item) === needle);
  if (band) return { employees: band };
  return null;
}

/** Urvalet som ska räknas. Ett halvfärdigt ord räknas inte, valda filter gör det. */
export function selectionForCount(selection: Selection): Selection | null {
  const resolved = resolveQuery(selection.query);
  const next: Selection = { ...selection, forms: [...(selection.forms ?? [])], query: "" };
  if (resolved?.bransch) next.bransch = resolved.bransch;
  if (resolved?.sni) next.sni = resolved.sni;
  if (resolved?.city) next.city = resolved.city;
  if (resolved?.county) next.county = resolved.county;
  if (resolved?.employees) next.employees = resolved.employees;
  if (resolved?.form && !next.forms.includes(resolved.form)) next.forms = [...next.forms, resolved.form];
  return hasSegment(next) ? next : null;
}

function industryMatches(item: Industry, needle: string, digits: string): boolean {
  if (digits.length >= 2 && (item.sni.startsWith(digits) || item.code.replace(/\D/g, "").startsWith(digits))) {
    return true;
  }
  if (needle.length < 2) return false;
  return [item.label, item.code, ...item.words].some((part) => fold(part).includes(needle));
}

function industryDetail(item: Industry): string {
  const count = countWhere((company) => company.sni === item.sni);
  const countLabel = count
    ? `${count.toLocaleString("sv-SE")} exempelbolag`
    : "inga exempelbolag i förhandsvisningen";
  return [`SNI ${item.code}`, item.note, countLabel].filter(Boolean).join(" · ");
}

function industrySuggestion(item: Industry, fillQuery: boolean): Suggestion {
  return {
    id: `bransch-${item.sni}`,
    kind: "bransch",
    title: item.label,
    detail: industryDetail(item),
    apply: fillQuery
      ? { bransch: item.label, sni: item.sni, query: item.label }
      : { bransch: item.label, sni: item.sni },
  };
}

/** Bara branscher. Används i butikens sökfält. */
export type SniFilter =
  | { kind: "any" }
  | { kind: "none" }
  | { kind: "codes"; codes: string[] }
  | { kind: "prefix"; prefix: string };

function sniSpellings(code: string): string[] {
  const digits = code.replace(/\D/g, "");
  if (!digits) return [];
  const dotted = digits.length === 5 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : "";
  return [...new Set([digits, dotted].filter(Boolean))];
}

function spellingsFor(digits: string): string[] {
  const industry = selectionIndustries().find(
    (item) => item.sni === digits || (item.legacy ?? []).some((code) => code.replace(/\D/g, "") === digits),
  );
  return [...new Set([digits, industry?.sni ?? "", ...(industry?.legacy ?? [])].flatMap(sniSpellings))];
}

function sniTokens(value: string): string[] {
  return listParts(value)
    .map((part) => (LEGACY_SNI[part] ?? part).replace(/\D/g, ""))
    .filter((code) => code.length >= 2);
}

/** Vilka SNI-koder ett kundurval ska träffa, inklusive SNI 2007 om registret fortfarande har den. */
export function selectionSniFilter(selection: { sni?: string; bransch?: string; query?: string }): SniFilter {
  const chosen = sniTokens(selection.sni ?? "");
  if (chosen.length) return { kind: "codes", codes: [...new Set(chosen.flatMap(spellingsFor))] };
  const text = [selection.bransch ?? "", selection.query ?? ""].join(" ").trim();
  if (!text) return { kind: "any" };
  const needle = fold(text);
  const digits = text.replace(/\D/g, "");
  const hits = selectionIndustries().filter((item) => industryMatches(item, needle, digits));
  if (hits.length > 0) {
    const codes = hits.flatMap((item) => [item.sni, ...(item.legacy ?? [])].flatMap(sniSpellings));
    return { kind: "codes", codes: [...new Set(codes)] };
  }
  if (digits.length >= 5) return { kind: "codes", codes: spellingsFor(digits) };
  if (digits.length >= 2) return { kind: "prefix", prefix: digits };
  return { kind: "none" };
}

export function suggestBranscher(text: string): Suggestion[] {
  const needle = fold(text.trim());
  const digits = text.replace(/\D/g, "");
  if (needle.length < 2 && digits.length < 2) return [];
  return selectionIndustries().filter((item) => industryMatches(item, needle, digits)).slice(0, 8).map((item) => industrySuggestion(item, true));
}

/** Butikens sökfält. Bransch först, sedan område, län, bolagsform och storlek. Aldrig ett enskilt bolag. */
export function suggestSegment(text: string): Suggestion[] {
  const needle = fold(text.trim());
  const digits = text.replace(/\D/g, "");
  if (needle.length < 1 && digits.length < 1) return [];
  const found: Suggestion[] = [];

  for (const item of selectionIndustries()) {
    if (!industrySuggestMatch(item, needle, digits)) continue;
    found.push(industrySuggestion(item, true));
  }
  for (const city of CITIES) {
    if (!fold(city).includes(needle)) continue;
    found.push({
      id: `ort-${city}`,
      kind: "ort",
      title: city,
      detail: "Område",
      apply: { city, query: "" },
    });
  }
  for (const county of COUNTIES) {
    if (!fold(county.label).includes(needle)) continue;
    found.push({
      id: `lan-${county.code}`,
      kind: "lan",
      title: county.label,
      detail: "Län",
      apply: { county: county.label, query: "" },
    });
  }
  for (const form of LEGAL_FORMS) {
    if (!fold(form.label).includes(needle)) continue;
    found.push({
      id: `form-${form.code}`,
      kind: "form",
      title: form.label,
      detail: "Bolagsform",
      apply: { form: form.code, query: "" },
    });
  }
  for (const band of EMPLOYEE_BANDS) {
    if (!fold(band).includes(needle)) continue;
    found.push({
      id: `storlek-${band}`,
      kind: "storlek",
      title: `${band} anställda`,
      detail: "Storlek",
      apply: { employees: band, query: "" },
    });
  }

  const limits: Record<SuggestionKind, number> = { bolag: 0, bransch: 6, ort: 3, lan: 3, form: 3, storlek: 3 };
  const used: Record<SuggestionKind, number> = { bolag: 0, bransch: 0, ort: 0, lan: 0, form: 0, storlek: 0 };
  return found.filter((item) => {
    if (used[item.kind] >= limits[item.kind]) return false;
    used[item.kind] += 1;
    return true;
  });
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

  for (const item of selectionIndustries()) {
    if (!industryMatches(item, needle, digits)) continue;
    found.push(industrySuggestion(item, true));
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

  const limits: Record<SuggestionKind, number> = { bolag: 4, bransch: 3, ort: 3, lan: 0, form: 3, storlek: 0 };
  const used: Record<SuggestionKind, number> = { bolag: 0, bransch: 0, ort: 0, lan: 0, form: 0, storlek: 0 };
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
  return selectionIndustries().filter((item) => !needle || industryMatches(item, needle, digits)).map((item) => industrySuggestion(item, false));
}

export function selectionToQuery(selection: Selection): string {
  const params = new URLSearchParams();
  if (selection.query.trim()) params.set("q", selection.query.trim());
  if (selection.city.trim()) params.set("ort", selection.city.trim());
  if ((selection.county ?? "").trim()) params.set("lan", selection.county.trim());
  if ((selection.bransch ?? "").trim()) params.set("bransch", selection.bransch.trim());
  if (selection.sni) params.set("sni", selection.sni);
  if ((selection.employees ?? "").trim()) params.set("anst", selection.employees.trim());
  if ((selection.founded ?? "").trim()) params.set("nya", selection.founded.trim());
  const forms = formsOf(selection);
  if (forms.length) params.set("form", forms.join(","));
  params.set("tel", selection.phones ? "1" : "0");
  params.set("firma", selection.signatory ? "1" : "0");
  params.set("epost", selection.emails ? "1" : "0");
  return params.toString();
}

function industryToken(token: string): { sni: string; label: string } | null {
  const digits = (LEGACY_SNI[token] ?? token).replace(/\D/g, "");
  const pool = selectionIndustries();
  const byLabel = pool.find(
    (item) => fold(item.label) === fold(token) || item.words.some((word) => fold(word) === fold(token)),
  );
  const byCode = digits
    ? pool.find((item) => item.sni === digits || (item.legacy ?? []).some((code) => code.replace(/\D/g, "") === digits))
    : undefined;
  const hit = byLabel ?? byCode;
  return hit ? { sni: hit.sni, label: hit.label } : null;
}

function employeeSelection(value: string): string {
  const labels: string[] = [];
  for (const part of listParts(value)) {
    if (part === "1–99" || part === "1-99") {
      labels.push("1–9", "10–49", "50–99");
      continue;
    }
    if (EMPLOYEE_RANGES.some((item) => item.label === part) || EMPLOYEE_BANDS.includes(part)) labels.push(part);
  }
  return [...new Set(labels)].join(",");
}

export function selectionFromQuery(params: URLSearchParams): Selection {
  const resolved = new Map<string, string>();
  for (const token of [...listParts(params.get("bransch") ?? ""), ...sniTokens(params.get("sni") ?? "")]) {
    const hit = industryToken(token);
    if (hit) resolved.set(hit.sni, hit.label);
  }
  const anst = params.get("anst") ?? "";
  const forms = (params.get("form") ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter((code) => LEGAL_FORMS.some((item) => item.code === code));
  return {
    query: params.get("q") ?? "",
    city: listParts(params.get("ort") ?? "").join(","),
    county: listParts(params.get("lan") ?? "")
      .filter((label) => COUNTIES.some((item) => item.label === label))
      .join(","),
    bransch: resolved.size ? [...resolved.values()].join(",") : listParts(params.get("bransch") ?? "").join(","),
    sni: [...resolved.keys()].join(","),
    forms,
    employees: employeeSelection(anst),
    founded: ["3", "6", "12"].includes(params.get("nya") ?? "") ? (params.get("nya") ?? "") : "",
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
    (a.county ?? "").trim() === (b.county ?? "").trim() &&
    (a.bransch ?? "").trim() === (b.bransch ?? "").trim() &&
    (a.sni ?? "") === (b.sni ?? "") &&
    (a.employees ?? "").trim() === (b.employees ?? "").trim() &&
    (a.founded ?? "").trim() === (b.founded ?? "").trim() &&
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
  const branscher = listParts(selection.bransch ?? "");
  const cities = listParts(selection.city).map(fold);
  const counties = listParts(selection.county ?? "");
  const bands = employeeBands(selection.employees ?? "");
  const snis = listParts(selection.sni ?? "");

  return COMPANIES.filter((item) => {
    if (forms.length > 0 && !forms.includes(item.form)) return false;
    if (cities.length || counties.length) {
      const itemCity = fold(item.city);
      const cityHit = cities.some((city) => itemCity === city || itemCity.includes(city));
      const countyHit = counties.includes(item.county);
      if (!cityHit && !countyHit) return false;
    }
    if (bands.length && !bands.includes(item.employees)) return false;
    const industry = INDUSTRIES.find((entry) => entry.sni === item.sni);
    if (snis.length) {
      if (!snis.some((code) => item.sni === code || item.sni.startsWith(code))) return false;
    } else if (branscher.length) {
      const labelHit = branscher.some((name) => fold(item.industry).includes(fold(name)));
      const wordHit = industry
        ? branscher.some((name) => industryMatches(industry, fold(name), name.replace(/\D/g, "")))
        : false;
      if (!labelHit && !wordHit) return false;
    }
    if (!raw) return true;
    const org = item.orgNr.toLowerCase().replace("-", "");
    return (
      fold(item.name).includes(raw) ||
      org.includes(orgQuery) ||
      fold(item.industry).includes(raw) ||
      (industry ? industryMatches(industry, raw, queryDigits) : false) ||
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
  const places = [...listParts(selection.city), ...listParts(selection.county ?? "")];
  const branscher = listParts(selection.bransch ?? "");
  const parts = [
    places.join(", ") || "Alla områden",
    branscher.join(", ") || (selection.sni ? listParts(selection.sni).map(industryLabel).join(", ") : "Alla branscher"),
    forms.length ? forms.join(", ") : "Alla bolagsformer",
    listParts(selection.employees ?? "").length ? `${listParts(selection.employees ?? "").join(", ")} anställda` : "",
    (selection.founded ?? "").trim() ? `Nystartade ${selection.founded.trim()} månader` : "",
  ].filter(Boolean);
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
  lan: "Län",
  form: "Bolagsform",
  storlek: "Storlek",
};
