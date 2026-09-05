import { prisma } from "@/lib/prisma";
import { surpriseMe } from "@/lib/services/atria";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
    take: 200,
  });
  const recommendation = await surpriseMe();
  return (
    <div>
      <h1 className="font-display text-3xl">Recommendations</h1>
      <p className="mt-2 text-sm text-muted">Server-generated discovery recommendations using lightweight rules.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {!recommendation ? (
          <li className="text-sm text-muted">No active products.</li>
        ) : (
          <li key={recommendation.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
            <a href={`/products/${recommendation.slug}`} className="font-medium underline">
              {recommendation.name}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
