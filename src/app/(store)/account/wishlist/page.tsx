import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { productCardInclude } from "@/lib/catalog";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/wishlist");
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: productCardInclude } },
  });
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Wishlist is empty" description="Save products from a product page while signed in." action={{ href: "/products", label: "Browse" }} />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}
