import { selectionFromQuery } from "@/lib/catalog";
import { sampleXls } from "@/lib/sample-file";

export function GET(request: Request) {
  const selection = selectionFromQuery(new URL(request.url).searchParams);
  return new Response(sampleXls(selection), {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": 'attachment; filename="visalight-smakprov.xls"',
    },
  });
}
