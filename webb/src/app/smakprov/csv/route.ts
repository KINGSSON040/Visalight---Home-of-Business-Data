import { sampleCsv } from "@/lib/sample-file";

export function GET() {
  return new Response(sampleCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="visalight-smakprov.csv"',
    },
  });
}
