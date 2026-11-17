import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/topics";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/crm", "/api/"],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
