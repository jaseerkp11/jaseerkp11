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
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim();
  if (!name || !slug) return jsonError("Name and slug required", 400);
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: String(form.get("description") ?? ""),
      parentId: String(form.get("parentId") ?? "") || null,
    },
  });
  await writeAudit({
    actorId: session!.id,
    action: "category.create",
    entity: "Category",
    entityId: category.id,
  });
  return Response.redirect(new URL("/admin/categories", getBrand().siteUrl), 303);
}
