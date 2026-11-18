export function siteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kandidator.se";
  return value.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (path === "/") return siteUrl();
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isProductionIndexable(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export const SITE_NAME = "Kandidator";
