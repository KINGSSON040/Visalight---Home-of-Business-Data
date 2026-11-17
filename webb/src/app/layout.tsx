import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFrame } from "@/components/site-frame";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VisaLight — Verifierad företagsdata utan abonnemang",
  description:
    "VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata från officiella register. Välj urval och få filen från 399 kr. Förhandsvisningen visar exempelbolag tills registret är kopplat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
