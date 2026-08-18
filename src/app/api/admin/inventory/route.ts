import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adjustInventory } from "@/lib/services/inventory";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const productId = String(form.get("productId") ?? "");
  const delta = Number(form.get("delta") ?? 0);
  const note = String(form.get("note") ?? "");
  if (!productId || !Number.isInteger(delta) || delta === 0) {
    return jsonError("Provide a product and a non-zero integer delta", 400);
  }
  await adjustInventory({
    productId,
    delta,
    reason: "ADJUSTMENT",
    note,
    actorId: session!.id,
  });
  return Response.redirect(new URL("/admin/inventory", getBrand().siteUrl), 303);
}
