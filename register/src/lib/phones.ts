/** Formaterar ett nummer som källan angav det. Hittar vi inga siffror returneras null och inget sparas. */
export function normalizePhone(raw: string): { e164: string; digits: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  const only = digits.replace(/\+/g, "");
  if (only.length < 7) return null;
  let national = only;
  if (national.startsWith("00")) national = national.slice(2);
  if (national.startsWith("46")) {
    return { e164: `+${national}`, digits: national };
  }
  if (national.startsWith("0")) {
    return { e164: `+46${national.slice(1)}`, digits: `46${national.slice(1)}` };
  }
  return { e164: `+${national}`, digits: national };
}

export function displayOrgNr(orgNr: string): string {
  const digits = orgNr.replace(/\D/g, "");
  if (digits.length !== 10) return orgNr;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

export function compactOrgNr(value: string): string {
  return value.replace(/\D/g, "");
}
