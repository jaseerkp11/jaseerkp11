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
  const find = await getFindBySlug(slug);
  if (!find) return { title: "Find" };
  const brand = getBrand();
  return {
    title: find.title,
    description: find.subtitle,
    openGraph: {
      title: find.title,
      description: find.subtitle,
      images: find.imageUrl ? [find.imageUrl] : [],
    },
  };
}

export default async function FindPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const find = await getFindBySlug(slug);
  if (!find) return null;
  const cfg = find.config as Record<string, unknown>;
  const products = (find as unknown as { products?: Array<any> }).products ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: find.title,
          description: find.subtitle,
          url: publicUrl(`/finds/${cfg.slug}`),
        }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl">{find.title}</h1>
          <p className="mt-2 text-sm text-muted">{find.subtitle}</p>
        </div>
        {find.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={find.imageUrl} alt={find.title} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
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
