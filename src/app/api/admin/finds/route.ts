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
  const finds = await listSectionsByPrefix("find-");
  return Response.json({ finds });
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
  const key = `find-${slug}`;
  const config: Record<string, unknown> = {
    slug,
    status: String(form.get("status") ?? "DRAFT"),
    productIds: form.getAll("productIds") as string[],
  };

  const section = await createSectionItem({
    key,
    title: String(form.get("name") ?? "").trim(),
    enabled: String(form.get("status") ?? "DRAFT") === "LIVE",
    sortOrder: 0,
    config,
  });
  return Response.redirect(new URL(`/admin/finds/${section.id}`, getBrand().siteUrl ?? "/admin/finds"), 303);
}
