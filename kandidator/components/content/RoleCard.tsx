import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import type { RoleItem } from "@/lib/content/types";

export function RoleCard({ role }: { role: RoleItem }) {
  return (
    <Reveal>
      <Card className="h-full">
        <h3 className="text-2xl">
          <Link href={role.href} className="text-foreground no-underline">
            {role.name}
          </Link>
        </h3>
        <p className="mt-3">{role.summary}</p>
      </Card>
    </Reveal>
  );
}
