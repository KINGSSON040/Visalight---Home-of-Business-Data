/** Öre. Grunduppgifter 10 öre per säljbart bolag. */
export const BASE_ORE = 10;
/** Öre per telefonnummer som inte är beslutsfattarens. */
export const PHONE_ORE = 30;
/** Öre per beslutsfattarnummer. */
export const SIGNATORY_ORE = 40;
/** Öre per e-postadress. */
export const EMAIL_ORE = 40;
/** Lägsta order, öre. */
export const MINIMUM_ORE = 39900;
/** Från den här storleken räknas priset inte på sidan. */
export const VOLUME_TALK_FROM = 30000;
export const VOLUME_TALK_LINE = "Urvalet är 30 000 bolag eller mer. Ni behöver talas vid för rabatt.";

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
  /** Stort urval. Ingen summa räknas här. */
  talk: boolean;
};

export function quote(counts: PriceCounts): PriceQuote {
  if (counts.companies >= VOLUME_TALK_FROM) {
    return { rawOre: 0, discountOre: 0, totalOre: 0, minimumApplied: false, talk: true };
  }

  const rawOre =
    counts.companies * BASE_ORE +
    counts.phones * PHONE_ORE +
    counts.signatoryPhones * SIGNATORY_ORE +
    counts.emails * EMAIL_ORE;

  if (counts.companies <= 0) {
    return { rawOre: 0, discountOre: 0, totalOre: 0, minimumApplied: false, talk: false };
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
    talk: false,
  };
}

export function formatKronor(ore: number): string {
  const kronor = ore / 100;
  return kronor.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
