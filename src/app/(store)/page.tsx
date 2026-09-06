import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";
import { AskAtria } from "@/components/store/ask-atria";
import { getPublicDrops, getPublicFinds, parseSectionConfig } from "@/lib/services/atria-banners";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const brand = getBrand();
  const [hero, promo] = await Promise.all([
    prisma.banner.findFirst({ where: { placement: "hero", enabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.banner.findFirst({ where: { placement: "promo", enabled: true } }),
  ]);
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });
  const [trending, best, neu, deals] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE", trending: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", bestSeller: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", newArrival: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", compareAtPaise: { not: null } }, include: productCardInclude, take: 8 }),
  ]);
  const approvedReviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    include: { product: { select: { name: true, slug: true } } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
  const drops = await getPublicDrops();
  const finds = await getPublicFinds();
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } });
  const enabled = new Set(sections.filter((s) => s.enabled).map((s) => s.key));

  const liveDrop = drops.find((d) => (parseSectionConfig(d).status as string) === "LIVE");
  const upcomingDrop = drops.find((d) => (parseSectionConfig(d).status as string) === "SCHEDULED");

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

      {hero ? (
        <section className="relative overflow-hidden bg-[#161513] text-[#f6f1ea]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f3d34]/40 to-transparent" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.25em] text-[#c4a574]">India · configurable brand</p>
              <h1 className="mt-6 font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                {hero.title ?? "Objects for rooms you actually live in"}
              </h1>
              <p className="mt-6 max-w-lg text-base text-[#b7b0a6]">
                {hero.subtitle ?? brand.tagline}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={hero.href ?? "/products"}
                  className="inline-flex h-12 items-center rounded-full bg-[#c4a574] px-8 text-sm font-medium text-[#161513] transition hover:bg-[#b49a6a]"
                >
                  Shop the catalogue
                </Link>
                <Link
                  href="/category/new-arrivals"
                  className="inline-flex h-12 items-center rounded-full border border-white/20 bg-white/5 px-8 text-sm backdrop-blur transition hover:bg-white/10"
                >
                  New arrivals
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-[#c4a574]/20 to-transparent blur-2xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.imageUrl ?? "/images/products/linen-overshirt.svg"}
                alt={hero.title ?? "Featured collection"}
                className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-6 border-b border-line py-4 text-sm">
          <Link href="/drops" className="font-medium text-foreground hover:text-primary">Drops</Link>
          <Link href="/finds" className="font-medium text-foreground hover:text-primary">Finds</Link>
          <Link href="/collections" className="font-medium text-foreground hover:text-primary">Collections</Link>
          <Link href="/products" className="font-medium text-foreground hover:text-primary">All products</Link>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <AskAtria />
      </section>

      {(liveDrop || upcomingDrop) && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-line bg-card overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  liveDrop ? "bg-[#2f6b4f] text-white" : "bg-[#b4553a] text-white"
                }`}>
                  {liveDrop ? "Live now" : "Coming soon"}
                </span>
                <h2 className="mt-4 font-display text-3xl">{liveDrop?.title ?? upcomingDrop?.title}</h2>
                <p className="mt-3 text-sm text-muted">
                  {liveDrop ? (parseSectionConfig(liveDrop).subtitle as string) ?? "" : (parseSectionConfig(upcomingDrop!).subtitle as string) ?? ""}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/drops/${(parseSectionConfig(liveDrop ?? upcomingDrop!).slug as string) ?? (liveDrop ?? upcomingDrop)!.id}`}
                    className="inline-flex h-12 items-center rounded-full bg-primary px-8 text-sm text-[#f6f1ea] transition hover:bg-[#16302a]"
                  >
                    {liveDrop ? "Shop the drop" : "Get notified"}
                  </Link>
                  <Link href="/drops" className="inline-flex h-12 items-center rounded-full border border-line px-8 text-sm hover:bg-[#f3ece3]">
                    View all drops
                  </Link>
                </div>
              </div>
              {(parseSectionConfig(liveDrop ?? upcomingDrop!).imageUrl as string) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={parseSectionConfig(liveDrop ?? upcomingDrop!).imageUrl as string}
                  alt={liveDrop?.title ?? upcomingDrop!.title}
                  className="aspect-[4/3] w-full object-cover lg:aspect-auto"
                />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {finds.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl">Atria Finds</h2>
              <p className="mt-2 text-sm text-muted">Curated discoveries for specific moments and needs.</p>
            </div>
            <Link href="/finds" className="text-sm underline">View all</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {finds.slice(0, 3).map((f) => {
              const cfg = parseSectionConfig(f);
              return (
                <Link
                  key={f.id}
                  href={`/finds/${(cfg.slug as string) ?? f.id}`}
                  className="group rounded-[2rem] border border-line bg-card overflow-hidden transition hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[#ece6dc]">
                    {(cfg.imageUrl as string) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cfg.imageUrl as string} alt={f.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted">{(cfg.subtitle as string) ?? ""}</p>
                    <p className="mt-4 text-xs text-muted">{(cfg.productIds as string[])?.length ?? 0} products</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {show("categories") ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl">Shop by room of life</h2>
              <p className="mt-2 text-sm text-muted">Thoughtful goods for every part of your home.</p>
            </div>
            <Link href="/products" className="text-sm underline">
              All products
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group rounded-[1.5rem] border border-line bg-card p-6 transition hover:border-[#c4b8a8] hover:shadow-sm"
              >
                <p className="font-display text-lg">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-[#f3ece3]/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          {show("trending") && trending.length > 0 ? (
            <ProductRail title="Trending" href="/products?sort=trending" products={trending} />
          ) : null}
          {show("bestsellers") && best.length > 0 ? (
            <ProductRail title="Best sellers" href="/products?sort=best" products={best} />
          ) : null}
          {show("new") && neu.length > 0 ? (
            <ProductRail title="New arrivals" href="/products?sort=new" products={neu} />
          ) : null}
          {show("deals") && deals.length > 0 ? (
            <ProductRail title="Deals" href="/products?sort=deals" products={deals} />
          ) : null}
        </div>
      </section>

      {show("promo") && promo ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Link href={promo.href} className="group grid overflow-hidden rounded-[2rem] bg-[#161513] text-[#f6f1ea] md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="font-display text-3xl sm:text-4xl">{promo.title}</h2>
              <p className="mt-3 text-sm text-[#b7b0a6]">{promo.subtitle}</p>
              <span className="mt-6 inline-flex h-11 items-center rounded-full bg-[#c4a574] px-6 text-sm font-medium text-[#161513] transition group-hover:bg-[#b49a6a]">
                Explore
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promo.imageUrl} alt={promo.title} className="h-full w-full object-cover opacity-80" />
          </Link>
        </section>
      ) : null}

      {show("trust") ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Pincode-based delivery", body: "Estimates from a shipping table. No invented tracking." },
              { icon: RotateCcw, title: "Clear returns", body: "Policy pages are editable placeholders until legal copy is ready." },
              { icon: ShieldCheck, title: "Server-side prices", body: "Cart totals are recalculated on the server." },
              { icon: Headset, title: "Human support", body: brand.supportEmail },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-card p-6 transition hover:shadow-sm">
                <item.icon className="h-5 w-5 text-[#c4a574]" />
                <p className="mt-4 font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {show("reviews") ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-3xl">From the catalogue</h2>
          {approvedReviews.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Customer reviews appear here after they are approved. Seed data is labelled and not presented as campaign social proof.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {approvedReviews.map((review) => (
                <blockquote key={review.id} className="rounded-2xl border border-line bg-card p-6 transition hover:shadow-sm">
                  <p className="text-sm font-medium">{review.title}</p>
                  <p className="mt-3 text-sm text-muted">{review.content}</p>
                  <p className="mt-4 text-xs uppercase tracking-wide text-muted">
                    {review.verifiedPurchase ? "Verified purchase" : "Unverified"} · {review.product.name}
                  </p>
                </blockquote>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {show("newsletter") ? (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="rounded-[2rem] bg-[#161513] px-8 py-16 text-[#f6f1ea] sm:px-12">
            <h2 className="font-display text-3xl">Notes, not noise</h2>
            <p className="mt-4 max-w-md text-sm text-[#b7b0a6]">
              Newsletter delivery requires an email provider. Until then this form records the request only if you connect one.
            </p>
            <form action="/api/newsletter" method="post" className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="h-12 flex-1 rounded-full bg-white/5 px-5 text-sm text-[#f6f1ea] placeholder:text-[#b7b0a6] backdrop-blur"
              />
              <button className="h-12 rounded-full bg-[#c4a574] px-8 text-sm font-medium text-[#161513] transition hover:bg-[#b49a6a]" type="submit">
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
    <section className="py-12">
      <div className="mb-8 flex items-end justify-between">
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
