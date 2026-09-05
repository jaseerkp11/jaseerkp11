import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { JsonLd } from "@/components/seo/json-ld";
import { getBrand, publicUrl } from "@/config/brand";
import { getPublicCollections } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const brand = getBrand();
  return {
    title: `Collections · ${brand.brandName}`,
    description: "Curated product collections from Atria.",
  };
}

export default async function CollectionsPage() {
  const collections = await getPublicCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Atria Collections",
          url: publicUrl("/collections"),
        }}
      />
      <h1 className="font-display text-4xl">Collections</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Discover products grouped by how and why you might use them.
      </p>

      {collections.length === 0 ? (
        <EmptyState
          title="Atria is still discovering."
          description="Check back soon for curated collections."
        />
      ) : (
        <div className="mt-8 grid gap-8">
          {collections.map((c) => {
            const cfg = c.config as Record<string, unknown>;
            const products = (c as unknown as { products?: Array<any> }).products ?? [];
            return (
              <section key={c.id} className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.title} className="h-40 w-40 shrink-0 rounded-2xl object-cover md:h-48 md:w-48" />
                  ) : null}
                  <div className="flex-1">
                    <h2 className="font-display text-2xl">{c.title}</h2>
                    <p className="mt-1 text-sm text-muted">{c.subtitle}</p>
                    {products.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {products.map((cp) => (
                          <ProductCard key={cp.id} product={cp} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
