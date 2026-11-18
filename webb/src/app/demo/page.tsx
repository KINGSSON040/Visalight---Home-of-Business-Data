import { redirect } from "next/navigation";

function kindFrom(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "meddelande" || raw === "mote" || raw === "tid") return raw;
  return "";
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kind = kindFrom((await searchParams).arende);
  redirect(kind ? `/kontakt?arende=${kind}` : "/kontakt");
}
