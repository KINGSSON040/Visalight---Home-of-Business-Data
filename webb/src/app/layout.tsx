import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Figtree, Space_Mono } from "next/font/google";
import { SiteFrame } from "@/components/site-frame";
import { registerDatabasePath } from "@/lib/register-path";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-face",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hand-face",
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
      <body className={`${display.variable} ${mono.variable} ${body.variable} ${hand.variable} ${body.className} antialiased`}>
        <SiteFrame registerReady={registerDatabasePath() !== null} updatedLabel={registerStamp().when} exampleData={registerStamp().example}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
