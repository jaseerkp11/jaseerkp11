import type { MetadataRoute } from "next";
import { getBrand } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  const brand = getBrand();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/account", "/checkout"],
      },
    ],
    sitemap: `${brand.siteUrl}/sitemap.xml`,
  };
}
