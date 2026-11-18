"use client";

import Link from "next/link";
import { t } from "@/lib/content/copy";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ConsentField({ text }: { text: string }) {
  return (
    <FormField
      name="consent"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-start gap-3">
            <FormControl>
              <Checkbox checked={field.value === true} onCheckedChange={(checked) => field.onChange(checked === true)} />
            </FormControl>
            <div>
              <FormLabel className="font-normal">{text}</FormLabel>{" "}
              <Link href="/integritetspolicy" className="text-accent underline underline-offset-4">
                {t("forms.privacyLink")}
              </Link>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
