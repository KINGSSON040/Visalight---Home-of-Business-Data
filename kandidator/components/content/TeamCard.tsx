import { Card } from "@/components/ui/card";
import type { TeamMember } from "@/lib/content/types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamCard({ person }: { person: TeamMember }) {
  return (
    <Card>
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary font-heading text-xl" aria-hidden>
        {initials(person.name)}
      </div>
      <h2 className="mt-4 text-2xl">{person.name}</h2>
      <p>{person.role}</p>
      <p className="text-muted-foreground">{person.location}</p>
      {person.email ? (
        <p className="mt-3">
          <a className="text-accent underline underline-offset-4" href={`mailto:${person.email}`}>
            {person.email}
          </a>
        </p>
      ) : null}
      {person.phone ? <p>{person.phone}</p> : null}
      {person.body.trim() ? <p className="mt-3">{person.body.trim()}</p> : null}
    </Card>
  );
}
