import { INDUSTRIES } from "@/lib/catalog";

export type TopicKind = "bransch" | "ord";

export type Topic = {
  slug: string;
  kind: TopicKind;
  nav: string;
  title: string;
  description: string;
  lead: string;
  sni?: string;
};

export const TOPICS: Topic[] = [
  bransch("restauranger", "Restauranger", "56110", "En restauranglista behöver namn, adress och SNI, och telefon bara där krogen har ett nummer."),
  bransch("byggforetag", "Byggföretag", "41200", "Byggföretag söks på ort och SNI för husbyggnad, med tom ruta där telefon eller e-post saknas."),
  bransch("datakonsulter", "Datakonsulter", "62010", "Datakonsulter ligger ofta under SNI för dataprogrammering. Urvalet kan begränsas till en ort."),
  bransch("livsmedelshandel", "Livsmedelshandel", "47112", "Butiker i livsmedelshandeln kan filtreras på ort. Kontaktfält följer med bara när de finns."),
  bransch("vardcentraler", "Vårdcentraler", "86211", "Vårdcentraler har en egen SNI-kod. Filen tar med adressen och lämnar telefon tom om den inte är angiven."),
  bransch("akerier", "Åkerier", "49410", "Åkerier och annan vägtransport kan avgränsas med SNI och ort innan filen beställs."),
  bransch("frisorsalonger", "Frisörsalonger", "96210", "Frisörsalonger har SNI 96.210, Frisörer och barberare. Skönhetssalonger är en annan kod, 96.220."),
  bransch("redovisningsbyraer", "Redovisningsbyråer", "69201", "Redovisningsbyråer söks via sin SNI-kod. E-post kommer med när källan har en adress."),
  bransch("elektriker", "Elektriker", undefined, "Elektriker och elinstallatörer är en vanlig lista när man söker hantverkare i en kommun."),
  bransch("rormokare", "Rörmokare", undefined, "Rörmokare och VVS-firmor behövs ofta ort för ort, med namn och adress som grund."),
  bransch("malerifirmor", "Målerifirmor", undefined, "Målerifirmor kan samlas som ett branschurval. Numret följer med bara om det står i källan."),
  bransch("stadfirmor", "Städfirmor", undefined, "Städfirmor och lokalvård är ett vanligt urval för den som ringer eller mejlar företag."),
  bransch("advokatbyraer", "Advokatbyråer", undefined, "Advokatbyråer identifieras som bransch, med organisationsnummer och adress på varje rad."),
  bransch("revisionsbyraer", "Revisionsbyråer", "69202", "Revisionsbyråer har SNI 69.202. Redovisningsbyråer ligger på 69.201 och är ett annat urval."),
  bransch("fastighetsforvaltare", "Fastighetsförvaltare", undefined, "Fastighetsförvaltare har egna listor, skilda från mäklare och från bolag som bara äger hus."),
  bransch("hotell", "Hotell", undefined, "Hotell söks som bransch och kan begränsas till en ort. Kedjor och enskilda hus ligger som egna bolag."),
  bransch("tandlakare", "Tandläkare", undefined, "Tandläkarmottagningar behövs ofta lokalt. Adressen finns med, telefonen bara när den är publicerad i källan."),
  bransch("bilverkstader", "Bilverkstäder", undefined, "Bilverkstäder är ett vanligt urval för reservdelar, försäkring och verkstadsbesök."),
  bransch("reklambyraer", "Reklambyråer", undefined, "Reklambyråer kan listas för samarbeten. E-post lämnas tom om byrån inte har angett någon."),
  bransch("arkitektkontor", "Arkitektkontor", undefined, "Arkitektkontor söks som egen bransch, med organisationsnummer så raden går att skilja från liknande namn."),
  bransch("bemanningsforetag", "Bemanningsföretag", undefined, "Bemanningsföretag och personaluthyrning kan tas ut som ett eget urval."),
  bransch("catering", "Catering", undefined, "Cateringfirmor ligger nära restaurang men är en egen bransch när listan ska vara precis."),
  bransch("bagerier", "Bagerier", undefined, "Bagerier kan sökas för leverans och grossist. Flera arbetsställen betyder flera bolag, inte en gissad kedja."),
  bransch("tradgardsforetag", "Trädgårdsföretag", undefined, "Trädgårdsföretag och skötsel av grönytor är ett säsongsdrivet urval som hålls till angiven ort."),
  bransch("flyttfirmor", "Flyttfirmor", undefined, "Flyttfirmor behövs ofta i en stad. Listan tar med de bolag som har adress och SNI, inte avregistrerade namn."),
  bransch("sakerhetsforetag", "Säkerhetsföretag", undefined, "Säkerhetsföretag och bevakning kan tas ut som bransch när uppdraget kräver den nischen."),
  bransch("e-handel", "E-handel", undefined, "E-handlare har sällan besöksadress som säger hela verksamheten. Adressen i filen är den källan har angett."),
  bransch("veterinarkliniker", "Veterinärkliniker", undefined, "Veterinärkliniker är få per ort. Därför syns det tydligt när telefon eller e-post saknas."),
  bransch("gym", "Gym", undefined, "Gym och träningsanläggningar kan listas per ort. Ett bolag kan ha ett nummer, ett annat inget."),
  bransch("forskoleforetag", "Förskoleföretag", undefined, "Förskoleföretag är bolag, inte varje avdelning. Urvalet följer organisationsnumret."),
  bransch("fotografer", "Fotografer", undefined, "Fotografer driver ofta små bolag. Namn och adress räcker som grund, kontaktfält när de finns."),
  bransch("maklare", "Mäklare", undefined, "Mäklarfirmor kan skiljas från fastighetsägare. Filen tar med firman, inte mäklarens privata nummer om det inte är angivet."),
  ord("foretagsdata", "Företagsdata", "Företagsdata är namn, organisationsnummer, adress, ort, bransch och de kontaktfält källan faktiskt har."),
  ord("foretagsregister", "Företagsregister", "Ett företagsregister används för att hitta bolag och avgränsa dem innan en fil beställs."),
  ord("organisationsnummer", "Organisationsnummer", "Organisationsnumret är nyckeln på varje rad, så två bolag med liknande namn inte blandas ihop."),
  ord("foretagslista", "Företagslista", "En företagslista är urvalet som exporteras, med de kolumner du kryssat i och tomma celler där uppgift saknas."),
  ord("branschregister", "Branschregister", "Ett branschregister grupperar bolag efter SNI, så en lista kan gälla en bransch i stället för alla bolag."),
  ord("sni-kod", "SNI-kod", "SNI-koden talar om branschen. Filtret kan ta en exakt kod eller de koder som börjar med samma siffror."),
  ord("kundregister", "Kundregister", "Ett kundregister byggt på företagsdata är ett urval av bolag, inte en färdig lista över vem som redan är kund."),
  ord("prospektlista", "Prospektlista", "En prospektlista är bolag som matchar ort och bransch, med telefon och e-post bara där de finns."),
  ord("telefonnummer-till-foretag", "Telefonnummer till företag", "Telefonnummer följer med per nummer som finns hos bolaget. Saknas numret lämnas fältet tomt och kostar inget."),
  ord("e-post-till-foretag", "E-post till företag", "E-postadresser tas med när källan har angett dem. En tom ruta betyder att adressen inte fanns, inte att den glömdes."),
  ord("bolagsregister", "Bolagsregister", "Bolagsregistret är underlaget för namn, organisationsnummer och status, inklusive vilka bolag som är avregistrerade."),
  ord("nystartade-bolag", "Nystartade bolag", "Nystartade bolag syns när startdatumet finns i källan. Ett ungt bolag har oftare tomma kontaktfält."),
  ord("aktiebolag", "Aktiebolag", "Aktiebolag är en bolagsform i urvalet. Namnet slutar ofta på AB, men filtret kan ändå hålla sig till formen."),
  ord("kontaktuppgifter", "Kontaktuppgifter", "Kontaktuppgifter är telefon, beslutsfattarnummer och e-post. Grunduppgifterna namn och adress ingår alltid."),
  ord("postadress", "Postadress", "Postadressen är gata, postnummer och ort. Saknas gata eller ort hålls bolaget utanför en säljbar fil."),
  ord("b2b-data", "B2B-data", "B2B-data här är uppgifter om bolag, inte om privatpersoner. Beslutsfattarnumret är märkt för sig när källan pekar ut det."),
];

