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
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const form = await request.formData();
  const type = (form.get("_type") as string | null) ?? "page";
  if (form.get("_method") === "DELETE") {
    if (type === "banner") {
      await prisma.banner.delete({ where: { id } });
      await writeAudit({
        actorId: session!.id,
        action: "banner.delete",
        entity: "Banner",
        entityId: id,
      });
    } else {
      await prisma.cmsPage.delete({ where: { id } });
      await writeAudit({
        actorId: session!.id,
        action: "cms.delete",
        entity: "CmsPage",
        entityId: id,
      });
    }
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
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const body = await request.text();
  const params = new URLSearchParams(body);
  const type = params.get("_type") ?? "page";
  if (type === "banner") {
    await prisma.banner.delete({ where: { id } });
    await writeAudit({
      actorId: session!.id,
      action: "banner.delete",
      entity: "Banner",
      entityId: id,
    });
  } else {
    await prisma.cmsPage.delete({ where: { id } });
    await writeAudit({
      actorId: session!.id,
      action: "cms.delete",
      entity: "CmsPage",
      entityId: id,
    });
  }
  return Response.json({ ok: true });
}
