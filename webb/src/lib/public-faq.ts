import { BASE_ORE, EMAIL_ORE, formatKronor, PHONE_ORE, SIGNATORY_ORE } from "@/lib/pricing";
import { SELLER } from "@/lib/seller";

export const PUBLIC_FAQ = [
  {
    q: "Vad kostar utdraget?",
    a: `Grunduppgifter kostar ${formatKronor(BASE_ORE)} kr per bolag. Kontaktnummer kostar ${formatKronor(PHONE_ORE)} kr per nummer, e-postkontakt ${formatKronor(EMAIL_ORE)} kr per adress och beslutsfattare ${formatKronor(SIGNATORY_ORE)} kr per nummer. Ni betalar bara när uppgiften finns. Lägsta order är 399 kr exklusive moms, och priset visas innan ni köper. Från 30 000 bolag räknas priset inte på sidan. Ni behöver talas vid för rabatt.`,
  },
  {
    q: "Ingår moms?",
    a: `Priserna i utdraget är exklusive moms. ${SELLER.line}`,
  },
  {
    q: "Hur aktuellt är utdraget?",
    a: "Nå er nästa kund med en aktuell lista. När registret är inkopplat följer siffran och filen den senaste uppdateringen, så informationen är färsk. Filen är inte från förra året. Bara aktiva företag som inte spärrat reklam ingår. Vilande, inaktiva, avregistrerade och reklamspärrade bolag är redan borta. Det är inte en uppdatering varje minut. Tills registret är inkopplat visas inga antal.",
  },
  {
    q: "Hur betalar vi?",
    a: "Beställning öppnar snart. Ingen betalning dras och ingen fil skickas.",
  },
  {
    q: "Får vi kontakta bolagen?",
    a: "Kontakta er nästa kund idag. Reklamspärrade bolag är borttagna. Ni ansvarar för ert eget utskick, inklusive NIX-Telefon och de regler som gäller just den kanalen.",
  },
  {
    q: "Hur skiljer sig ett utdrag från ett gratis uppslag eller ett årsabonnemang?",
    a: "Välj listan själva och hitta er nästa kund idag. Antal och pris syns innan ni köper, och det finns ingen prenumeration. Ett gratis uppslag gäller ett bolag i taget. Ett årsabonnemang bevakar och kräver inloggning. Listan är ingen kreditupplysning och ingen bevakning varje dag. När registret är inkopplat synkas den en gång i veckan, så uppgifterna är färska.",
  },
  {
    q: "Vilket format får jag?",
    a: "CSV och Excel med fasta kolumner: företagsnamn, organisationsnummer, adress, ort, bransch och SNI, plus de tillval ni har kryssat i. Ett smakprov kan laddas ner innan köp.",
  },
] as const;
