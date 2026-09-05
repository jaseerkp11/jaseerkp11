import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";
import { getBannerById, updateBannerItem, deleteBannerItem, parseBannerConfig } from "@/lib/services/atria-banners";

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
  const banner = await getBannerById(id);
  if (!banner) return jsonError("Not found", 404);
  return Response.json({ banner, config: parseBannerConfig(banner) });
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
  const config: Record<string, unknown> = {
    slug: String(form.get("slug") ?? "").trim(),
    status: String(form.get("status") ?? "DRAFT"),
  };
  const startAt = String(form.get("startAt") ?? "").trim();
  const endAt = String(form.get("endAt") ?? "").trim();
  const publishedAt = String(form.get("publishedAt") ?? "").trim();
  if (startAt) config.startAt = startAt;
  if (endAt) config.endAt = endAt;
  if (publishedAt) config.publishedAt = publishedAt;

  const productIds = form.getAll("productIds") as string[];
  config.productIds = productIds;

  const banner = await updateBannerItem(
    id,
    {
      title: String(form.get("name") ?? "").trim(),
      subtitle: String(form.get("shortDescription") ?? "").trim(),
      imageUrl: String(form.get("coverImage") ?? "").trim() || undefined,
      placement: "atria-drop",
      enabled: String(form.get("status") ?? "DRAFT") === "LIVE",
      sortOrder: Number(form.get("sortOrder") ?? 0),
      config,
    },
    session!.id,
  );
  return Response.redirect(new URL(`/admin/drops/${id}`, getBrand().siteUrl), 303);
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
  await deleteBannerItem(id, session!.id);
  return Response.json({ ok: true });
}
