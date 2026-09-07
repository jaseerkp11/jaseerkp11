import { NextRequest } from "next/server";
import { addToCart } from "@/lib/services/cart";
import { cartItemSchema, jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { trackEvent } from "@/lib/analytics/track";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = cartItemSchema.safeParse({
    productId: form.get("productId"),
    variantId: form.get("variantId") || undefined,
    quantity: Number(form.get("quantity") ?? 1),
  });
  if (!parsed.success) return jsonError("Invalid cart item", 400, parsed.error.flatten());
  try {
    await addToCart(parsed.data);
    await trackEvent({ name: "add_to_cart", productId: parsed.data.productId });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not add to cart", 400);
  }
  const buyNow = form.get("buyNow");
  if (buyNow === "1") {
    return Response.redirect(new URL("/checkout", getBrand().siteUrl), 303);
  }
  const referer = request.headers.get("referer");
  const origin = new URL(getBrand().siteUrl).origin;
  const safe =
    referer && (referer.startsWith(origin) || referer.startsWith("/")) ? referer : "/cart";
  return Response.redirect(new URL(safe, getBrand().siteUrl), 303);
}
