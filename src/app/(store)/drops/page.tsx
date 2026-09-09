import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicDrops, parseSectionConfig } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const brand = getBrand();
  return {
    title: `Drops · ${brand.brandName}`,
    description: "Curated temporary drops from THERAREIFY.",
  };
}

export default async function DropsPage() {
  const drops = await getPublicDrops();
  const live = drops.find((d) => (parseSectionConfig(d).status as string) === "LIVE");
  const upcoming = drops.find((d) => (parseSectionConfig(d).status as string) === "SCHEDULED");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
           name: "THERAREIFY Drops",
          url: publicUrl("/drops"),
        }}
      />
      <h1 className="font-display text-4xl">Drops</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Limited-time curated collections. When a drop is live, it appears here first.
      </p>

      {live ? (
        <section className="mt-8">
          <Link href={`/drops/${(parseSectionConfig(live).slug as string) ?? live.id}`} className="block overflow-hidden rounded-[2rem] border border-line bg-card">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-6 sm:p-10">
                <span className="inline-flex rounded-full bg-[#2f6b4f] px-3 py-1 text-xs font-medium text-white">Live now</span>
                <h2 className="mt-3 font-display text-3xl">{live.title}</h2>
                <p className="mt-2 text-sm text-muted">{(parseSectionConfig(live).subtitle as string) ?? ""}</p>
                <span className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">
                  View Drop
                </span>
              </div>
              {(parseSectionConfig(live).imageUrl as string) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={parseSectionConfig(live).imageUrl as string} alt={live.title} className="aspect-[4/3] w-full object-cover md:aspect-auto" />
              ) : null}
            </div>
          </Link>
        </section>
      ) : upcoming ? (
        <section className="mt-8">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-card">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="p-6 sm:p-10">
                <span className="inline-flex rounded-full bg-[#b4553a] px-3 py-1 text-xs font-medium text-white">Coming soon</span>
                <h2 className="mt-3 font-display text-3xl">{upcoming.title}</h2>
                <p className="mt-2 text-sm text-muted">{(parseSectionConfig(upcoming).subtitle as string) ?? ""}</p>
              </div>
              {(parseSectionConfig(upcoming).imageUrl as string) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={parseSectionConfig(upcoming).imageUrl as string} alt={upcoming.title} className="aspect-[4/3] w-full object-cover md:aspect-auto" />
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-8">
          <EmptyState
            title="Something worth discovering is coming."
            description="We're hunting for the next great finds."
            action={{ href: "/", label: "Notify me" }}
          />
        </section>
      )}

      {drops.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">All Drops</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {drops.map((d) => (
              <Link key={d.id} href={`/drops/${(parseSectionConfig(d).slug as string) ?? d.id}`} className="rounded-2xl border border-line bg-card p-4">
                <p className="font-medium">{d.title}</p>
                <p className="mt-1 text-xs text-muted">{(parseSectionConfig(d).status as string) ?? "DRAFT"}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
