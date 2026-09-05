import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  const userId = session?.id ?? null;
  const body = await request.json().catch(() => ({ query: "" }));
  const query = String(body.query ?? "").trim();
  if (!query) return Response.json({ answer: "Ask me anything about products, drops, or finds." });

  const keywords = query.toLowerCase().split(" ").filter(Boolean);
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: keywords.map((w) => ({
        OR: [
          { name: { contains: w, mode: "insensitive" } },
          { description: { contains: w, mode: "insensitive" } },
          { sku: { contains: w, mode: "insensitive" } },
        ],
      })),
    },
    take: 6,
    orderBy: { updatedAt: "desc" },
  });

  const drops = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "drop-" }, enabled: true },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  const answer = products.length > 0
    ? `I found ${products.length} matching product(s): ${products.map((p) => p.name).join(", ")}.`
    : drops.length > 0
      ? `I couldn't match products, but you might like our ${drops.map((d) => d.title).join(" and ")}.`
      : "I don't have a strong match yet, but I can keep learning from your clicks.";

  return Response.json({ answer, products: products.map((p) => ({ id: p.id, name: p.name, slug: p.slug })), userId });
}
