export const CONSENT_COOKIE = "kandidator-samtycke";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export const consentValues = ["analys", "nodvandiga"] as const;
export type ConsentValue = (typeof consentValues)[number];

export function isConsentValue(value: string | undefined | null): value is ConsentValue {
  return value === "analys" || value === "nodvandiga";
}

export function readConsentFromDocument(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  const value = row?.slice(CONSENT_COOKIE.length + 1);
  return isConsentValue(value) ? value : null;
}

export function writeConsentCookie(value: ConsentValue): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}
