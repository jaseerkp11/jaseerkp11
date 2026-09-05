import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { listSectionsByPrefix, createSectionItem } from "@/lib/services/atria-banners";

export async function GET() {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const drops = await listSectionsByPrefix("drop-");
  return Response.json({ drops });
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const slug = String(form.get("slug") ?? "").trim();
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

  const drop = await createSectionItem({
    key,
    title: String(form.get("name") ?? "").trim(),
    enabled: String(form.get("status") ?? "DRAFT") === "LIVE",
    sortOrder: Number(form.get("sortOrder") ?? 0),
    config,
  });
  return Response.redirect(new URL("/admin/drops", getBrand().siteUrl ?? "/admin/drops"), 303);
}
