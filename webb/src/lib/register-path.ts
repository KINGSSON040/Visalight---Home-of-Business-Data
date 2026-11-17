import fs from "node:fs";
import path from "node:path";

/** Sökvägen till synkens sqlite-fil, om den finns på den här datorn. */
export function registerDatabasePath(): string | null {
  const candidates = [
    process.env.VISALIGHT_DB,
    path.join(process.cwd(), "data", "visalight.sqlite"),
    path.join(process.cwd(), "..", "register", "data", "visalight.sqlite"),
  ].filter((item): item is string => Boolean(item));
  return candidates.find((file) => fs.existsSync(file)) ?? null;
}
