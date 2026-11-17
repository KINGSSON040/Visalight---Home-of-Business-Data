import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFrame } from "@/components/site-frame";
import { registerDatabasePath } from "@/lib/register-path";
import { registerUpdatedLabel } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "VisaLight — Företagsinformation och företagsdata",
  description:
    "Färsk företagsdata för svenska bolag. Välj bransch eller SNI, se antal och pris exklusive moms, och få utdraget utan abonnemang.",
  openGraph: {
    locale: "sv_SE",
    type: "website",
    siteName: "VisaLight",
    title: "VisaLight — Färsk företagsdata för svenska bolag",
    description:
      "Välj bransch och ort. Se antalet och priset direkt. Utdraget tas från den senaste uppdateringen av företagsregistret.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <SiteFrame registerReady={registerDatabasePath() !== null} updatedLabel={registerUpdatedLabel()}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
