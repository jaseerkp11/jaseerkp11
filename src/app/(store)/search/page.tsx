import { searchProvider } from "@/lib/search/provider";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { brand: { contains: query } },
            { sku: { contains: query } },
          ],
        },
        include: productCardInclude,
        take: 48,
      })
    : [];
  void searchProvider;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Search</h1>
      <form className="mt-6 max-w-xl">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Search the catalogue"
          className="h-12 w-full rounded-full border border-line bg-card px-5"
        />
      </form>
      {query && products.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No matches"
            description={`Nothing matched “${query}”. Try a product name, brand, or SKU.`}
            action={{ href: "/products", label: "Browse all products" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
