import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { getSectionById, createSectionItem, deleteSectionItem, parseSectionConfig } from "@/lib/services/atria-banners";

export async function GET() {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const sections = await prisma.homepageSection.findMany({
    where: { key: { startsWith: "collection-" } },
    orderBy: { sortOrder: "asc" },
  });
  return Response.json({ sections: sections.map((s) => ({ ...s, config: parseSectionConfig(s) })) });
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
  const key = `collection-${slug}`;
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
  return Response.redirect(new URL(`/admin/collections/${section.id}`, getBrand().siteUrl ?? "/admin/collections"), 303);
}
