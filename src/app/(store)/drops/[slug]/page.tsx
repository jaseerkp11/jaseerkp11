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
  const drop = await getDropBySlug(slug);
  if (!drop) return { title: "Drop" };
  const brand = getBrand();
  return {
    title: drop.title,
    description: drop.subtitle,
    openGraph: {
      title: drop.title,
      description: drop.subtitle,
      images: drop.imageUrl ? [drop.imageUrl] : [],
    },
  };
}

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const cfg = drop.config as Record<string, unknown>;
  const isLive = cfg.status === "LIVE";
  const isUpcoming = cfg.status === "SCHEDULED";
  const isEnded = cfg.status === "ENDED" || cfg.status === "ARCHIVED";
  const products = (drop.products ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    sellingPaise: number;
    compareAtPaise: number | null;
    stock: number;
    reservedStock: number;
    images: Array<{ url: string; alt: string }>;
    reviews: Array<{ rating: number }>;
  }>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: drop.title,
          description: drop.subtitle,
          url: publicUrl(`/drops/${cfg.slug}`),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{drop.title}</h1>
          <p className="mt-2 text-sm text-muted">{drop.subtitle}</p>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            isLive ? "bg-[#2f6b4f] text-white" : isUpcoming ? "bg-[#b4553a] text-white" : "bg-[#ece6dc] text-[#5c564e]"
          }`}>
            {isLive ? "Live now" : isUpcoming ? "Coming soon" : String(cfg.status ?? "drop").toLowerCase()}
          </span>
        </div>
        {drop.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={drop.imageUrl} alt={drop.title} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
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
