export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
};

export type BrandConfig = {
  brandName: string;
  tagline: string;
  legalName: string;
  logoText: string;
  logoUrl: string | null;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  inkColor: string;
  currency: string;
  currencySymbol: string;
  country: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks: SocialLinks;
  siteUrl: string;
};

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function absoluteSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function getBrand(): BrandConfig {
  return {
    brandName: env("NEXT_PUBLIC_BRAND_NAME", "THERAREIFY"),
    tagline: env(
      "NEXT_PUBLIC_BRAND_TAGLINE",
      "Thoughtful everyday goods for modern Indian homes",
    ),
    legalName: env("NEXT_PUBLIC_LEGAL_NAME", "THERAREIFY Retail Private Limited"),
    logoText: env("NEXT_PUBLIC_LOGO_TEXT", "THERAREIFY"),
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL?.trim() || null,
    faviconUrl: env("NEXT_PUBLIC_FAVICON_URL", "/favicon.ico"),
    primaryColor: env("NEXT_PUBLIC_PRIMARY_COLOR", "#1f3d34"),
    secondaryColor: env("NEXT_PUBLIC_SECONDARY_COLOR", "#c4a574"),
    accentColor: env("NEXT_PUBLIC_ACCENT_COLOR", "#b4553a"),
    backgroundColor: env("NEXT_PUBLIC_BG_COLOR", "#f6f1ea"),
    inkColor: env("NEXT_PUBLIC_INK_COLOR", "#161513"),
    currency: env("NEXT_PUBLIC_CURRENCY", "INR"),
    currencySymbol: env("NEXT_PUBLIC_CURRENCY_SYMBOL", "₹"),
    country: env("NEXT_PUBLIC_COUNTRY", "IN"),
    supportEmail: env("NEXT_PUBLIC_SUPPORT_EMAIL", "hello@example.com"),
    supportPhone: env("NEXT_PUBLIC_SUPPORT_PHONE", "+91 98765 43210"),
    socialLinks: {
      instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
      facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
      twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
      youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
      whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP,
    },
    siteUrl: absoluteSiteUrl(),
  };
}

export function publicUrl(path = "/"): string {
  const brand = getBrand();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${brand.siteUrl}${normalized}`;
}
