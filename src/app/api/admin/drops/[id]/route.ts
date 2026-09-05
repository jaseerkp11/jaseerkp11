import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
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
  const key = `drop-${slug}`;
  const config: Record<string, unknown> = {
    slug,
    status: String(form.get("status") ?? "DRAFT"),
    productIds: form.getAll("productIds") as string[],
  };
  const startAt = String(form.get("startAt") ?? "").trim();
  const endAt = String(form.get("endAt") ?? "").trim();
  const publishedAt = String(form.get("publishedAt") ?? "").trim();
  if (startAt) config.startAt = startAt;
  if (endAt) config.endAt = endAt;
  if (publishedAt) config.publishedAt = publishedAt;

  const section = await updateSectionItem(
    id,
    {
      key,
      title: String(form.get("name") ?? "").trim(),
      enabled: String(form.get("status") ?? "DRAFT") === "LIVE",
      sortOrder: Number(form.get("sortOrder") ?? 0),
      config,
    },
    session!.id,
  );
  return Response.redirect(new URL(`/admin/drops/${id}`, getBrand().siteUrl ?? "/admin/drops"), 303);
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
