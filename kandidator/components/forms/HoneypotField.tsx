"use client";

import { useFormContext } from "react-hook-form";
import { t } from "@/lib/content/copy";

export function HoneypotField() {
  const { register } = useFormContext();
  return (
    <div aria-hidden="true" className="absolute left-[-10000px] h-0 w-0 overflow-hidden">
      <label htmlFor="company_website">{t("forms.honeypot")}</label>
      <input id="company_website" tabIndex={-1} autoComplete="off" {...register("company_website")} />
    </div>
  );
}
