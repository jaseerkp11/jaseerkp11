import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";

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
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await prisma.cmsPage.delete({ where: { id } });
  await writeAudit({
    actorId: session!.id,
    action: "cms.delete",
    entity: "CmsPage",
    entityId: id,
  });
  return Response.json({ ok: true });
}
