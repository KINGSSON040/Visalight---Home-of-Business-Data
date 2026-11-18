import en from "@/data/copy/en.json";
import sv from "@/data/copy/sv.json";

export type CopyKey = keyof typeof sv;

type EqualKeys<A, B> = keyof A extends keyof B ? (keyof B extends keyof A ? true : never) : never;
const keysMatch: EqualKeys<typeof sv, typeof en> = true;
void keysMatch;

const english = en as Record<CopyKey, string>;

export function t(key: CopyKey, locale: "sv" | "en" = "sv"): string {
  if (locale === "en") {
    const value = english[key];
    if (value) return value;
  }
  return sv[key];
}
