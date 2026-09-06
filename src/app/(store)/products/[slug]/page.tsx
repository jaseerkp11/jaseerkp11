import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { formatMoney } from "@/lib/money";
import { averageRating, productCardInclude } from "@/lib/catalog";
import { availableStock } from "@/lib/services/inventory";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/store/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { PincodeChecker } from "@/components/store/pincode-checker";
import { ProductGallery } from "@/components/store/product-gallery";
import { splitProductImages } from "@/lib/services/product-image-slots";
import { whyAtriaPicked, getPairsWellWith } from "@/lib/services/atria-discovery";
import { getRecommendationsForProduct } from "@/lib/services/recommendations";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product" };
  const brand = getBrand();
  const title = product.seoTitle ?? product.name;
  const description = product.seoDescription ?? product.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: publicUrl(`/products/${product.slug}`) },
    openGraph: {
      title,
      description,
      url: publicUrl(`/products/${product.slug}`),
      siteName: brand.brandName,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrand();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true } } } },
      questions: true,
    },
  });
  if (!product || product.status === "ARCHIVED") notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: "ACTIVE" },
    include: productCardInclude,
    take: 4,
  });
  const rating = averageRating(product.reviews);
  const available = availableStock(product.stock, product.reservedStock);
  const highlights = JSON.parse(product.highlights) as string[];
  const specs = JSON.parse(product.specifications) as Record<string, string>;
  const savings =
    product.compareAtPaise && product.compareAtPaise > product.sellingPaise
      ? product.compareAtPaise - product.sellingPaise
      : 0;
  const discoveryReasons = whyAtriaPicked(product);
  const pairs = await getPairsWellWith(product.id);
  const recommendations = await getRecommendationsForProduct(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          sku: product.sku,
          brand: product.brand,
          image: product.images.map((i) => publicUrl(i.url)),
          offers: {
            "@type": "Offer",
            priceCurrency: brand.currency,
            price: (product.sellingPaise / 100).toFixed(2),
            availability:
              available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: publicUrl(`/products/${product.slug}`),
          },
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${product.category.slug}`, label: product.category.name },
          { label: product.name },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery {...splitProductImages(product.images)} />
        <div>
          <p className="text-sm text-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {rating.count > 0
              ? `${rating.value} from ${rating.count} review${rating.count === 1 ? "" : "s"}`
              : "No approved reviews yet"}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-semibold">
              {formatMoney(product.sellingPaise, brand.currency, brand.currencySymbol)}
            </p>
            {product.compareAtPaise && product.compareAtPaise > product.sellingPaise ? (
              <p className="text-muted line-through">
                {formatMoney(product.compareAtPaise, brand.currency, brand.currencySymbol)}
              </p>
            ) : null}
            {savings > 0 ? <Badge tone="sale">You save {formatMoney(savings)}</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-muted">Inclusive of estimated tax at checkout. SKU {product.sku}</p>
          <p className="mt-4 text-sm leading-6">{product.shortDescription}</p>
          <form action="/api/cart" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            {product.variants.length > 0 ? (
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Options</legend>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <label key={variant.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="variantId"
                        value={variant.id}
                        defaultChecked={index === 0}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-[#f6f1ea]">
                        {variant.name}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <div>
              <label htmlFor="qty" className="mb-1 block text-sm font-medium">
                Quantity
              </label>
              <input
                id="qty"
                name="quantity"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                className="h-11 w-24 rounded-xl border border-line bg-card px-3"
              />
            </div>
            <p className="text-sm">
              {available <= 0
                ? "Currently unavailable"
                : available <= product.lowStockThreshold
                  ? `Only ${available} left`
                  : "In stock"}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="h-12 flex-1 rounded-full bg-primary text-sm text-[#f6f1ea] disabled:opacity-50"
                disabled={available <= 0}
              >
                Add to cart
              </button>
              <Link
                href="/checkout"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#161513] text-sm text-[#f6f1ea]"
              >
                Buy now
              </Link>
            </div>
          </form>
          <form action="/api/wishlist" method="post" className="mt-3">
            <input type="hidden" name="productId" value={product.id} />
            <button className="text-sm underline" type="submit">
              Save to wishlist
            </button>
          </form>
          <PincodeChecker />
          <ul className="mt-8 space-y-2 text-sm">
            {highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        </div>
      </div>
      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#3f3a34]">{product.description}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Specifications</h2>
          <dl className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
            {Object.entries(specs).map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-display text-2xl">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Reviews can be submitted from your account after a delivered order. None are fabricated for marketing.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="font-medium">{review.title}</p>
                <p className="text-xs text-muted">
                  {review.rating}/5 · {review.user?.name ?? "Customer"} ·{" "}
                  {review.verifiedPurchase ? "Verified purchase" : "Unverified"}
                </p>
                <p className="mt-2 text-sm">{review.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="mt-12">
        <h2 className="font-display text-2xl">Questions</h2>
        {product.questions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No questions yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {product.questions.map((q) => (
              <li key={q.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
                <p className="font-medium">{q.question}</p>
                {q.answer ? <p className="mt-2 text-muted">{q.answer}</p> : <p className="mt-2 text-muted">Awaiting answer</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Related</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      {discoveryReasons.length > 0 ? (
        <section className="mt-12 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">Why Atria picked this</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted">
            {discoveryReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {pairs.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Pairs well with</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {pairs.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
      {recommendations.map((group) => (
        <section key={group.type} className="mt-12">
          <h2 className="font-display text-2xl">
            {group.type === "related" && "Related products"}
            {group.type === "complementary" && "Pairs well with"}
            {group.type === "trending" && "Trending now"}
            {group.type === "featured" && "Featured"}
            {group.type === "frequently_bought_together" && "Frequently bought together"}
          </h2>
          {group.products.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {group.products.map((item) => (
                <ProductCard key={item.id} product={item as any} />
              ))}
            </div>
          ) : null}
        </section>
      ))}
      <div className="sticky bottom-0 -mx-4 mt-10 border-t border-line bg-background/95 p-3 backdrop-blur sm:hidden">
        <form action="/api/cart" method="post" className="flex gap-2">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="quantity" value="1" />
          <button className="h-12 flex-1 rounded-full bg-primary text-sm text-[#f6f1ea]" disabled={available <= 0}>
            Add · {formatMoney(product.sellingPaise)}
          </button>
        </form>
      </div>
    </div>
  );
}
