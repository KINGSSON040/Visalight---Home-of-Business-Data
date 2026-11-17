import type { Metadata } from "next";
import { TopicArticle, topicMetadata } from "@/components/topic-view";
import { topicsByKind } from "@/lib/topics";

export function generateStaticParams() {
  return topicsByKind("ord").map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return topicMetadata("ord", slug);
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TopicArticle kind="ord" slug={slug} />;
}
