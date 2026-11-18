import { INDUSTRIES, selectionIndustries } from "@/lib/catalog";

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
  bransch("restauranger", "56110", "Restaurangverksamhet behöver namn, adress och SNI, och telefon bara där bolaget har ett nummer."),
  bransch("byggforetag", "41200", "Byggande av bostadshus och andra byggnader söks på ort och SNI, med tom ruta där telefon eller e-post saknas."),
  bransch("datakonsulter", "62010", "Dataprogrammering kan begränsas till en ort. Telefon och e-post följer med bara där de finns."),
  bransch("livsmedelshandel", "47112", "Livsmedelshandel med brett sortiment, ej varuhus eller stormarknad, kan filtreras på ort. Kontaktfält följer med bara när de finns."),
  bransch("vardcentraler", "86211", "Primärvårdsmottagningar med läkare m.m. har en egen SNI-kod. Filen tar med adressen och lämnar telefon tom om den inte är angiven."),
  bransch("akerier", "49410", "Vägtransport, godstrafik kan avgränsas med SNI och ort innan filen beställs."),
  bransch("frisorsalonger", "96210", "Frisörer och barberare har SNI 96.210. Skönhetsvård och andra skönhetsbehandlingar är en annan kod, 96.220."),
  bransch("redovisningsbyraer", "69201", "Redovisning och bokföring; skatterådgivning söks via sin SNI-kod. E-post kommer med när källan har en adress."),
  bransch("elektriker", "43210", "Elinstallationer är en vanlig lista när man söker hantverkare i en kommun."),
  bransch("rormokare", "43221", "Värme- och sanitetsarbeten behövs ofta ort för ort, med namn och adress som grund."),
  bransch("malerifirmor", "43341", "Måleriarbeten kan samlas som ett branschurval. Numret följer med bara om det står i källan."),
  bransch("stadfirmor", "81210", "Lokalvård är ett vanligt urval för den som ringer eller mejlar företag."),
  bransch("advokatbyraer", "69101", "Advokatbyråverksamhet identifieras som bransch, med organisationsnummer och adress på varje rad."),
  bransch("revisionsbyraer", "69202", "Revision har SNI 69.202. Redovisning och bokföring; skatterådgivning ligger på 69.201 och är ett annat urval."),
  bransch("fastighetsforvaltare", "68320", "Fastighetsförvaltning på uppdrag har egna listor, skilda från fastighetsförmedling och från bolag som bara äger hus."),
  bransch("hotell", "55101", "Hotellverksamhet med restaurangrörelse söks som bransch och kan begränsas till en ort. Kedjor och enskilda hus ligger som egna bolag."),
  bransch("tandlakare", "86230", "Tandläkarverksamhet behövs ofta lokalt. Adressen finns med, telefonen bara när den är publicerad i källan."),
  bransch("bilverkstader", "95311", "Allmän service och reparation av motorfordon utom motorcyklar är ett vanligt urval för reservdelar, försäkring och verkstadsbesök."),
  bransch("reklambyraer", "73111", "Reklambyråverksamhet kan listas för samarbeten. E-post lämnas tom om bolaget inte har angett någon."),
  bransch("arkitektkontor", "71110", "Arkitektverksamhet söks som egen bransch, med organisationsnummer så raden går att skilja från liknande namn."),
  bransch("bemanningsforetag", "78201", "Personaluthyrning kan tas ut som ett eget urval."),
  bransch("catering", "56210", "Cateringverksamhet vid enskilda evenemang ligger nära restaurangverksamhet men är en egen bransch när listan ska vara precis."),
  bransch("bagerier", "10710", "Tillverkning av mjukt matbröd och färska bakverk kan sökas för leverans och grossist. Flera arbetsställen betyder flera bolag, inte en gissad kedja."),
  bransch("tradgardsforetag", "81300", "Skötsel och underhåll av grönytor är ett säsongsdrivet urval som hålls till angiven ort."),
  bransch("flyttfirmor", "49420", "Flyttjänster behövs ofta i en stad. Listan tar med de bolag som har adress och SNI, inte avregistrerade namn."),
  bransch("sakerhetsforetag", "80010", "Bevakningsverksamhet och privat säkerhetsverksamhet kan tas ut som bransch när uppdraget kräver den nischen."),
  bransch("e-handel", "47123", "Detaljhandel via internet eller postorder med brett sortiment har sällan besöksadress som säger hela verksamheten. Adressen i filen är den källan har angett."),
  bransch("veterinarkliniker", "75000", "Veterinärverksamhet är få bolag per ort. Därför syns det tydligt när telefon eller e-post saknas."),
  bransch("gym", "93130", "Drift av gymanläggningar kan listas per ort. Ett bolag kan ha ett nummer, ett annat inget."),
  bransch("forskoleforetag", "85100", "Förskoleutbildning gäller bolag, inte varje avdelning. Urvalet följer organisationsnumret."),
  bransch("fotografer", "74200", "Fotoverksamhet drivs ofta i små bolag. Namn och adress räcker som grund, kontaktfält när de finns."),
  bransch("maklare", "68310", "Fastighetsförmedling kan skiljas från fastighetsägare. Filen tar med firman, inte ett privat nummer om det inte är angivet."),
  ord("foretagsdata", "Företagsdata", "Företagsdata är namn, organisationsnummer, adress, ort, bransch och de kontaktfält källan faktiskt har."),
  ord("foretagsregister", "Företagsregister", "Ett företagsregister används för att hitta bolag och avgränsa dem innan en fil beställs."),
  ord("organisationsnummer", "Organisationsnummer", "Organisationsnumret är nyckeln på varje rad, så två bolag med liknande namn inte blandas ihop."),
  ord("foretagslista", "Företagslista", "En företagslista är urvalet som exporteras, med de kolumner ni kryssat i och tomma celler där uppgift saknas."),
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

