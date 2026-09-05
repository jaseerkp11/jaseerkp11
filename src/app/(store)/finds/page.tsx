import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { JsonLd } from "@/components/seo/json-ld";
import { getBrand, publicUrl } from "@/config/brand";
import { getPublicFinds, parseSectionConfig } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const brand = getBrand();
  return {
    title: `Finds · ${brand.brandName}`,
    description: "Curated permanent discoveries from Atria.",
  };
}

export default async function FindsPage() {
  const finds = await getPublicFinds();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Atria Finds",
          url: publicUrl("/finds"),
        }}
      />
      <h1 className="font-display text-4xl">Finds</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Permanent discoveries. Curated products for specific moments and needs.
      </p>

      {finds.length === 0 ? (
        <EmptyState
          title="Atria is still discovering."
          description="Check back soon for curated finds."
        />
      ) : (
        <div className="mt-8 grid gap-8">
          {finds.map((f) => {
            const cfg = parseSectionConfig(f);
            const products = (f as unknown as { products?: Array<any> }).products ?? [];
            return (
              <section key={f.id} className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  {(cfg.imageUrl as string) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cfg.imageUrl as string} alt={f.title} className="h-40 w-40 shrink-0 rounded-2xl object-cover md:h-48 md:w-48" />
                  ) : null}
                  <div className="flex-1">
                    <h2 className="font-display text-2xl">{f.title}</h2>
                    <p className="mt-1 text-sm text-muted">{(cfg.subtitle as string) ?? ""}</p>
                    {products.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {products.map((fp) => (
                          <ProductCard key={fp.id} product={fp} />
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
