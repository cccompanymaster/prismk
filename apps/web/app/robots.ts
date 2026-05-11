import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/patterns", "/patterns/", "/match", "/privacy", "/terms"],
        // Per spec: result pages are private (per-user) and the in-progress
        // test flow should never end up in indexes either.
        disallow: ["/result/", "/test/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
