import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: ["/auth/login", "/auth/signup"],
      disallow: ["/api/", "/dashboard", "/users", "/employee", "/thread", "/bill", "/fabrics", "/members", "/organization-pending"],
    },
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
