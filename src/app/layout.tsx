import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { getBrand } from "@/config/brand";
import { JsonLd } from "@/components/seo/json-ld";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = getBrand();
  return {
    metadataBase: new URL(brand.siteUrl),
    title: {
      default: `${brand.brandName} — ${brand.tagline}`,
      template: `%s · ${brand.brandName}`,
    },
    description: brand.tagline,
    icons: { icon: brand.faviconUrl },
    openGraph: {
      type: "website",
      siteName: brand.brandName,
      title: brand.brandName,
      description: brand.tagline,
      url: brand.siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: brand.brandName,
      description: brand.tagline,
    },
    alternates: { canonical: brand.siteUrl },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const brand = getBrand();
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        style={
          {
            "--primary": brand.primaryColor,
            "--secondary": brand.secondaryColor,
            "--accent": brand.accentColor,
            "--background": brand.backgroundColor,
            "--foreground": brand.inkColor,
          } as CSSProperties
        }
      >
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.brandName,
            url: brand.siteUrl,
            email: brand.supportEmail,
            telephone: brand.supportPhone,
          }}
        />
        {children}
      </body>
    </html>
  );
}
