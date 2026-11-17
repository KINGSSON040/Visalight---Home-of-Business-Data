import type { Selection } from "@/lib/catalog";
import { quote, type PriceCounts, type PriceQuote } from "@/lib/pricing";

export type UrvalPreview = {
  orgNr: string;
  name: string;
  city: string;
  sni: string;
};

export type UrvalResult = {
  source: "register" | "example";
  status: "idle" | "ready";
  companies: number;
  phones: number;
  signatoryPhones: number;
  emails: number;
  preview: UrvalPreview[];
  note: string;
};

export function pricedCounts(
  urval: UrvalResult,
  selection: Pick<Selection, "phones" | "emails" | "signatory">,
): PriceCounts {
  if (urval.status !== "ready") {
    return { companies: 0, phones: 0, signatoryPhones: 0, emails: 0 };
  }
  return {
    companies: urval.companies,
    phones: selection.phones ? urval.phones : 0,
    signatoryPhones: selection.signatory ? urval.signatoryPhones : 0,
    emails: selection.emails ? urval.emails : 0,
  };
}

export function priceForUrval(
  urval: UrvalResult,
  selection: Pick<Selection, "phones" | "emails" | "signatory">,
): PriceQuote {
  return quote(pricedCounts(urval, selection));
}
