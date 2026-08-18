import type { MetadataRoute } from "next";
import { getBrand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrand();
  return {
    name: brand.brandName,
    short_name: brand.brandName,
    description: brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: brand.backgroundColor,
    theme_color: brand.primaryColor,
  };
}
