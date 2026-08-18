import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/services/cart";
import { couponCodeSchema, jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = couponCodeSchema.safeParse(form.get("code"));
  if (!parsed.success) return jsonError("Invalid coupon", 400);
  const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data } });
  if (!coupon || !coupon.active) return jsonError("Coupon not found", 404);
  const cart = await getOrCreateCart();
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: parsed.data } });
  return Response.redirect(new URL("/cart", getBrand().siteUrl), 303);
}
