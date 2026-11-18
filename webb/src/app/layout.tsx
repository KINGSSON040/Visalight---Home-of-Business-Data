import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFrame } from "@/components/site-frame";
import { registerDatabasePath } from "@/lib/register-path";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin } from "@/lib/topics";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const schibsted = localFont({
  src: [
    { path: "../fonts/SchibstedGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/SchibstedGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/SchibstedGrotesk-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/SchibstedGrotesk-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/SchibstedGrotesk-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-schibsted",
  display: "swap",
});

const jbmono = localFont({
  src: [
    { path: "../fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jbmono",
  display: "swap",
});

const figtree = localFont({
  src: [
    { path: "../fonts/Figtree-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Figtree-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Figtree-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Figtree-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
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
        <SiteFrame
          registerReady={registerDatabasePath() !== null}
          updatedLabel={registerStamp().example ? null : registerStamp().when}
          exampleData={registerStamp().example}
        >
          {children}
        </SiteFrame>
      </body>
    </html>
  );
}
