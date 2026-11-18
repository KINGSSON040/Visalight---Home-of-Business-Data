import Link from "next/link";

export function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="py-8">
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-4 grid gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-accent underline underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
