import Link from "next/link";
import { formatNewsDate, NEWS_KIND_LABEL, type NewsItem } from "@/lib/news";

const CARD_TONES = ["bg-[var(--pop-sun)] tilt-l-sm", "bg-white tilt-r-sm", "bg-[var(--pop-lime)] tilt-l-sm"];

export function NewsCards({ items }: { items: NewsItem[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.slug}>
          <Link href={`/nyheter/${item.slug}`} className={`sticker hover-wiggle flex h-full flex-col p-5 ${CARD_TONES[index % CARD_TONES.length]}`}>
            <span className="flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-[0.12em] uppercase">
              <span className="rounded-full bg-[var(--pop-ink)] px-2.5 py-0.5 text-white">{NEWS_KIND_LABEL[item.kind]}</span>
              <time dateTime={item.date}>{formatNewsDate(item.date)}</time>
            </span>
            <span className="font-display mt-3 block text-xl leading-tight sm:text-2xl">{item.title}</span>
            <span className="mt-2 block flex-1 text-sm leading-6 font-semibold">{item.lead}</span>
            <span className="mt-4 flex items-center justify-between gap-2 text-sm font-extrabold">
              <span className="underline decoration-[var(--pop-magenta)] decoration-[3px] underline-offset-4">Läs mer</span>
              {item.example ? <span className="rounded-full border-2 border-[var(--pop-ink)] bg-white px-2 py-0.5 text-[0.68rem] uppercase">Exempeltext</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
