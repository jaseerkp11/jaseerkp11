import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminCategorySchema } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return jsonError("Not found", 404);
  return Response.json({ category });
}

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
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const form = await request.formData();
  const _method = form.get("_method");
  if (_method === "DELETE") {
    await prisma.category.delete({ where: { id } });
    await writeAudit({
      actorId: session!.id,
      action: "category.delete",
      entity: "Category",
      entityId: id,
    });
    return Response.json({ ok: true });
  }
  const parsed = adminCategorySchema.safeParse({
    name: form.get("name"),
    slug: form.get("slug"),
    description: form.get("description"),
    parentId: form.get("parentId") || null,
    status: form.get("status"),
    sortOrder: Number(form.get("sortOrder") ?? 0),
    seoTitle: form.get("seoTitle") || null,
    seoDescription: form.get("seoDescription") || null,
  });
  if (!parsed.success) return jsonError("Invalid category", 400, parsed.error.flatten());
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? "",
      parentId: parsed.data.parentId ?? null,
      status: parsed.data.status,
      sortOrder: parsed.data.sortOrder,
      seoTitle: parsed.data.seoTitle ?? undefined,
      seoDescription: parsed.data.seoDescription ?? undefined,
    },
  });
  await writeAudit({
    actorId: session!.id,
    action: "category.update",
    entity: "Category",
    entityId: category.id,
  });
  return Response.redirect(new URL(`/admin/categories/${id}`, getBrand().siteUrl), 303);
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
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await prisma.category.delete({ where: { id } });
  await writeAudit({
    actorId: session!.id,
    action: "category.delete",
    entity: "Category",
    entityId: id,
  });
  return Response.json({ ok: true });
}
