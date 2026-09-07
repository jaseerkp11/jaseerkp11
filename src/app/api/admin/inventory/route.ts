import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminInventorySchema } from "@/lib/validation";
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
  const note = String(form.get("note") ?? "");
  if (!productId) return jsonError("Provide a product", 400);
  const parsed = adminInventorySchema.safeParse({
    delta: Number(form.get("delta") ?? 0),
    reason: form.get("reason") || "ADJUSTMENT",
    note,
  });
  if (!parsed.success) return jsonError("Invalid inventory", 400, parsed.error.flatten());
  await adjustInventory({
    productId,
    delta: parsed.data.delta,
    reason: parsed.data.reason,
    note: parsed.data.note,
    actorId: session!.id,
  });
  return Response.redirect(new URL("/admin/inventory", getBrand().siteUrl), 303);
}
