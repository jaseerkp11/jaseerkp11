import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminCouponSchema } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";
import { rupeesToPaise } from "@/lib/money";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const parsed = adminCouponSchema.safeParse({
    code: form.get("code"),
    type: form.get("type"),
    value: form.get("type") === "FIXED" ? rupeesToPaise(Number(form.get("value") ?? 0)) : Number(form.get("value") ?? 0),
    minOrderPaise: rupeesToPaise(Number(form.get("minOrder") ?? 0)),
    maxDiscountPaise: form.get("maxDiscount") ? rupeesToPaise(Number(form.get("maxDiscount") ?? 0)) : null,
    startsAt: form.get("startsAt") || null,
    expiresAt: form.get("expiresAt") || null,
    usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
    perCustomerLimit: Number(form.get("perCustomerLimit") ?? 1),
    productIds: form.get("productIds") || "[]",
    categoryIds: form.get("categoryIds") || "[]",
    customerIds: form.get("customerIds") || "[]",
    active: form.get("active") !== "false",
  });
  if (!parsed.success) return jsonError("Invalid coupon", 400, parsed.error.flatten());
  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code.trim().toUpperCase(),
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderPaise: parsed.data.minOrderPaise,
      maxDiscountPaise: parsed.data.maxDiscountPaise ?? undefined,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      usageLimit: parsed.data.usageLimit ?? undefined,
      perCustomerLimit: parsed.data.perCustomerLimit,
      productIds: parsed.data.productIds,
      categoryIds: parsed.data.categoryIds,
      customerIds: parsed.data.customerIds,
      active: parsed.data.active,
    },
  });
  await writeAudit({
    actorId: session!.id,
    action: "coupon.create",
    entity: "Coupon",
    entityId: coupon.id,
  });
  return Response.redirect(new URL("/admin/coupons", getBrand().siteUrl), 303);
}
