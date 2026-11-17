/** Öre. Grunduppgifter 10 öre per säljbart bolag. */
export const BASE_ORE = 10;
/** Öre per nummer som inte är firmatecknarens. */
export const PHONE_ORE = 30;
/** Öre per firmatecknarens nummer. */
export const SIGNATORY_ORE = 40;
/** Öre per e-postadress. */
export const EMAIL_ORE = 40;
/** Lägsta order, öre. */
export const MINIMUM_ORE = 39900;

export const VOLUME_DISCOUNTS: { fromCompanies: number; factor: number }[] = [];

export type PriceCounts = {
  companies: number;
  phones: number;
  signatoryPhones: number;
  emails: number;
};

export type PriceQuote = {
  rawOre: number;
  discountOre: number;
  totalOre: number;
  minimumApplied: boolean;
};

export function quote(counts: PriceCounts): PriceQuote {
  const rawOre =
    counts.companies * BASE_ORE +
    counts.phones * PHONE_ORE +
    counts.signatoryPhones * SIGNATORY_ORE +
    counts.emails * EMAIL_ORE;

  if (counts.companies <= 0) {
    return { rawOre: 0, discountOre: 0, totalOre: 0, minimumApplied: false };
  }

  let factor = 1;
  for (const tier of VOLUME_DISCOUNTS) {
    if (counts.companies >= tier.fromCompanies) factor = tier.factor;
  }
  const discounted = Math.round(rawOre * factor);
  const minimumApplied = discounted < MINIMUM_ORE;
  return {
    rawOre,
    discountOre: rawOre - discounted,
    totalOre: minimumApplied ? MINIMUM_ORE : discounted,
    minimumApplied,
  };
}

export function formatKronor(ore: number): string {
  const kronor = ore / 100;
  return kronor.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
