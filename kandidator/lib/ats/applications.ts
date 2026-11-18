import "server-only";

import { emailApplicationTarget } from "@/lib/email/send";
import type { ApplicationTarget } from "@/lib/ats";

export async function getApplicationTarget(): Promise<ApplicationTarget> {
  const provider = process.env.ATS_PROVIDER?.trim() || "local";
  if (provider === "teamtailor") {
    throw new Error("Teamtailor-kopplingen är inte på. Sätt ATS_PROVIDER=local.");
  }
  if (provider !== "local") {
    throw new Error("Okänd ATS_PROVIDER. Sätt ATS_PROVIDER=local.");
  }
  return emailApplicationTarget;
}
