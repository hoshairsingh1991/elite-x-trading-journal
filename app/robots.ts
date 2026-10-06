import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/expenses",
        "/notes",
        "/profile",
        "/settings",
        "/trades",
        "/update-password",
        "/api/",
      ],
    },
    sitemap: "https://www.elitextrading.ca/sitemap.xml",
  };
}