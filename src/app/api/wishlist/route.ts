import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBrand } from "@/config/brand";
import { jsonError } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return Response.redirect(new URL("/login?next=/account/wishlist", getBrand().siteUrl), 303);
  }
  const form = await request.formData();
  const productId = String(form.get("productId") ?? "");
  if (!productId) return jsonError("Missing product", 400);
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  }
  const referer = request.headers.get("referer") ?? "/account/wishlist";
  return Response.redirect(new URL(referer, getBrand().siteUrl), 303);
}
