import type { MetadataRoute } from "next";
import { siteOrigin, TOPICS, topicPath } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const now = new Date();
  const fixed = ["", "/bransch", "/ord", "/kassa", "/smakprov", "/foretag", "/kallor", "/gdpr", "/salj", "/ekonomi", "/utvecklare", "/demo"].map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: now,
  }));
  const topics = TOPICS.map((topic) => ({
    url: `${origin}${topicPath(topic)}`,
    lastModified: now,
  }));
  return [...fixed, ...topics];
}
