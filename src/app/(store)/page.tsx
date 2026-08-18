import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const brand = getBrand();
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const enabled = new Set(sections.filter((s) => s.enabled).map((s) => s.key));
  const [hero] = await prisma.banner.findMany({
    where: { placement: "hero", enabled: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  });
  const promo = await prisma.banner.findFirst({
    where: { placement: "promo", enabled: true },
  });
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
  const [trending, best, neu, deals] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", trending: true },
      include: productCardInclude,
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", bestSeller: true },
      include: productCardInclude,
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", newArrival: true },
      include: productCardInclude,
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", compareAtPaise: { not: null } },
      include: productCardInclude,
      take: 8,
    }),
  ]);
  const approvedReviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    include: { product: { select: { name: true, slug: true } } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  function show(key: string) {
    return enabled.size === 0 || enabled.has(key);
  }

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: brand.brandName,
          url: publicUrl("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: `${publicUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {show("hero") ? (
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">India · configurable brand</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {hero?.title ?? "Objects for rooms you actually live in"}
            </h1>
            <p className="mt-4 max-w-md text-base text-muted">
              {hero?.subtitle ?? brand.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hero?.href ?? "/products"}
                className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm text-[#f6f1ea]"
              >
                Shop the catalogue
              </Link>
              <Link
                href="/category/new-arrivals"
                className="inline-flex h-12 items-center rounded-full border border-line bg-card px-6 text-sm"
              >
                New arrivals
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] bg-[#ece6dc]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero?.imageUrl ?? "/images/products/linen-overshirt.svg"}
              alt={hero?.title ?? "Featured collection"}
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
            />
          </div>
        </section>
      ) : null}

      {show("categories") ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl">Shop by room of life</h2>
            <Link href="/products" className="text-sm underline">
              All products
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-2xl border border-line bg-card p-5 hover:border-[#c4b8a8]"
              >
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {show("trending") ? (
        <ProductRail title="Trending" href="/products?sort=trending" products={trending} />
      ) : null}
      {show("bestsellers") ? (
        <ProductRail title="Best sellers" href="/products?sort=best" products={best} />
      ) : null}
      {show("new") ? (
        <ProductRail title="New arrivals" href="/products?sort=new" products={neu} />
      ) : null}
      {show("deals") ? (
        <ProductRail title="Deals" href="/products?sort=deals" products={deals} />
      ) : null}

      {show("promo") && promo ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Link href={promo.href} className="grid overflow-hidden rounded-[2rem] bg-primary text-[#f6f1ea] md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="font-display text-4xl">{promo.title}</h2>
              <p className="mt-3 text-sm opacity-80">{promo.subtitle}</p>
              <span className="mt-6 inline-block text-sm underline">Explore</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promo.imageUrl} alt={promo.title} className="h-full w-full object-cover" />
          </Link>
        </section>
      ) : null}

      {show("trust") ? (
        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Pincode-based delivery", body: "Estimates from a shipping table. No invented tracking." },
            { icon: RotateCcw, title: "Clear returns", body: "Policy pages are editable placeholders until legal copy is ready." },
            { icon: ShieldCheck, title: "Server-side prices", body: "Cart totals are recalculated on the server." },
            { icon: Headset, title: "Human support", body: brand.supportEmail },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-card p-5">
              <item.icon className="h-5 w-5" />
              <p className="mt-3 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </section>
      ) : null}

      {show("reviews") ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="font-display text-3xl">From the catalogue</h2>
          {approvedReviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Customer reviews appear here after they are approved. Seed data is labelled and not presented as campaign social proof.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {approvedReviews.map((review) => (
                <blockquote key={review.id} className="rounded-2xl border border-line bg-card p-5">
                  <p className="text-sm font-medium">{review.title}</p>
                  <p className="mt-2 text-sm text-muted">{review.content}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted">
                    {review.verifiedPurchase ? "Verified purchase" : "Unverified"} · {review.product.name}
                  </p>
                </blockquote>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {show("newsletter") ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="rounded-[2rem] bg-[#161513] px-6 py-12 text-[#f6f1ea] sm:px-12">
            <h2 className="font-display text-3xl">Notes, not noise</h2>
            <p className="mt-2 max-w-md text-sm opacity-70">
              Newsletter delivery requires an email provider. Until then this form records the request only if you connect one.
            </p>
            <form action="/api/newsletter" method="post" className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="h-12 flex-1 rounded-full px-4 text-foreground"
              />
              <button className="h-12 rounded-full bg-secondary px-6 text-sm text-[#161513]" type="submit">
                Request updates
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProductRail({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Array<{
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
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-3xl">{title}</h2>
        <Link href={href} className="text-sm underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
