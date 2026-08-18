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
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  await prisma.siteSetting.upsert({
    where: { id: "announcement" },
    update: { value: String(form.get("announcement") ?? "") },
    create: { id: "announcement", value: String(form.get("announcement") ?? "") },
  });
  const id = String(form.get("pageId") ?? "");
  if (id) {
    await prisma.cmsPage.update({
      where: { id },
      data: {
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
      },
    });
  }
  await writeAudit({
    actorId: session!.id,
    action: "content.update",
    entity: "SiteSetting",
    entityId: "announcement",
  });
  return Response.redirect(new URL("/admin/content", getBrand().siteUrl), 303);
}
