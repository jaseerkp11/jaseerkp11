import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { EmptyState } from "@/components/ui/empty-state";
import { getDropBySlug } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getDropBySlug(slug);
  if (!result) return { title: "Drop" };
  const { section, config } = result;
  const brand = getBrand();
  return {
    title: section.title,
    description: (config.subtitle as string) ?? "",
    openGraph: {
      title: section.title,
      description: (config.subtitle as string) ?? "",
      images: config.imageUrl ? [config.imageUrl as string] : [],
    },
  };
}

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getDropBySlug(slug);
  if (!result) notFound();

  const { section, config, products } = result;
  const isLive = (config.status as string) === "LIVE";
  const isUpcoming = (config.status as string) === "SCHEDULED";
  const isEnded = (config.status as string) === "ENDED" || (config.status as string) === "ARCHIVED";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: section.title,
          description: (config.subtitle as string) ?? "",
          url: publicUrl(`/drops/${config.slug}`),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{section.title}</h1>
          <p className="mt-2 text-sm text-muted">{(config.subtitle as string) ?? ""}</p>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            isLive ? "bg-[#2f6b4f] text-white" : isUpcoming ? "bg-[#b4553a] text-white" : "bg-[#ece6dc] text-[#5c564e]"
          }`}>
            {isLive ? "Live now" : isUpcoming ? "Coming soon" : String(config.status ?? "drop").toLowerCase()}
          </span>
        </div>
        {(config.imageUrl as string) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.imageUrl as string} alt={section.title} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
        ) : null}
      </div>

      {isEnded ? (
        <EmptyState
          title="This drop has ended."
          description="Browse our current catalogue or check back for the next drop."
          action={{ href: "/products", label: "Shop catalogue" }}
        />
      ) : products.length === 0 ? (
        <EmptyState title="No products in this drop yet." description="Check back soon." />
      ) : (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Curated products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
