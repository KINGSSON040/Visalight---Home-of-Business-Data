import { selectionFromQuery } from "@/lib/catalog";
import { sampleCsv } from "@/lib/sample-file";

export function GET(request: Request) {
  const selection = selectionFromQuery(new URL(request.url).searchParams);
  return new Response(sampleCsv(selection), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="visalight-smakprov.csv"',
    },
  });
}
