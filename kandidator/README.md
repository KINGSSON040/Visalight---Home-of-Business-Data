# Kandidator

Svensk webbplats för rekrytering, headhunting och bemanning. Appen ligger i den här mappen och rör inte övriga filer i Visalight-repot.

## Köra lokalt

```bash
cd kandidator
npm install
cp .env.example .env.local
npm run dev
```

Öppna http://localhost:3000.

`npm run build` bygger för produktion. `npm run lint` kör ESLint.

## Miljövariabler

Alla namn finns i `.env.example`. Inga hemligheter ska ligga i git.

- `NEXT_PUBLIC_SITE_URL` är kanonisk adress. Tomt värde faller tillbaka till `https://kandidator.se`.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` och `TURNSTILE_SECRET_KEY` krävs för att formulär ska gå att skicka. Saknas nyckeln visas en svensk text i formuläret, och servern nekar token som saknas.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` laddar Plausible bara efter valet **Godkänn analys**.
- `NEXT_PUBLIC_CALENDLY_URL` är bokningsadressen. Tomt värde ger en text på arbetsgivarsidan, aldrig en tom iframe. Script och iframe laddas bara efter analyssamtycke, eftersom Calendly sätter cookies.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` och `CONTACT_FROM_EMAIL` krävs för mejl. Saknas de svarar formuläret med ett fel, inte ett låtsas-ok.
- `BLOB_READ_WRITE_TOKEN` krävs för CV-uppladdning. Filer läggs i ett privat lager och ska raderas när mejlet tagits emot.
- `ATS_PROVIDER` tomt eller `local` läser annonser från `data/jobs`. `teamtailor` är inte inkopplat och stoppas med ett tydligt fel.

Indexering är avstängd tills `VERCEL_ENV` är `production`.

## Innehåll

- Texter i gränssnittet: `data/copy/sv.json`. `en.json` har samma nycklar och tomma strängar, så svenska används.
- Sidor: `data/pages`. Juridik: `data/legal`, inklusive `/villkor`.
- Annonser: `data/jobs`. `draft: true` ger 404. `example: true` märks Exempel, indexeras inte och blir inte JobPosting.
- Tjänster, roller, process och frågor: YAML-filerna i `data/`.
- Kundcase, medarbetare och blogg publiceras när `draft` är `false`. Tomt citat, ofullständigt citat eller bild utan alt visas inte.

Exempelannonserna som följer med är märkta exempel. De är inte riktiga uppdrag, kunder eller omdömen.

## Kvar mot planen

- Teamtailor är bara en avstängd gren i `JobSource`.
- Resend, Turnstile och Blob kan inte provas utan riktiga nycklar.
- De medföljande annonserna är exempel, så ingen JobPosting skrivs ut förrän en riktig öppen annons med `validThrough` läggs in.
- Kundcase, medarbetare och blogg är utkast, därför syns tomma lägen.
- Juridiska sidor är märkta utkast och saknar organisationsnummer, adress, telefon och e-post tills de är bekräftade.
- Lighthouse är inte mätt.
- Inga E2E-tester. CSP tillåter `'unsafe-inline'` i script eftersom en nonce inte kan följa med den statiska ytan i Cache Components.
- En okänd eller utkastad adress visar sidan "Sidan finns inte" och `noindex`. Med Cache Components kan det första svaret vara HTTP 200 medan sidan streamas. Ett senare anrop för annons-, tjänst- och rolladresser blir 404. Utkast till kundcase och blogg stannar på det streamade svaret.
