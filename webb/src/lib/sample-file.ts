import { COMPANIES, legalFormLabel, type Company } from "@/lib/catalog";

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

export function sampleCompanies(): Company[] {
  return COMPANIES.slice(0, 16);
}

export function sampleRows(): string[][] {
  return [
    [...COLUMNS],
    ...sampleCompanies().map((company) => [
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
export function sampleCsv(): string {
  const body = sampleRows()
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  return `\uFEFF${body}\r\n`;
}

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** SpreadsheetML som Excel öppnar utan extra programbibliotek. */
export function sampleXls(): string {
  const rows = sampleRows()
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
