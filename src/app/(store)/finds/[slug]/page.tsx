import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getFindBySlug } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getFindBySlug(slug);
  if (!result) return { title: "Find" };
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

export default async function FindPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getFindBySlug(slug);
  if (!result) return null;
  const { section, config, products } = result;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: section.title,
          description: (config.subtitle as string) ?? "",
          url: publicUrl(`/finds/${config.slug}`),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{section.title}</h1>
          <p className="mt-2 text-sm text-muted">{(config.subtitle as string) ?? ""}</p>
        </div>
        {(config.imageUrl as string) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.imageUrl as string} alt={section.title} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
        ) : null}
      </div>
      {products.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Curated products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-muted">No products in this find yet.</p>
      )}
    </div>
  );
}
