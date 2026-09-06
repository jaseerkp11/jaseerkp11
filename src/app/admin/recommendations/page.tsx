import { prisma } from "@/lib/prisma";
import { getPersonalizedRecommendations, getRecommendationsForProduct } from "@/lib/services/recommendations";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
    take: 50,
  });

  let recommendations;
  if (productId) {
    recommendations = await getRecommendationsForProduct(productId);
  } else {
    recommendations = await getPersonalizedRecommendations();
  }

  const labels: Record<string, string> = {
    related: "Related products",
    complementary: "Pairs well with",
    trending: "Trending now",
    featured: "Featured",
    frequently_bought_together: "Frequently bought together",
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Recommendations</h1>
      <p className="mt-1 text-sm text-muted">Product-level recommendations powered by catalogue signals.</p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" method="get">
        <select name="productId" className="h-11 rounded-xl border border-line bg-card px-3 text-sm" defaultValue={productId ?? ""}>
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-full bg-primary px-5 text-sm text-[#f6f1ea]">Show recommendations</button>
      </form>

      <div className="mt-8 grid gap-8">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted">No recommendations available.</p>
        ) : (
          recommendations.map((group) => (
            <section key={group.type}>
              <h2 className="font-medium">{labels[group.type] ?? group.type}</h2>
              {group.products.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No products found.</p>
              ) : (
                <ul className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {group.products.map((p) => (
                    <li key={p.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
                      <p className="font-medium">{p.name}</p>
                      <p className="mt-1 text-xs text-muted">{p.category?.name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
