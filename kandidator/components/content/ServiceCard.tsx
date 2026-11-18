import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import type { ServiceItem } from "@/lib/content/types";

export function ServiceCard({ service, level = "h3" }: { service: ServiceItem; level?: "h2" | "h3" }) {
  const Title = level;
  return (
    <Reveal>
      <Card className="h-full">
        <Title className="text-2xl">
          <Link href={service.href} className="text-foreground no-underline">
            {service.name}
          </Link>
        </Title>
        <p className="mt-3">{service.summary}</p>
      </Card>
    </Reveal>
  );
}
