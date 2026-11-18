import type { BlogPost, FaqItem, Job } from "@/lib/content/types";
import { absoluteUrl, siteUrl } from "@/lib/site";

export type Crumb = { name: string; href: string };

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kandidator",
    url: siteUrl(),
    areaServed: {
      "@type": "Country",
      name: "Sverige",
    },
  };
}

export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function jobPostingSchema(job: Job) {
  if (job.example || job.status !== "open" || !job.validThrough) return null;
  const employmentType =
    job.employment === "visstid"
      ? "TEMPORARY"
      : job.employment === "konsult"
        ? "CONTRACTOR"
        : job.workload === "deltid"
          ? "PART_TIME"
          : "FULL_TIME";
  const remote = job.locationType === "distans";
  const nationwide = job.location.trim().toLowerCase() === "hela sverige";
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: plainText(job.body),
    datePosted: job.publishedAt,
    validThrough: job.validThrough,
    employmentType,
    directApply: true,
    hiringOrganization: job.companyPublic
      ? { "@type": "Organization", name: job.company }
      : { "@type": "Organization", name: "Kandidator", sameAs: siteUrl() },
    ...(remote ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(remote || nationwide
      ? { applicantLocationRequirements: { "@type": "Country", name: "Sverige" } }
      : {}),
    ...(!nationwide
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: "SE",
            },
          },
        }
      : {}),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: plainText(item.answer),
      },
    })),
  };
}

export function articleSchema(post: BlogPost, authorName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    description: post.excerpt,
    author:
      authorName === "Kandidator"
        ? { "@type": "Organization", name: "Kandidator", url: siteUrl() }
        : { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "Kandidator", url: siteUrl() },
    mainEntityOfPage: absoluteUrl(`/blogg/${post.slug}`),
  };
}
