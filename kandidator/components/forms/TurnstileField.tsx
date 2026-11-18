"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { t } from "@/lib/content/copy";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
  if (existing) {
    return new Promise((resolve) => {
      if (window.turnstile) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.dataset.turnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(script);
  });
}

export function TurnstileField({ resetKey }: { resetKey: number }) {
  const { setValue, formState } = useFormContext();
  const message = formState.errors.turnstileToken?.message;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        if (widgetId.current) window.turnstile.remove(widgetId.current);
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          language: "sv",
          theme: "light",
          callback: (token: string) => setValue("turnstileToken", token, { shouldValidate: true }),
          "expired-callback": () => setValue("turnstileToken", "", { shouldValidate: true }),
          "error-callback": () => setValue("turnstileToken", "", { shouldValidate: true }),
        });
      })
      .catch(() => {
        setValue("turnstileToken", "");
      });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [resetKey, setValue]);

  if (!siteKey) {
    return <p className="text-destructive">{t("forms.turnstileMissing")}</p>;
  }

  return (
    <div id="turnstileToken">
      <div ref={ref} />
      {message ? <p className="mt-2 text-destructive">{String(message)}</p> : null}
    </div>
  );
}
