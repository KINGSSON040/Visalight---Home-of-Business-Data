"use client";

import { t } from "@/lib/content/copy";
import { useConsent } from "@/components/layout/consent";

export function CookieSettingsButton() {
  const { openSettings } = useConsent();
  return (
    <button type="button" className="min-h-11 text-left underline decoration-border underline-offset-4" onClick={openSettings}>
      {t("footer.cookieSettings")}
    </button>
  );
}
