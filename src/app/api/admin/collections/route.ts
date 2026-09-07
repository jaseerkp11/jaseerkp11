import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminSectionSchema } from "@/lib/validation";
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
  const collections = await listSectionsByPrefix("collection-");
  return Response.json({ collections });
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
  if (!parsed.success) return jsonError("Invalid collection", 400, parsed.error.flatten());
  const key = `collection-${slug}`;
  const section = await createSectionItem({
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
  });
  return Response.redirect(new URL(`/admin/collections/${section.id}`, getBrand().siteUrl ?? "/admin/collections"), 303);
}
