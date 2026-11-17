import { sampleXls } from "@/lib/sample-file";

export function GET() {
  return new Response(sampleXls(), {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": 'attachment; filename="visalight-smakprov.xls"',
    },
  });
}
