import type { Metadata } from "next";
import { Familjen_Grotesk, Newsreader, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Visalight — Företagsdata utan abonnemang",
  description:
    "Välj svenska företag, betala från 399 kr och få filen till din e-post. Inget abonnemang och inget konto krävs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
