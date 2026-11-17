import { selectionFromQuery } from "@/lib/catalog";
import { loadUrval } from "@/lib/register-urval";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const selection = selectionFromQuery(new URL(request.url).searchParams);
  return Response.json(loadUrval(selection));
}
