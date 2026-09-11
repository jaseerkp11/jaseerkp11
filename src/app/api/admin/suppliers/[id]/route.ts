import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageSuppliers)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const form = await request.formData();
  if (form.get("_method") === "DELETE") {
    await prisma.supplier.delete({ where: { id } });
    await writeAudit({
      actorId: session!.id,
      action: "supplier.delete",
      entity: "Supplier",
      entityId: id,
    });
    return Response.json({ ok: true });
  }
  return jsonError("Invalid method", 405);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageSuppliers)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await prisma.supplier.delete({ where: { id } });
  await writeAudit({
    actorId: session!.id,
    action: "supplier.delete",
    entity: "Supplier",
    entityId: id,
  });
  return Response.json({ ok: true });
}
