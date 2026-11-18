"use client";

import Script from "next/script";
import { useConsent } from "@/components/layout/consent";

export function Plausible() {
  const { value } = useConsent();
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (value !== "analys" || !domain) return null;
  return <Script defer data-domain={domain} src="https://plausible.io/js/script.js" />;
}
