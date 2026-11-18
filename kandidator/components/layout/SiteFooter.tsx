import Link from "next/link";
import { t } from "@/lib/content/copy";
import { Container } from "@/components/layout/Container";
import { CookieSettingsButton } from "@/components/layout/CookieSettingsButton";

type LinkItem = { href: string; label: string };

function Column({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg">{title}</h2>
      <ul className="grid gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-foreground underline decoration-border underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ services }: { services: LinkItem[] }) {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <Column title={t("footer.services")} links={services} />
        <Column
          title={t("footer.candidates")}
          links={[
            { href: "/lediga-jobb", label: t("footer.jobs") },
            { href: "/for-jobbsokande", label: t("footer.forCandidates") },
            { href: "/vanliga-fragor", label: t("footer.faq") },
          ]}
        />
        <Column
          title={t("footer.company")}
          links={[
            { href: "/om-oss", label: t("footer.about") },
            { href: "/medarbetare", label: t("footer.team") },
            { href: "/kundcase", label: t("footer.cases") },
            { href: "/blogg", label: t("footer.blog") },
          ]}
        />
        <div>
          <h2 className="mb-3 text-lg">{t("footer.legal")}</h2>
          <ul className="grid gap-2">
            <li>
              <Link href="/integritetspolicy" className="text-foreground underline decoration-border underline-offset-4">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/cookiepolicy" className="text-foreground underline decoration-border underline-offset-4">
                {t("footer.cookies")}
              </Link>
            </li>
            <li>
              <Link href="/villkor" className="text-foreground underline decoration-border underline-offset-4">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
        </div>
      </Container>
      <Container className="pb-8">
        <p>{t("footer.rights")}</p>
      </Container>
    </footer>
  );
}
