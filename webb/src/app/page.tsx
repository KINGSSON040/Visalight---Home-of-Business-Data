import { CustomerHome } from "@/components/customer-home";
import { selectionFromRecord } from "@/lib/catalog";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const selection = selectionFromRecord(await searchParams);
  return <CustomerHome initial={selection} />;
}
