import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/services/cart";
import { couponCodeSchema, jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = couponCodeSchema.safeParse(form.get("code"));
  if (!parsed.success) {
    return Response.redirect(new URL("/cart?couponError=Invalid+coupon+code", getBrand().siteUrl), 303);
  }
  const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data } });
  if (!coupon || !coupon.active) {
    return Response.redirect(new URL("/cart?couponError=Coupon+not+found+or+inactive", getBrand().siteUrl), 303);
  }
  const cart = await getOrCreateCart();
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: parsed.data } });
  return Response.redirect(new URL("/cart", getBrand().siteUrl), 303);
}
