import { SELLER } from "@/lib/seller";

export const PUBLIC_FAQ = [
  {
    q: "Vad kostar utdraget?",
    a: "Grunduppgifter kostar 10 öre per bolag. Kontaktnummer kostar 30 öre per nummer, e-postkontakt 40 öre per adress och beslutsfattare 40 öre per nummer. Ni betalar bara när uppgiften finns. Lägsta order är 399 kr exklusive moms, och priset visas alltid innan ni köper.",
  },
  {
    q: "Ingår moms?",
    a: `Priserna i utdraget är exklusive moms. ${SELLER.tradeName} är inte momsregistrerat ännu. Momsnummer fylls i som ${SELLER.vatNr} när bolaget finns.`,
  },
  {
    q: "Hur aktuellt är utdraget?",
    a: "Utdraget tas från den senaste uppdateringen av företagsregistret. Vi säljer inte en fil från förra året. Avregistrerade bolag, konkurs och reklamspärr är redan borta. Det är inte en uppdatering varje minut.",
  },
  {
    q: "Hur betalar vi?",
    a: "Beställning öppnar snart. Tills dess kan ni förhandsboka utdraget med e-post. Ingen betalning dras och ingen fil skickas.",
  },
  {
    q: "Får vi kontakta bolagen?",
    a: "Utdraget är till för att ett företag ska kunna kontakta ett annat företag. Reklamspärrade bolag är borttagna. Ni ansvarar för ert eget utskick, inklusive NIX-Telefon och de regler som gäller just den kanalen.",
  },
  {
    q: "Vilket format får jag?",
    a: "CSV och Excel med fasta kolumner: företagsnamn, organisationsnummer, adress, ort, bransch och SNI, plus de tillval ni har kryssat i. Ett smakprov kan laddas ner innan köp.",
  },
] as const;
