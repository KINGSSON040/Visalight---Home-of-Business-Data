import type { Metadata } from "next";
import { Figtree, Inter, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { SiteFrame } from "@/components/site-frame";
import { registerDatabasePath } from "@/lib/register-path";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  weight: ["400", "500", "600", "700", "800"],
});

const jbmono = localFont({
  src: [
    { path: "../fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jbmono",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
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
      <body className={`${inter.variable} ${schibsted.variable} ${figtree.variable} ${jbmono.variable} ${inter.className} antialiased`}>
        <SiteFrame registerReady={registerDatabasePath() !== null} updatedLabel={registerStamp().when} exampleData={registerStamp().example}>
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
