import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata(t("notFound.title"), t("notFound.text"), "/404", { index: false });

export default function NotFound() {
  return (
    <Container className="py-16">
      <h1 className="max-w-3xl text-4xl">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-2xl">{t("notFound.text")}</p>
      <ul className="mt-8 grid gap-3">
        <li>
          <Link href="/" className="text-accent underline underline-offset-4">
            {t("notFound.home")}
          </Link>
        </li>
        <li>
          <Link href="/lediga-jobb" className="text-accent underline underline-offset-4">
            {t("notFound.jobs")}
          </Link>
        </li>
        <li>
          <Link href="/kontakt" className="text-accent underline underline-offset-4">
            {t("notFound.contact")}
          </Link>
        </li>
      </ul>
    </Container>
  );
}
