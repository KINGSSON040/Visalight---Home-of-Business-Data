"use client";

import Link from "next/link";
import { t } from "@/lib/content/copy";
import { Container } from "@/components/layout/Container";
import { useConsent } from "@/components/layout/consent";

export function CookieConsent() {
  const { bannerOpen, choose } = useConsent();
  if (!bannerOpen) return null;

  return (
    <div
      data-cookie-banner
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-[0_-8px_24px_rgba(20,36,51,0.08)]"
      role="dialog"
      aria-label={t("cookies.title")}
    >
      <Container className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-semibold">{t("cookies.title")}</p>
          <p>
            {t("cookies.text")}{" "}
            <Link href="/cookiepolicy" className="text-accent underline underline-offset-4">
              {t("cookies.policy")}
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className="min-h-11 rounded-md border border-primary bg-card px-4 font-semibold" onClick={() => choose("analys")}>
            {t("cookies.accept")}
          </button>
          <button type="button" className="min-h-11 rounded-md border border-primary bg-card px-4 font-semibold" onClick={() => choose("nodvandiga")}>
            {t("cookies.reject")}
          </button>
        </div>
      </Container>
    </div>
  );
}
