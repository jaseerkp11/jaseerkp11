import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getCollectionBySlug } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  const brand = getBrand();
  return {
    title: collection.title,
    description: collection.subtitle,
    openGraph: {
      title: collection.title,
      description: collection.subtitle,
      images: collection.imageUrl ? [collection.imageUrl] : [],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const cfg = collection.config as Record<string, unknown>;
  const products = (collection as unknown as { products?: Array<any> }).products ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: collection.title,
          description: collection.subtitle,
          url: publicUrl(`/collections/${cfg.slug}`),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{collection.title}</h1>
          <p className="mt-2 text-sm text-muted">{collection.subtitle}</p>
        </div>
        {collection.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={collection.imageUrl} alt={collection.title} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
        ) : null}
      </div>
      {products.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((cp) => (
              <ProductCard key={cp.id} product={cp} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-muted">No products in this collection yet.</p>
      )}
    </div>
  );
}
