import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Plausible } from "@/components/analytics/Plausible";
import { ConsentProvider } from "@/components/layout/consent";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import { t } from "@/lib/content/copy";
import { getServices } from "@/lib/content/read";
import { robotsFor } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: t("meta.home.title"),
    template: "%s | Kandidator",
  },
  description: t("meta.home.description"),
  robots: robotsFor(true),
  openGraph: {
    siteName: "Kandidator",
    locale: "sv_SE",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const services = (await getServices()).map((service) => ({ href: service.href, label: service.name }));

  return (
    <html lang="sv" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-full flex-col">
        <ConsentProvider>
          <MotionProvider>
            <SkipLink />
            <SiteHeader services={services} />
            <main id="innehall" className="flex-1">
              {children}
            </main>
            <SiteFooter services={services} />
            <CookieConsent />
            <Plausible />
            <Toaster />
          </MotionProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
