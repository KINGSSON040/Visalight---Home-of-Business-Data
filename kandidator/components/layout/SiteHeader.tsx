"use client";

import Link from "next/link";
import { useState } from "react";
import { t } from "@/lib/content/copy";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type LinkItem = { href: string; label: string };

function MenuList({ items, onNavigate }: { items: LinkItem[]; onNavigate?: () => void }) {
  return (
    <ul className="grid">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex min-h-11 items-center text-foreground no-underline"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DesktopGroup({ label, items }: { label: string; items: LinkItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="min-h-11 px-3"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-40 min-w-56 rounded-md border border-border bg-card p-2 shadow-md">
          <MenuList items={items} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({ services }: { services: LinkItem[] }) {
  const [open, setOpen] = useState(false);
  const about: LinkItem[] = [
    { href: "/medarbetare", label: t("nav.team") },
    { href: "/kundcase", label: t("nav.cases") },
    { href: "/vanliga-fragor", label: t("nav.faq") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-heading text-2xl text-foreground no-underline">
          Kandidator
        </Link>
        <nav aria-label={t("nav.primary")} className="hidden items-center lg:flex">
          <DesktopGroup label={t("nav.services")} items={services} />
          <Link href="/lediga-jobb" className="flex min-h-11 items-center px-3 text-foreground no-underline">
            {t("nav.jobs")}
          </Link>
          <Link href="/for-arbetsgivare" className="flex min-h-11 items-center px-3 text-foreground no-underline">
            {t("nav.employers")}
          </Link>
          <DesktopGroup label={t("nav.about")} items={about} />
          <Link href="/kontakt" className="flex min-h-11 items-center px-3 text-foreground no-underline">
            {t("nav.contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/kontakt">{t("nav.contactCta")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex min-h-11 items-center rounded-md border border-border px-4 lg:hidden">
              {t("nav.openMenu")}
            </SheetTrigger>
            <SheetContent title={t("nav.menu")} closeLabel={t("nav.closeMenu")}>
              <nav aria-label={t("nav.primary")} className="grid gap-6">
                <div>
                  <p className="font-semibold">{t("nav.services")}</p>
                  <MenuList items={services} onNavigate={() => setOpen(false)} />
                </div>
                <Link href="/lediga-jobb" className="min-h-11 text-foreground no-underline" onClick={() => setOpen(false)}>
                  {t("nav.jobs")}
                </Link>
                <Link href="/for-arbetsgivare" className="min-h-11 text-foreground no-underline" onClick={() => setOpen(false)}>
                  {t("nav.employers")}
                </Link>
                <div>
                  <p className="font-semibold">{t("nav.about")}</p>
                  <MenuList items={about} onNavigate={() => setOpen(false)} />
                </div>
                <Link href="/kontakt" className="min-h-11 text-foreground no-underline" onClick={() => setOpen(false)}>
                  {t("nav.contact")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
