# Visalight, hemsidan

Kundsidan där ett urval byggs och priset räknas. Om `register/data/visalight.sqlite` finns efter synken läser sidan de riktiga bolagen. Annars visas exempelbolag. Kassan drar inga pengar.

```bash
npm install
npm run dev
```

Sidan lyssnar på port 4480.

Utan register visar räknaren, `/statistik` och nyhetsinlägget om registret exempeldata, märkt som exempeldata. Nyheterna ligger i `src/lib/nyheter.ts`. Inlägget "Registret uppdaterat" skapas från registret, de andra är exempeltexter som byts mot riktiga.
