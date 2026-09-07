import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminSectionSchema } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";
import { getSectionById, updateSectionItem, deleteSectionItem, parseSectionConfig } from "@/lib/services/atria-banners";

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
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const section = await getSectionById(id);
  if (!section) return jsonError("Not found", 404);
  return Response.json({ section, config: parseSectionConfig(section) });
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
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const form = await request.formData();
  const existing = await getSectionById(id);
  const cfg = existing ? parseSectionConfig(existing) : {};
  const slug = String(form.get("slug") ?? (cfg.slug as string) ?? "").trim();
  const parsed = adminSectionSchema.safeParse({
    name: form.get("name"),
    slug,
    shortDescription: form.get("shortDescription") || "",
    description: form.get("description") || "",
    coverImage: form.get("coverImage") || null,
    status: form.get("status") || "DRAFT",
    productIds: form.getAll("productIds"),
    startAt: form.get("startAt") || null,
    endAt: form.get("endAt") || null,
    publishedAt: form.get("publishedAt") || null,
    sortOrder: Number(form.get("sortOrder") ?? 0),
  });
  if (!parsed.success) return jsonError("Invalid find", 400, parsed.error.flatten());
  const key = `find-${slug}`;
  const section = await updateSectionItem(
    id,
    {
      key,
      title: parsed.data.name,
      enabled: parsed.data.status === "LIVE",
      sortOrder: parsed.data.sortOrder,
      config: {
        slug: parsed.data.slug,
        status: parsed.data.status,
        productIds: parsed.data.productIds,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        coverImage: parsed.data.coverImage,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt,
        publishedAt: parsed.data.publishedAt,
      },
    },
    session!.id,
  );
  await writeAudit({
    actorId: session!.id,
    action: "find.update",
    entity: "BannerSection",
    entityId: id,
  });
  return Response.redirect(new URL(`/admin/finds/${id}`, getBrand().siteUrl ?? "/admin/finds"), 303);
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
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await deleteSectionItem(id, session!.id);
  return Response.json({ ok: true });
}
