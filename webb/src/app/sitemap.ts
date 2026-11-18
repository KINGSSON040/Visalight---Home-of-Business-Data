import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/nyheter";
import { loadStats } from "@/lib/register-stats";
import { registerStamp } from "@/lib/register-status";
import { siteOrigin, TOPICS, topicPath } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const now = new Date();
  const stamp = registerStamp();
  const posts = allPosts(loadStats(), stamp.when, stamp.isoDate);
  const realNews = posts.filter((post) => !post.example);
  const fixed = ["", "/statistik", "/nystartade-bolag", "/bransch", "/sni", "/ord", "/smakprov", "/foretag", "/konto", "/kallor", "/gdpr", "/integritet", "/villkor", "/cookies", "/salj", "/ekonomi", "/utvecklare", "/demo"].map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: now,
  }));
  const news =
    realNews.length === 0
      ? []
      : [
          { url: `${origin}/nyheter`, lastModified: now },
          ...realNews.map((post) => ({ url: `${origin}/nyheter/${post.slug}`, lastModified: now })),
        ];
  const topics = TOPICS.map((topic) => ({
    url: `${origin}${topicPath(topic)}`,
    lastModified: now,
  }));
  return [...fixed, ...news, ...topics];
}
