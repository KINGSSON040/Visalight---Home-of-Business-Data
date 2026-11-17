# Visalight

Register över svenska företag, byggt för att sälja urval utan prenumeration.

## Registerverktyget

Katalogen `register/` är det interna verktyget: sök bolag, flagga, räkna pris och läs in SCB.

```bash
cd register
npm install
npm run dev
```

Verktyget lyssnar på port 4317. Exempelrader visas tills den första riktiga inläsningen.

API-nyckeln söks med BankID på [registreraafr.scb.se](https://registreraafr.scb.se/). Ingen egen domän behövs. Lägg nyckeln i miljövariabeln `SCB_API_KEY` och kör `npm run sync` i `register/`. Klistra inte in nyckeln i chatt eller i git.

## Pris

Lägsta order 399 kr. Grunduppgifter 10 öre per säljbart bolag. Övriga nummer 30 öre styck, firmatecknarens nummer 40 öre styck, e-post 40 öre styck. Tomma fält kostar inget. Reklamspärrade och avregistrerade bolag ingår inte i priset.

## Skärmbild

`listbyggare-inlagg.png` är en tidigare skärmbild från listbyggaren, restauranger i Stockholm hos Telia.
