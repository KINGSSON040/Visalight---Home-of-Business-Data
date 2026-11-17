import {
  quote,
  type PriceCounts,
  type PriceQuote,
} from "@/lib/pricing";

export type Company = {
  orgNr: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  sni: string;
  industry: string;
  phones: string[];
  signatoryPhones: string[];
  emails: string[];
};

export type Selection = {
  query: string;
  city: string;
  sni: string;
  phones: boolean;
  signatory: boolean;
  emails: boolean;
};

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

/** Påhittade bolag. Tomma kontaktfält är tomma med flit. */
export const COMPANIES: Company[] = [
  company("559100-1001", "Exempelbageriet Nord AB", "Exempelgatan 4", "111 22", "Stockholm", "56101", ["010-000 00 01", "010-000 00 02"], ["010-000 00 91"], ["bakern@exempel.test"]),
  company("559100-1002", "Södra Kajens Kök AB", "Exempelgatan 18", "117 33", "Stockholm", "56101", ["010-000 00 03"], [], ["kajen@exempel.test"]),
  company("559100-1003", "Hornstulls Matsal AB", "Exempelgatan 27", "117 28", "Stockholm", "56101", [], [], []),
  company("559100-1004", "Hamnens Snickeri AB", "Exempelgatan 6", "211 20", "Malmö", "41200", ["010-000 00 04"], [], []),
  company("559100-1005", "Västra Taket AB", "Exempelgatan 9", "411 03", "Göteborg", "41200", ["010-000 00 05"], ["010-000 00 92"], ["taket@exempel.test"]),
  company("559100-1006", "Björkens Bygg AB", "Exempelgatan 2", "903 26", "Umeå", "41200", [], [], ["bjorken@exempel.test"]),
  company("559100-1007", "Norrlands Kod AB", "Exempelgatan 11", "903 26", "Umeå", "62010", ["010-000 00 06"], [], ["kod@exempel.test"]),
  company("559100-1008", "Mälarens System AB", "Exempelgatan 8", "722 12", "Västerås", "62010", [], [], ["system@exempel.test"]),
  company("559100-1009", "Kajplatsens Data AB", "Exempelgatan 15", "411 03", "Göteborg", "62010", ["010-000 00 07", "010-000 00 08"], ["010-000 00 93"], ["data@exempel.test"]),
  company("559100-1010", "Torgets Handel AB", "Exempelgatan 1", "753 20", "Uppsala", "47112", ["010-000 00 09"], [], []),
  company("559100-1011", "Lindens Livs AB", "Exempelgatan 14", "582 22", "Linköping", "47112", ["010-000 00 10"], [], ["livs@exempel.test"]),
  company("559100-1012", "Hamnpaviljongen AB", "Exempelgatan 3", "252 20", "Helsingborg", "47112", [], [], []),
  company("559100-1013", "Exempelvården City AB", "Exempelgatan 20", "111 22", "Stockholm", "86211", ["010-000 00 11"], ["010-000 00 94"], ["varden@exempel.test"]),
  company("559100-1014", "Åsens Mottagning AB", "Exempelgatan 7", "753 20", "Uppsala", "86211", ["010-000 00 12"], [], []),
  company("559100-1015", "Kustens Vård AB", "Exempelgatan 16", "211 20", "Malmö", "86211", [], [], ["kusten@exempel.test"]),
  company("559100-1016", "Inlandets Åkeri AB", "Exempelgatan 5", "582 22", "Linköping", "49410", ["010-000 00 13"], ["010-000 00 95"], ["akeriet@exempel.test"]),
  company("559100-1017", "Nattens Transport AB", "Exempelgatan 19", "411 03", "Göteborg", "49410", ["010-000 00 14", "010-000 00 15"], [], []),
  company("559100-1018", "Fjällens Frakt AB", "Exempelgatan 10", "903 26", "Umeå", "49410", [], [], []),
  company("559100-1019", "Salongen vid Ån AB", "Exempelgatan 21", "111 22", "Stockholm", "96021", ["010-000 00 16"], [], ["salongen@exempel.test"]),
  company("559100-1020", "Klippans Salong AB", "Exempelgatan 12", "211 20", "Malmö", "96021", ["010-000 00 17"], [], ["klippan@exempel.test"]),
  company("559100-1021", "Bryggans Sax AB", "Exempelgatan 13", "252 20", "Helsingborg", "96021", [], [], []),
  company("559100-1022", "Kontoret vid Hamnen AB", "Exempelgatan 17", "211 20", "Malmö", "69201", ["010-000 00 18"], ["010-000 00 96"], ["kontoret@exempel.test"]),
  company("559100-1023", "Siffrans Byrå AB", "Exempelgatan 22", "722 12", "Västerås", "69201", ["010-000 00 19"], [], ["siffran@exempel.test"]),
  company("559100-1024", "Nordlig Revision AB", "Exempelgatan 23", "903 26", "Umeå", "69201", [], [], ["revision@exempel.test"]),
];

export const CITIES = [...new Set(COMPANIES.map((item) => item.city))].sort((a, b) =>
  a.localeCompare(b, "sv"),
);

export const defaultSelection: Selection = {
  query: "",
  city: "",
  sni: "",
  phones: true,
  signatory: true,
  emails: true,
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
): Company {
  const industry = INDUSTRIES.find((item) => item.sni === sni)?.label ?? sni;
  return { orgNr, name, street, postalCode, city, sni, industry, phones, signatoryPhones, emails };
}

export function industryLabel(sni: string): string {
  return INDUSTRIES.find((item) => item.sni === sni)?.label ?? sni;
}

export function selectionToQuery(selection: Selection): string {
  const params = new URLSearchParams();
  if (selection.query) params.set("q", selection.query);
  if (selection.city) params.set("ort", selection.city);
  if (selection.sni) params.set("sni", selection.sni);
  params.set("tel", selection.phones ? "1" : "0");
  params.set("firma", selection.signatory ? "1" : "0");
  params.set("epost", selection.emails ? "1" : "0");
  return params.toString();
}

export function selectionFromQuery(params: URLSearchParams): Selection {
  const sni = params.get("sni") ?? "";
  const city = params.get("ort") ?? "";
  return {
    query: params.get("q") ?? "",
    city: CITIES.includes(city) ? city : "",
    sni: INDUSTRIES.some((item) => item.sni === sni) ? sni : "",
    phones: params.get("tel") !== "0",
    signatory: params.get("firma") !== "0",
    emails: params.get("epost") !== "0",
  };
}

export function selectionFromRecord(
  raw: Record<string, string | string[] | undefined>,
): Selection {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return selectionFromQuery(params);
}

export function hasCompleteBasics(row: Company): boolean {
  return [row.name, row.orgNr, row.street, row.postalCode, row.city, row.sni, row.industry].every(
    (value) => value.trim() !== "",
  );
}

export function filterCompanies(selection: Selection): Company[] {
  const raw = selection.query.trim().toLowerCase();
  const compact = raw.replace(/[-\s]/g, "");
  return COMPANIES.filter((item) => {
    if (selection.city && item.city !== selection.city) return false;
    if (selection.sni && item.sni !== selection.sni) return false;
    if (!raw) return true;
    const name = item.name.toLowerCase();
    const org = item.orgNr.toLowerCase();
    return name.includes(raw) || org.includes(raw) || org.replace("-", "").includes(compact);
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
  const parts = [
    selection.city || "Alla orter",
    selection.sni ? industryLabel(selection.sni) : "Alla branscher",
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