function bransch(slug: string, sni: string, lead: string): Topic {
  const nav = selectionIndustries().find((item) => item.sni === sni)?.label ?? sni;
  return {
    slug,
    kind: "bransch",
    nav,
    title: `Företagslista och utdrag för ${nav}`,
    description: `Företagslista och utdrag för ${nav}. ${lead} Antal och pris syns innan köp. Tills registret är kopplat är siffrorna exempel.`,
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
    description: `${lead} Priset visas innan köp. Tills registret är kopplat är siffrorna i verktyget exempel.`,
    lead,
  };
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

for (const industry of INDUSTRIES) {
  if (TOPICS.some((topic) => topic.kind === "bransch" && topic.sni === industry.sni)) continue;
  TOPICS.push(
    bransch(
      slugify(industry.label),
      industry.sni,
      `${industry.label} har SNI ${dottedSni(industry.sni)}. Utdraget innehåller namn, organisationsnummer, adress och bransch, och telefon bara där numret finns.`,
    ),
  );
}

export function dottedSni(code: string): string {
  const digits = code.replace(/\D/g, "");
  return digits.length === 5 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : digits;
}

export function topicForSni(raw: string): Topic | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  const industry = INDUSTRIES.find(
    (item) => item.sni === digits || (item.legacy ?? []).some((code) => code.replace(/\D/g, "") === digits),
  );
  if (!industry) return undefined;
  return TOPICS.find((topic) => topic.kind === "bransch" && topic.sni === industry.sni);
}

export function sniPaths(): { code: string; topic: Topic }[] {
  const rows: { code: string; topic: Topic }[] = [];
  for (const industry of INDUSTRIES) {
    const topic = TOPICS.find((item) => item.kind === "bransch" && item.sni === industry.sni);
    if (!topic) continue;
    const codes = [industry.sni, industry.code, ...(industry.legacy ?? [])];
    for (const code of codes) {
      rows.push({ code: code.replace(/\D/g, ""), topic });
      if (code.includes(".")) rows.push({ code, topic });
      else rows.push({ code: dottedSni(code), topic });
    }
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.code)) return false;
    seen.add(row.code);
    return true;
  });
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
  if (topic.sni && selectionIndustries().some((item) => item.sni === topic.sni)) {
    return `/?sni=${topic.sni}#urval`;
  }
  if (topic.kind === "bransch") return `/?bransch=${encodeURIComponent(topic.nav)}#urval`;
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
