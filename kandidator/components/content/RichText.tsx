import Link from "next/link";
import { isSafeHref } from "@/lib/content/mdx";

function inline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] && match[2] && isSafeHref(match[2])) {
      nodes.push(
        match[2].startsWith("/") ? (
          <Link key={index} href={match[2]}>
            {match[1]}
          </Link>
        ) : (
          <a key={index} href={match[2]} rel="noopener noreferrer">
            {match[1]}
          </a>
        ),
      );
    } else if (match[3]) {
      nodes.push(<strong key={index}>{match[3]}</strong>);
    } else {
      nodes.push(match[0]);
    }
    last = match.index + match[0].length;
    index += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="grid gap-3">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={blockIndex} className="list-disc pl-5">
              {lines.map((line) => (
                <li key={line}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={blockIndex}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
