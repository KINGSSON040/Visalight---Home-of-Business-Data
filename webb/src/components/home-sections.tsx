import Link from "next/link";
import { Arrow, Sparkle, Squiggle } from "@/components/doodles";
import { INDUSTRIES } from "@/lib/catalog";
import { NEWS_KIND_LABEL, newsDate, type NewsPost } from "@/lib/nyheter";
import { BASE_ORE, EMAIL_ORE, formatKronor, MINIMUM_ORE, PHONE_ORE, quote, SIGNATORY_ORE } from "@/lib/pricing";
import { PUBLIC_FAQ } from "@/lib/public-faq";

const STEPS = [
  { title: "Välj bolag", text: "Skriv en bransch, en ort eller ett län. Eller tryck på en färdig knapp.", tone: "block-coral" },
  { title: "Se antal och pris", text: "Talet och priset ändras direkt. Inga formulär, inget säljsamtal.", tone: "block-leaf" },
  { title: "Få filen", text: "CSV eller Excel. Ingen prenumeration och ingen bindningstid.", tone: "block-sun" },
];

const TILE_TONES = ["block-coral", "block-leaf", "block-sun", "block-rose", "block-peach"];

export function HowItWorks() {
  return (
    <section id="sa-funkar-det" className="border-t-[3px] border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h2 className="text-4xl leading-none font-bold sm:text-5xl">
          Så funkar det. <span className="text-sea">Tre steg.</span>
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`chunk ${step.tone} relative p-5 ${index === 1 ? "md:translate-y-4" : ""}`}>
              <span className="font-display absolute -top-5 -left-3 inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink bg-white text-2xl font-bold">
                {index + 1}
              </span>
              <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-1.5 font-medium">{step.text}</p>
              {index < STEPS.length - 1 ? <Arrow className="absolute top-1/2 -right-12 hidden h-10 w-14 -rotate-12 md:block" /> : null}
            </li>
          ))}
        </ol>
        <Link href="/#urval" className="btn-chunk mt-10 h-14 px-7 text-lg">
          Börja med steg ett
        </Link>
      </div>
    </section>
  );
}

