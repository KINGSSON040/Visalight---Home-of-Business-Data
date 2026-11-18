# Registerverktyget

Internt verktyg för att läsa in, söka, flagga och prissätta bolag.

```bash
npm install
npm run dev
```

Öppna port 4317. `npm test` kör prisberäkningen. `npm run sync` läser SCB när `SCB_API_KEY` finns i miljön. `npm run sync:bolagsverket` läser Bolagsverkets bulkfil i den här mappen och skriver `source`, `registered_on` och `first_seen_at`. Det skapar ingen schemalagd uppgift.
