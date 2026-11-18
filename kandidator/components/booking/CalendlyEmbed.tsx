"use client";

import { useEffect, useId, useSyncExternalStore } from "react";
import { t } from "@/lib/content/copy";
import { useConsent } from "@/components/layout/consent";

/**
 * Calendly's widget.js and the inline booking iframe set cookies
 * (a scheduling session and Calendly's own analytics). The script and
 * iframe are therefore mounted only after the visitor chooses "analys".
 * Until then we show a plain link. If NEXT_PUBLIC_CALENDLY_URL is unset
 * we never render an iframe.
 */
export function CalendlyEmbed() {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
  const { value } = useConsent();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const widgetId = useId().replace(/:/g, "");

  if (!url) {
    return (
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="text-2xl">{t("calendly.title")}</h2>
        <p className="mt-3">{t("calendly.missing")}</p>
      </section>
    );
  }

  const showWidget = mounted && value === "analys";

  return (
    <section className="mt-10">
      <h2 className="text-2xl">{t("calendly.title")}</h2>
      <p className="mt-3">
        <a href={url} className="text-accent underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          {t("calendly.link")}
          <span className="sr-only"> ({t("a11y.external")})</span>
        </a>
      </p>
      {showWidget ? <CalendlyFrame url={url} widgetId={widgetId} /> : <p className="mt-3">{t("calendly.consentNote")}</p>}
    </section>
  );
}

function CalendlyFrame({ url, widgetId }: { url: string; widgetId: string }) {
  useEffect(() => {
    const parent = document.getElementById(widgetId);
    if (!parent) return;
    const existing = document.querySelector<HTMLScriptElement>("script[data-calendly]");
    const start = () => {
      window.Calendly?.initInlineWidget({ url, parentElement: parent });
    };
    if (existing) {
      start();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.dataset.calendly = "true";
    script.onload = start;
    document.body.appendChild(script);
  }, [url, widgetId]);

  return <div id={widgetId} className="mt-4 min-h-[700px] w-full" />;
}