export function IndustryTiles() {
  return (
    <section id="branscher" className="border-t-[3px] border-ink bg-sun-soft">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <p className="font-hand -rotate-1 text-2xl text-sea">Ett tryck, sen ser ni antalet</p>
        <h2 className="text-4xl leading-none font-bold sm:text-5xl">Exempel på branscher</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {INDUSTRIES.map((item, index) => (
            <li key={item.sni}>
              <Link
                href={`/?sni=${item.sni}#urval`}
                className={`tile chunk-flat ${TILE_TONES[index % TILE_TONES.length]} flex h-full min-h-28 flex-col justify-between p-4 ${index % 2 ? "rotate-1" : "-rotate-1"}`}
              >
                <span className="font-display text-lg leading-tight font-semibold">{item.label}</span>
                <span className="mt-2 flex items-center justify-between text-xs font-black">
                  <span>SNI {item.code}</span>
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-bold">
          <Link href="/bransch" className="underline decoration-coral decoration-[3px] underline-offset-4">
            Alla branscher
          </Link>
          {" · "}
          <Link href="/sni" className="underline decoration-leaf decoration-[3px] underline-offset-4">
            SNI-koder
          </Link>
        </p>
      </div>
    </section>
  );
}

const PRICE_EXAMPLES = [
  {
    title: "Restaurangerna i en stad",
    who: "800 bolag, grunduppgifter",
    counts: { companies: 800, phones: 0, emails: 0, signatoryPhones: 0 },
    tone: "block-rose",
  },
  {
    title: "Ringlista för säljteamet",
    who: "3 000 bolag med telefon",
    counts: { companies: 3000, phones: 3000, emails: 0, signatoryPhones: 0 },
    tone: "block-leaf",
  },
  {
    title: "Stora kampanjen",
    who: "10 000 bolag med telefon, e-post och beslutsfattare",
    counts: { companies: 10000, phones: 10000, emails: 10000, signatoryPhones: 10000 },
    tone: "block-sun",
  },
];

const PRICE_ROWS = [
  {
    title: "Företagsuppgifter (grunddata)",
    price: `${formatKronor(BASE_ORE)} kr/bolag`,
    text: "Namn, organisationsnummer, adress, ort, bransch och SNI-kod, bolagsform och storlek. Ingår alltid.",
    tone: "block-sun",
  },
  {
    title: "Kontaktnummer",
    price: `+${formatKronor(PHONE_ORE)} kr/rad`,
    text: "Bolagets växel- eller företagsnummer. Ni betalar bara för bolag som har ett nummer.",
    tone: "block-leaf",
  },
  {
    title: "Beslutsfattare",
    price: `+${formatKronor(SIGNATORY_ORE)} kr/rad`,
    text: "Nummer till den som bestämmer. Ni betalar bara för bolag där numret finns.",
    tone: "block-rose",
  },
  {
    title: "E-post",
    price: `+${formatKronor(EMAIL_ORE)} kr/rad`,
    text: "Bolagets e-postadress. Ni betalar bara för bolag som har en adress.",
    tone: "block-coral",
  },
];

export function PriceExamples() {
  return (
    <section id="pris" className="border-t-[3px] border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <div>
            <p className="eyebrow text-sea">Innehåll och pris</p>
            <h2 className="mt-3 text-4xl sm:text-6xl">
              Ni betalar endast för{" "}
              <span className="relative inline-block">
                det ni behöver.
                <Squiggle className="absolute -bottom-2 left-0 h-4 w-full" color="var(--leaf)" />
              </span>
            </h2>
            <p className="mt-5 max-w-md text-lg font-medium">
              Varje bolag har grunddata. Kontaktuppgifter väljer ni till per rad. Lägsta order {formatKronor(MINIMUM_ORE)} kr exkl.
              moms. Ingen prenumeration.
            </p>
            <Link href="/#urval" className="btn-chunk mt-6 h-13 px-6 text-base">
              Räkna på ert urval →
            </Link>
          </div>
          <ul className="chunk overflow-hidden">
            {PRICE_ROWS.map((row, index) => (
              <li key={row.title} className={`flex gap-4 px-5 py-4 ${index ? "border-t-[3px] border-ink" : ""}`}>
                <span aria-hidden="true" className={`${row.tone} mt-1 h-4 w-4 shrink-0 rounded-full border-[2.5px] border-ink`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-xl font-extrabold">{row.title}</h3>
                    <span className="font-mono text-sm font-bold text-sea uppercase">{row.price}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">{row.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h3 className="mt-14 text-2xl font-extrabold sm:text-3xl">Tre räkneexempel</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {PRICE_EXAMPLES.map((item, index) => {
            const price = quote(item.counts);
            return (
              <article key={item.title} className={`chunk ${item.tone} p-5 ${index === 1 ? "tilt-r" : ""}`}>
                <h4 className="font-display text-2xl font-extrabold">{item.title}</h4>
                <p className="mt-1 text-sm font-bold">{item.who}</p>
                <p className="font-display tabular mt-4 text-5xl leading-none font-extrabold tracking-[-0.04em]">{formatKronor(price.totalOre)} kr</p>
                <p className="font-mono mt-2 text-xs font-bold">exkl. moms{price.minimumApplied ? " · lägsta order" : ""}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Räkneexempel. Ni betalar bara för uppgifter som finns, och det exakta priset står i byggaren innan ni köper.
        </p>
      </div>
    </section>
  );
}

const NEWS_TONES = ["block-coral", "block-leaf", "block-rose"];

export function NewsCards({ posts }: { posts: NewsPost[] }) {
  return (
    <section id="nyheter" className="border-t-[3px] border-ink bg-peach">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-4xl leading-none font-bold sm:text-5xl">Nyheter och uppdateringar</h2>
          <Link href="/nyheter" className="btn-chunk is-white h-11 px-4 text-sm">
            Alla nyheter
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.slice(0, 3).map((post, index) => (
            <NewsCard key={post.slug} post={post} tone={NEWS_TONES[index % NEWS_TONES.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsCard({ post, tone }: { post: NewsPost; tone: string }) {
  return (
    <article className="chunk tile flex flex-col overflow-hidden">
      <div className={`${tone} flex items-center justify-between gap-2 border-b-[3px] border-ink px-4 py-2 text-xs font-black uppercase tracking-[0.12em]`}>
        <span>{NEWS_KIND_LABEL[post.kind]}</span>
        <time dateTime={post.date}>{newsDate(post.date)}</time>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {post.example ? (
          <p className="mb-1 self-start rounded-full border-2 border-rust px-2 text-[0.68rem] font-black text-rust">Exempeltext</p>
        ) : null}
        <h3 className="text-xl leading-tight font-semibold">
          <Link href={`/nyheter/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 font-medium">{post.excerpt}</p>
        <Link href={post.cta.href} className="mt-3 text-sm font-black text-sea underline decoration-[3px] underline-offset-4">
          {post.cta.label}
        </Link>
      </div>
    </article>
  );
}

export function Faq() {
  return (
    <section id="fragor" className="border-t-[3px] border-ink bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="text-4xl leading-none font-bold sm:text-5xl">Vanliga frågor</h2>
          <p className="font-hand mt-3 -rotate-1 text-2xl text-sea">Kort svar, inga fotnoter.</p>
          <Link href="/#urval" className="btn-chunk is-sun mt-6 h-12 px-5">
            Skapa ert utdrag
          </Link>
        </div>
        <div className="space-y-3">
          {PUBLIC_FAQ.map((item) => (
            <details key={item.q} className="faq chunk-flat bg-white px-4 py-3">
              <summary className="flex cursor-pointer items-center justify-between gap-3">
                <span className="font-display text-lg font-semibold">{item.q}</span>
                <span aria-hidden="true" className="faq-plus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink text-xl font-bold transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-6 font-medium">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ total, example }: { total: number; example: boolean }) {
  return (
    <section className="border-t-[3px] border-ink bg-paper px-4 py-12 sm:py-16">
      <div className="chunk block-coral relative mx-auto max-w-6xl overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14">
        <Sparkle className="absolute top-6 left-6 h-10 w-10" />
        <Sparkle className="absolute right-8 bottom-8 h-8 w-8" color="var(--rose)" />
        <p className="font-hand text-2xl">Redo?</p>
        <h2 className="mx-auto max-w-3xl text-5xl leading-[0.95] font-bold sm:text-7xl">Alla Sveriges företag. Ett tryck bort.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg font-bold">
          {total.toLocaleString("sv-SE")} bolag{example ? " (exempeldata)" : ""} väntar i byggaren. Se antal och pris direkt, utan prenumeration och utan bindningstid.
        </p>
        <Link href="/#urval" className="btn-chunk is-sun mt-8 h-16 px-9 text-xl">
          Bygg ert utdrag nu
        </Link>
      </div>
    </section>
  );
}
