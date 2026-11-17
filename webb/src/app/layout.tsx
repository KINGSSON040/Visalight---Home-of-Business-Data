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
    "Företagsinformation från aktuellt företagsregister. Välj bransch eller SNI-kod, se antal och pris, och få utdraget utan abonnemang.",
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
