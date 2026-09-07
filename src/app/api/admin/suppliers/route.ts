import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminSupplierSchema } from "@/lib/validation";
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
  const parsed = adminSupplierSchema.safeParse({
    name: form.get("name"),
    contactPerson: form.get("contactPerson") || null,
    email: form.get("email") || null,
    phone: form.get("phone") || null,
    address: form.get("address") || null,
    website: form.get("website") || null,
    notes: form.get("notes") || null,
    status: form.get("status"),
  });
  if (!parsed.success) return jsonError("Invalid supplier", 400, parsed.error.flatten());
  const supplier = await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      contactPerson: parsed.data.contactPerson ?? undefined,
      email: parsed.data.email ?? undefined,
      phone: parsed.data.phone ?? undefined,
      address: parsed.data.address ?? undefined,
      website: parsed.data.website ?? undefined,
      notes: parsed.data.notes ?? undefined,
      status: parsed.data.status,
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
