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
  title: "VisaLight — Verifierad, uppdaterad och färsk företagsinformation",
  description:
    "VisaLight säljer verifierad, uppdaterad och färsk företagsinformation. Ni köper för att hitta er nästa kund redan idag. Välj bransch, se antal och pris, utan abonnemang.",
  openGraph: {
    locale: "sv_SE",
    type: "website",
    siteName: "VisaLight",
    title: "VisaLight — Verifierad, uppdaterad och färsk företagsinformation",
    description:
      "Ni köper för att hitta er nästa kund redan idag. Det hänger ihop med att jobba med färsk information.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${schibsted.variable} ${figtree.variable} ${inter.className} antialiased`}>
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
