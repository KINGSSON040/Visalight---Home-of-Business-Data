import Link from "next/link";
import { t } from "@/lib/content/copy";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

export function CtaBand({ href }: { href: string }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <Container className="py-12">
        <h2 className="text-3xl">{t("cta.bandTitle")}</h2>
        <p className="mt-3 max-w-2xl">{t("cta.bandText")}</p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href={href}>{t("cta.inquiry")}</Link>
        </Button>
      </Container>
    </section>
  );
}
