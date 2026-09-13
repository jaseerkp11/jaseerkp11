import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema, jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return jsonError("Sign in required", 401);
  const form = await request.formData();
  const parsed = addressSchema.safeParse({
    label: form.get("label") || "Home",
    fullName: form.get("fullName"),
    phone: form.get("phone"),
    line1: form.get("line1"),
    line2: form.get("line2") || undefined,
    city: form.get("city"),
    state: form.get("state"),
    pincode: form.get("pincode"),
    country: "IN",
  });
  if (!parsed.success) return jsonError("Invalid address", 400, parsed.error.flatten());
  await prisma.address.create({ data: { ...parsed.data, userId: user.id } });
  return Response.redirect(new URL("/account/addresses", getBrand().siteUrl), 303);
}
