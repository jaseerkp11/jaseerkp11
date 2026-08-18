import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageSuppliers)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const supplier = await prisma.supplier.create({
    data: {
      name: String(form.get("name") ?? "").trim(),
      contactPerson: String(form.get("contactPerson") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      phone: String(form.get("phone") ?? "") || null,
      notes: String(form.get("notes") ?? "") || null,
    },
  });
  await writeAudit({
    actorId: session!.id,
    action: "supplier.create",
    entity: "Supplier",
    entityId: supplier.id,
  });
  return Response.redirect(new URL("/admin/suppliers", getBrand().siteUrl), 303);
}
