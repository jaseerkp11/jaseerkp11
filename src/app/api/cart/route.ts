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
  const referer = request.headers.get("referer");
  return Response.redirect(new URL(referer || "/cart", getBrand().siteUrl), 303);
}
