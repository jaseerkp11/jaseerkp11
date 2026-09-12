import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrand, publicUrl } from "@/config/brand";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";
import { AskTherareify } from "@/components/store/ask-therareify";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { getPublicDrops, getPublicFinds, parseSectionConfig } from "@/lib/services/atria-banners";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { HeroAnimations } from "@/components/store/hero-animations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const brand = getBrand();
  const hero = await prisma.banner.findFirst({ where: { placement: "hero", enabled: true }, orderBy: { sortOrder: "asc" } });
  const promo = await prisma.banner.findFirst({ where: { placement: "promo", enabled: true } });
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  const homepageCategories = [
    { name: "Make Home Easier", slug: "make-home-easier", description: "Clever storage, organization & everyday home helpers" },
    { name: "Kitchen, Smarter", slug: "kitchen-smarter", description: "Little things that make cooking and cleaning easier" },
    { name: "Style & Accessories", slug: "style-accessories", description: "Easy ways to add something special to your everyday look" },
    { name: "Beauty & Self-Care", slug: "beauty-self-care", description: "Simple tools and accessories for your daily routine" },
    { name: "Kids & Family", slug: "kids-family", description: "Clever finds that make everyday family life easier" },
    { name: "Gifts They'll Love", slug: "gifts", description: "Interesting little finds worth giving" },
    { name: "Clever Finds", slug: "clever-finds", description: "Products you didn't know you needed" },
    { name: "New & Trending", slug: "new-trending", description: "Fresh finds we're currently loving" },
  ];
  const [trending, best, neu, deals] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE", trending: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", bestSeller: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", newArrival: true }, include: productCardInclude, take: 8 }),
    prisma.product.findMany({ where: { status: "ACTIVE", compareAtPaise: { not: null } }, include: productCardInclude, take: 8 }),
  ]);
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

      {show("hero") && hero ? (
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center animate-zoom-slow"
            style={{ backgroundImage: "url('/images/hero-bg.png')" }}
          />
          <div className="absolute inset-0 bg-[#161513]/60" />
          <HeroAnimations>
            <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
              <div>
              <h1 className="font-display text-4xl leading-[1.15] sm:text-5xl lg:text-6xl text-[#f6f1ea] animate-fade-in-up" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                Things you&apos;ll be glad you discovered.
              </h1>
              <p className="mt-6 max-w-lg text-base text-[#b7b0a6] animate-fade-in-up animation-delay-100">
                Useful, beautiful and unexpectedly clever finds for everyday life.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up animation-delay-200">
                <Link
                  href="/products"
                  className="group relative inline-flex h-12 items-center rounded-full bg-[#c4a574] px-8 text-sm font-medium text-[#161513] transition-all duration-300 hover:bg-[#b49a6a] hover:shadow-[0_8px_30px_rgba(196,165,116,0.35)] hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Shop the finds</span>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
                <Link
                  href="/category/new-arrivals"
                  className="group relative inline-flex h-12 items-center rounded-full border border-[#f6f1ea33] bg-transparent px-8 text-sm text-[#f6f1ea] transition-all duration-300 hover:bg-[#f6f1ea15] hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Discover something new</span>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </div>
              </div>
              <div className="animate-fade-in-up animation-delay-300">
                <HeroCarousel
                  slides={[
                    {
                      id: hero.id,
                      name: hero.title,
                      slug: hero.href.replace("/products/", "").replace("/", ""),
                      sellingPaise: 0,
                      compareAtPaise: null,
                      images: hero.imageUrl ? [{ url: hero.imageUrl, alt: hero.title }] : [],
                    },
                    ...(trending.slice(0, 3).map((p) => ({
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      sellingPaise: p.sellingPaise,
                      compareAtPaise: p.compareAtPaise,
                      images: p.images,
                    })) ?? []),
                  ]}
                />
              </div>
            </div>
          </HeroAnimations>
        </section>
      ) : null}

      {show("categories") ? (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
               <h2 className="font-display text-3xl text-[#161513]">Shop by what you need</h2>
               <p className="mt-2 text-sm text-[#5c564e]">Useful things, beautiful finds, and clever little discoveries for everyday life.</p>
            </div>
            <Link href="/products" className="text-sm underline">
              All products
            </Link>
          </div>
           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
             {homepageCategories.map((c) => (
               <Link
                 key={c.slug}
                 href={`/category/${c.slug}`}
                 className="group rounded-[1.25rem] border border-[#e3ddd4] bg-white p-6 text-center transition hover:border-[#c4b8a8] hover:shadow-md"
               >
                 <p className="font-display text-lg text-[#161513] truncate">{c.name}</p>
                 <p className="mt-1 line-clamp-2 text-xs text-[#5c564e]">{c.description}</p>
               </Link>
             ))}
           </div>
        </section>
      ) : null}

      <section className="bg-[#efe8de]/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <section className="mb-6">
            <AskTherareify />
          </section>

          {(liveDrop || upcomingDrop) && (
            <section className="mb-16">
              <div className="rounded-[2rem] border border-[#e3ddd4] bg-white overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-2">
                  <div className="p-8 sm:p-12">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      liveDrop ? "bg-[#1f3d34] text-white" : "bg-[#c4a574] text-white"
                    }`}>
                      {liveDrop ? "Live now" : "Coming soon"}
                    </span>
                    <h2 className="mt-4 font-display text-3xl text-[#161513]">{liveDrop?.title ?? upcomingDrop?.title}</h2>
                    <p className="mt-3 text-sm text-[#5c564e]">
                      {liveDrop ? (parseSectionConfig(liveDrop).subtitle as string) ?? "" : (parseSectionConfig(upcomingDrop!).subtitle as string) ?? ""}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/drops/${(parseSectionConfig(liveDrop ?? upcomingDrop!).slug as string) ?? (liveDrop ?? upcomingDrop)!.id}`}
                        className="inline-flex h-12 items-center rounded-full bg-[#1f3d34] px-8 text-sm text-[#f6f1ea] transition hover:bg-[#16302a]"
                      >
                        {liveDrop ? "Shop the drop" : "Get notified"}
                      </Link>
                      <Link href="/drops" className="inline-flex h-12 items-center rounded-full border border-[#d5cfc6] px-8 text-sm transition hover:bg-[#f3ece3]">
                        View all drops
                      </Link>
                    </div>
                  </div>
                  {(parseSectionConfig(liveDrop ?? upcomingDrop!).imageUrl as string) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={parseSectionConfig(liveDrop ?? upcomingDrop!).imageUrl as string}
                      alt={liveDrop?.title ?? upcomingDrop!.title}
                      className="aspect-[16/10] w-full object-cover lg:aspect-auto"
                    />
                  ) : null}
                </div>
              </div>
            </section>
          )}

          {finds.length > 0 && (
            <section className="mb-16">
              <div className="flex items-end justify-between">
                <div>
                   <h2 className="font-display text-3xl text-[#161513]">You Didn't Know You Needed These</h2>
                  <p className="mt-2 text-sm text-[#5c564e]">Curated discoveries for specific moments and needs.</p>
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
                      className="group rounded-[1.5rem] border border-[#e3ddd4] bg-white overflow-hidden transition hover:shadow-lg"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-[#efe8de]">
                        {(cfg.imageUrl as string) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cfg.imageUrl as string} alt={f.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : null}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl text-[#161513]">{f.title}</h3>
                        <p className="mt-2 text-sm text-[#5c564e]">{(cfg.subtitle as string) ?? ""}</p>
                        <p className="mt-4 text-xs text-[#8a7e6b]">{(cfg.productIds as string[])?.length ?? 0} products</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {show("trending") && trending.length > 0 ? (
            <section className="mb-16">
              <div className="flex items-end justify-between">
                 <h2 className="font-display text-3xl text-[#161513]">New Discoveries</h2>
                <Link href="/products?sort=trending" className="text-sm underline">View all</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {trending.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {show("bestsellers") && best.length > 0 ? (
            <section className="mb-16">
              <div className="flex items-end justify-between">
                 <h2 className="font-display text-3xl text-[#161513]">Popular Finds</h2>
                <Link href="/products?sort=best" className="text-sm underline">View all</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {best.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {show("new") && neu.length > 0 ? (
            <section className="mb-16">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-3xl text-[#161513]">New arrivals</h2>
                <Link href="/products?sort=new" className="text-sm underline">View all</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {neu.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {show("deals") && deals.length > 0 ? (
            <section className="mb-16">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-3xl text-[#161513]">Deals</h2>
                <Link href="/products?sort=deals" className="text-sm underline">View all</Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {deals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      {show("promo") && promo ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Link href={promo.href} className="group grid overflow-hidden rounded-[2rem] bg-[#1f3d34] text-[#f6f1ea] md:grid-cols-2">
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

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/products?sort=new" className="group rounded-[2rem] border border-[#e3ddd4] bg-white p-8 transition hover:shadow-md">
            <h3 className="font-display text-2xl text-[#161513]">New arrivals</h3>
            <p className="mt-2 text-sm text-[#5c564e]">Fresh additions to the catalogue this week.</p>
            <span className="mt-4 inline-flex h-10 items-center rounded-full bg-[#1f3d34] px-5 text-sm text-[#f6f1ea] transition group-hover:bg-[#16302a]">
              Shop new
            </span>
          </Link>
          <Link href="/products?sort=best" className="group rounded-[2rem] border border-[#e3ddd4] bg-white p-8 transition hover:shadow-md">
            <h3 className="font-display text-2xl text-[#161513]">Popular Finds</h3>
            <p className="mt-2 text-sm text-[#5c564e]">A curated selection worth a second look.</p>
            <span className="mt-4 inline-flex h-10 items-center rounded-full bg-[#c4a574] px-5 text-sm text-[#161513] transition group-hover:bg-[#b49a6a]">
              Shop best sellers
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/drops" className="group block rounded-[2rem] border border-[#e3ddd4] bg-white overflow-hidden transition hover:shadow-md">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <span className="inline-flex rounded-full bg-[#1f3d34] px-3 py-1 text-xs font-medium text-white">Limited drops</span>
                <h3 className="mt-4 font-display text-2xl text-[#161513]">TheRareify Drops</h3>
              <p className="mt-2 text-sm text-[#5c564e]">Curated temporary collections with limited availability.</p>
              <span className="mt-4 inline-flex h-10 items-center rounded-full border border-[#d5cfc6] px-5 text-sm transition group-hover:bg-[#f3ece3]">
                Explore drops
              </span>
            </div>
            <div className="bg-[#efe8de] p-8 flex items-center justify-center">
              <p className="font-display text-xl text-[#8a7e6b]">Limited time only</p>
            </div>
          </div>
        </Link>
      </section>

      {show("trust") ? (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Pincode-based delivery", body: "Estimates from a shipping table. No invented tracking." },
              { icon: RotateCcw, title: "Clear returns", body: "Policy pages are editable placeholders until legal copy is ready." },
              { icon: ShieldCheck, title: "Server-side prices", body: "Cart totals are recalculated on the server." },
              { icon: Headset, title: "Human support", body: brand.supportEmail },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#e3ddd4] bg-white p-6 transition hover:shadow-sm">
                <item.icon className="h-5 w-5 text-[#c4a574]" />
                <p className="mt-4 font-medium text-[#161513]">{item.title}</p>
                <p className="mt-1 text-sm text-[#5c564e]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {show("newsletter") ? (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="rounded-[2rem] bg-[#1f3d34] px-8 py-16 text-[#f6f1ea] sm:px-12">
            <h2 className="font-display text-3xl">Notes, not noise</h2>
            <p className="mt-4 max-w-md text-sm text-[#b7b0a6]">
              Newsletter delivery requires an email provider. Until then this form records the request only if you connect one.
            </p>
            <NewsletterForm />
          </div>
        </section>
      ) : null}
    </div>
  );
}
