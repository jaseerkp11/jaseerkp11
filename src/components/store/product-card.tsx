import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatMoney, marginPercent } from "@/lib/money";
import { getBrand } from "@/config/brand";
import { Badge } from "@/components/ui/badge";
import { averageRating } from "@/lib/catalog";
import { availableStock } from "@/lib/services/inventory";

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  sellingPaise: number;
  compareAtPaise: number | null;
  stock: number;
  reservedStock: number;
  images: Array<{ url: string; alt: string }>;
  reviews: Array<{ rating: number }>;
  costPaise?: number;
  showCost?: boolean;
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const brand = getBrand();
  const image = product.images[0];
  const rating = averageRating(product.reviews);
  const available = availableStock(product.stock, product.reservedStock);
  const savings =
    product.compareAtPaise && product.compareAtPaise > product.sellingPaise
      ? product.compareAtPaise - product.sellingPaise
      : 0;

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-[#ece6dc]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt || product.name}
              className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-[#e4dcd2]" />
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {savings > 0 ? (
              <Badge tone="sale">Save {formatMoney(savings, brand.currency, brand.currencySymbol)}</Badge>
            ) : null}
            {available <= 0 ? <Badge tone="muted">Out of stock</Badge> : null}
            {available > 0 && available <= 5 ? <Badge tone="ink">Low stock</Badge> : null}
          </div>
          <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground">
            <Heart className="h-4 w-4" aria-hidden />
            <span className="sr-only">Wishlist</span>
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-[15px] font-medium leading-snug">{product.name}</h3>
          {rating.count > 0 ? (
            <p className="text-xs text-muted">
              {rating.value} · {rating.count} review{rating.count === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="text-xs text-muted">No reviews yet</p>
          )}
          <p className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-semibold">
              {formatMoney(product.sellingPaise, brand.currency, brand.currencySymbol)}
            </span>
            {product.compareAtPaise && product.compareAtPaise > product.sellingPaise ? (
              <span className="text-muted line-through">
                {formatMoney(product.compareAtPaise, brand.currency, brand.currencySymbol)}
              </span>
            ) : null}
          </p>
          {product.showCost && product.costPaise != null ? (
            <p className="text-xs text-muted">
              Margin {marginPercent(product.sellingPaise, product.costPaise)}%
            </p>
          ) : null}
        </div>
      </Link>
      <form action={`/api/cart`} method="post" className="mt-3">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="quantity" value="1" />
        <button
          type="submit"
          disabled={available <= 0}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-card text-sm hover:bg-[#f3ece3] disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          {available <= 0 ? "Unavailable" : "Add to cart"}
        </button>
      </form>
    </article>
  );
}
