import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/services/cart";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const itemId = String(form.get("itemId") ?? "");
  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === itemId);
  if (item) await prisma.cartItem.delete({ where: { id: itemId } });
  return Response.redirect(new URL("/cart", getBrand().siteUrl), 303);
}
