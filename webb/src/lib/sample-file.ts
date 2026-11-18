import { COMPANIES, filterCompanies, hasSegment, legalFormLabel, type Company, type Selection } from "@/lib/catalog";

const COLUMNS = [
  "organisationsnummer",
  "foretagsnamn",
  "gatuadress",
  "postnummer",
  "postort",
  "lan",
  "bolagsform",
  "bransch",
  "sni",
  "anstallda",
  "telefon",
  "epost",
  "beslutsfattare",
] as const;

export function sampleCompanies(selection?: Selection): Company[] {
  if (!selection || !hasSegment(selection)) return COMPANIES.slice(0, 16);
  return filterCompanies({ ...selection, query: "" }).slice(0, 16);
}

export function sampleRows(selection?: Selection): string[][] {
  return [
    [...COLUMNS],
    ...sampleCompanies(selection).map((company) => [
      company.orgNr,
      company.name,
      company.street,
      company.postalCode,
      company.city,
      company.county,
      legalFormLabel(company.form),
      company.industry,
      company.sni,
      company.employees,
      company.phones.join(" | "),
      company.emails.join(" | "),
      company.signatoryPhones.join(" | "),
    ]),
  ];
}

function csvCell(value: string): string {
  if (/[;"\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Semikolon och BOM, så filen öppnas kolumnvis i svensk Excel. */
export function csvFromRows(rows: string[][]): string {
  const body = rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  return `\uFEFF${body}\r\n`;
}

export function sampleCsv(selection?: Selection): string {
  return csvFromRows(sampleRows(selection));
}

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** SpreadsheetML som Excel öppnar utan extra programbibliotek. */
export function sampleXls(selection?: Selection): string {
  const rows = sampleRows(selection)
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${xml(cell)}</Data></Cell>`)
          .join("")}</Row>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Smakprov"><Table>${rows}</Table></Worksheet>
</Workbook>`;
}
