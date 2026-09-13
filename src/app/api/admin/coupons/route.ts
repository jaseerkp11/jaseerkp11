import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
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
  const coupon = await prisma.coupon.create({
    data: {
      code: String(form.get("code") ?? "").trim().toUpperCase(),
      type: form.get("type") === "FIXED" ? "FIXED" : "PERCENTAGE",
      value: form.get("type") === "FIXED" ? rupeesToPaise(Number(form.get("value") ?? 0)) : Number(form.get("value") ?? 0),
      minOrderPaise: rupeesToPaise(Number(form.get("minOrder") ?? 0)),
      usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
      active: true,
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
