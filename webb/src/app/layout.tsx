import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFrame } from "@/components/site-frame";
import { registerDatabasePath } from "@/lib/register-path";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VisaLight — Företagsdata utan abonnemang",
  description:
    "Skapa ett utdrag av företagsregistret. Välj bransch och ort, se priset och slippa hämta uppgifterna själva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <SiteFrame registerReady={registerDatabasePath() !== null}>{children}</SiteFrame>
      </body>
    </html>
  );
}
