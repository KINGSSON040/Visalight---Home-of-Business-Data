import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord } from "@/lib/catalog";
import { loadUrval } from "@/lib/register-urval";
import { registerUpdatedLabel } from "@/lib/register-status";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const selection = selectionFromRecord(await searchParams);
  const initialUrval = loadUrval(selection);
  return <CustomerHome initial={selection} initialUrval={initialUrval} updatedLabel={registerUpdatedLabel()} />;
}
