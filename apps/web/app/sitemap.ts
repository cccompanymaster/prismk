import type { MetadataRoute } from "next";
import { patterns } from "@prism-k/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/patterns`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/match`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const patternRoutes: MetadataRoute.Sitemap = patterns.map((p) => ({
    url: `${SITE_URL}/patterns/${p.id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...patternRoutes];
}
