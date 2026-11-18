import { Reveal } from "@/components/motion/Reveal";

export function PageHero({
  eyebrow,
  title,
  text,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  compact?: boolean;
}) {
  return (
    <Reveal>
      <header className={compact ? "py-8" : "py-12 md:py-16"}>
        {eyebrow ? <p className="mb-3 font-semibold text-accent">{eyebrow}</p> : null}
        <h1 className="max-w-3xl text-4xl md:text-5xl">{title}</h1>
        {text ? <p className="mt-4 max-w-2xl text-lg">{text}</p> : null}
      </header>
    </Reveal>
  );
}
