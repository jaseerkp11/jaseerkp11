import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminStoreSettingsSchema } from "@/lib/validation";
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
  const parsed = adminStoreSettingsSchema.safeParse({
    gstin: form.get("gstin"),
    pan: form.get("pan"),
    businessAddress: form.get("businessAddress"),
    warehouseAddress: form.get("warehouseAddress"),
    whatsapp: form.get("whatsapp"),
    invoiceNote: form.get("invoiceNote"),
    freeShippingRupees: form.get("freeShippingRupees"),
    standardShippingRupees: form.get("standardShippingRupees"),
    expressShippingRupees: form.get("expressShippingRupees"),
  });
  if (!parsed.success) return jsonError("Invalid settings", 400, parsed.error.flatten());
  const values: StoreSettings = {
    gstin: parsed.data.gstin.trim(),
    pan: parsed.data.pan.trim(),
    businessAddress: parsed.data.businessAddress.trim(),
    warehouseAddress: parsed.data.warehouseAddress.trim(),
    whatsapp: parsed.data.whatsapp.trim(),
    invoiceNote: parsed.data.invoiceNote.trim(),
    freeShippingRupees: parsed.data.freeShippingRupees.trim(),
    standardShippingRupees: parsed.data.standardShippingRupees.trim(),
    expressShippingRupees: parsed.data.expressShippingRupees.trim(),
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
