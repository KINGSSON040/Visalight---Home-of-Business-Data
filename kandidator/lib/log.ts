import "server-only";

import { headers } from "next/headers";

export async function requestIp(): Promise<string | undefined> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return headerList.get("cf-connecting-ip") ?? forwarded?.split(",")[0]?.trim() ?? undefined;
}

export function logForm(
  form: "employer" | "application" | "spontaneous",
  ok: boolean,
  note?: "honeypot" | "validation" | "turnstile" | "resend" | "blob" | "blob-delete-failed",
): void {
  console.info(JSON.stringify({ form, ok, ...(note ? { note } : {}) }));
}
