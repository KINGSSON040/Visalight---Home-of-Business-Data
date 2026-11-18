import type { MetadataRoute } from "next";
import { getPublishedCases, getPublishedPosts, readAllJobs } from "@/lib/content/read";
import { absoluteUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/om-oss",
  "/tjanster",
  "/tjanster/rekrytering",
  "/tjanster/headhunting",
  "/tjanster/bemanning",
  "/roller/salj",
  "/roller/it",
  "/roller/ekonomi",
  "/for-arbetsgivare",
  "/for-jobbsokande",
  "/lediga-jobb",
  "/kundcase",
  "/medarbetare",
  "/blogg",
  "/vanliga-fragor",
  "/kontakt",
  "/integritetspolicy",
  "/cookiepolicy",
  "/villkor",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, cases, posts] = await Promise.all([readAllJobs(), getPublishedCases(), getPublishedPosts()]);
  const paths = [
    ...staticPaths,
    ...jobs.filter((job) => !job.draft && !job.example && job.status === "open").map((job) => `/lediga-jobb/${job.slug}`),
    ...cases.map((item) => `/kundcase/${item.slug}`),
    ...posts.map((post) => `/blogg/${post.slug}`),
  ];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
