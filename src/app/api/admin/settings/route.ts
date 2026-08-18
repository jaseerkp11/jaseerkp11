import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { redirectTo } from "@/lib/http";
import { saveStoreSettings, type StoreSettings } from "@/lib/services/store-settings";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageSettings)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const values: StoreSettings = {
    gstin: String(form.get("gstin") ?? "").trim(),
    pan: String(form.get("pan") ?? "").trim(),
    businessAddress: String(form.get("businessAddress") ?? "").trim(),
    warehouseAddress: String(form.get("warehouseAddress") ?? "").trim(),
    whatsapp: String(form.get("whatsapp") ?? "").trim(),
    invoiceNote: String(form.get("invoiceNote") ?? "").trim(),
    freeShippingRupees: String(form.get("freeShippingRupees") ?? "0").trim(),
    standardShippingRupees: String(form.get("standardShippingRupees") ?? "0").trim(),
    expressShippingRupees: String(form.get("expressShippingRupees") ?? "0").trim(),
  };
  await saveStoreSettings(values);
  await writeAudit({
    actorId: session!.id,
    action: "settings.update",
    entity: "SiteSetting",
    entityId: "store",
  });
  return redirectTo(request, "/admin/settings");
}
