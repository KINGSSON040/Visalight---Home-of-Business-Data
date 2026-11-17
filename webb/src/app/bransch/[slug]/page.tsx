import type { Metadata } from "next";
import { TopicArticle, topicMetadata } from "@/components/topic-view";
import { topicsByKind } from "@/lib/topics";

export function generateStaticParams() {
  return topicsByKind("bransch").map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return topicMetadata("bransch", slug);
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TopicArticle kind="bransch" slug={slug} />;
}
