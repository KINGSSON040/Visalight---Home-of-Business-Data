"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/content/copy";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-16">
      <h1 className="text-4xl">{t("error.title")}</h1>
      <p className="mt-4 max-w-2xl">{t("error.text")}</p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        {t("error.retry")}
      </Button>
    </Container>
  );
}
