import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/services/cart";
import { getBrand } from "@/config/brand";
import { jsonError } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const itemId = String(form.get("itemId") ?? "");
  const quantity = Math.max(1, Math.min(20, Number(form.get("quantity") ?? 1)));
  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return jsonError("Item not found", 404);
  const available = item.product.stock - item.product.reservedStock;
  if (quantity > available) return jsonError("Not enough stock", 400);
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return Response.redirect(new URL("/cart", getBrand().siteUrl), 303);
}
