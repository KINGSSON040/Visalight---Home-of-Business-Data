import { permanentRedirect, notFound } from "next/navigation";
import { sniPaths, topicForSni, topicPath } from "@/lib/topics";

export function generateStaticParams() {
  return sniPaths().map((row) => ({ code: row.code }));
}

export default async function SniCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const topic = topicForSni(decodeURIComponent(code));
  if (!topic) notFound();
  permanentRedirect(topicPath(topic));
}