function bransch(slug: string, nav: string, sni: string | undefined, lead: string): Topic {
  return {
    slug,
    kind: "bransch",
    nav,
    title: `Företagsdata om ${nav.toLowerCase()}`,
    description: `${lead} VisaLight arbetar med verifierad, uppdaterad och färsk företagsdata. Verktyget visar exempel tills registret är kopplat.`,
    lead,
    sni,
  };
}

function ord(slug: string, nav: string, lead: string): Topic {
  return {
    slug,
    kind: "ord",
    nav,
    title: nav,
    description: `${lead} Uppgifterna är verifierade, uppdaterade och färska från officiella register. Exempelbolagen i verktyget är exempel.`,
    lead,
  };
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const seen = new Set<string>();
for (const topic of TOPICS) {
  const key = `${topic.kind}:${topic.slug}`;
  if (seen.has(key) || !slugPattern.test(topic.slug)) {
    throw new Error(`Ogiltig sida: ${key}`);
  }
  seen.add(key);
}

export function topicsByKind(kind: TopicKind): Topic[] {
  return TOPICS.filter((topic) => topic.kind === kind).sort((a, b) => a.nav.localeCompare(b.nav, "sv"));
}

export function linkedIndustries(): Topic[] {
  return TOPICS.filter((topic) => topic.kind === "bransch" && topic.sni && INDUSTRIES.some((item) => item.sni === topic.sni));
}

export function getTopic(kind: TopicKind, slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.kind === kind && topic.slug === slug);
}

export function topicPath(topic: Topic): string {
  return topic.kind === "bransch" ? `/bransch/${topic.slug}` : `/ord/${topic.slug}`;
}

export function topicBuilderHref(topic: Topic): string {
  if (topic.sni && INDUSTRIES.some((item) => item.sni === topic.sni)) {
    return `/?sni=${topic.sni}#urval`;
  }
  return "/#urval";
}

export function relatedTopics(topic: Topic, count = 4): Topic[] {
  const peers = topicsByKind(topic.kind);
  const index = peers.findIndex((item) => item.slug === topic.slug);
  if (index < 0) return [];
  const related: Topic[] = [];
  for (let step = 1; related.length < count && step < peers.length; step += 1) {
    related.push(peers[(index + step) % peers.length]);
  }
  return related;
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://visalight.se").replace(/\/$/, "");
}
