import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { CaseStudy } from "@/lib/content/types";

export function CaseCard({ item }: { item: CaseStudy }) {
  const name = item.clientPublic ? item.client : item.industry;
  return (
    <Card className="h-full">
      <p className="text-muted-foreground">
        {name} · {item.year}
      </p>
      <h2 className="mt-2 text-2xl">
        <Link href={`/kundcase/${item.slug}`} className="text-foreground no-underline">
          {item.title}
        </Link>
      </h2>
      <p className="mt-3">{item.summary}</p>
    </Card>
  );
}
