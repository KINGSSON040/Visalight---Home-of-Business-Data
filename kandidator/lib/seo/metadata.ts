import type { Metadata } from "next";
import { absoluteUrl, isProductionIndexable } from "@/lib/site";

export function robotsFor(index: boolean): Metadata["robots"] {
  if (!isProductionIndexable() || !index) {
    return { index: false, follow: false };
  }
  return { index: true, follow: true };
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: { index?: boolean; absoluteTitle?: boolean },
): Metadata {
  const index = options?.index ?? true;
  const documentTitle = options?.absoluteTitle ? { absolute: title } : title;
  const socialTitle = options?.absoluteTitle ? title : `${title} | Kandidator`;
  return {
    title: documentTitle,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: robotsFor(index),
    openGraph: {
      title: socialTitle,
      description,
      url: absoluteUrl(path),
      siteName: "Kandidator",
      locale: "sv_SE",
      type: "website",
    },
  };
}
