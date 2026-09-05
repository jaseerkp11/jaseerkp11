import { NextRequest } from "next/server";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { listBannersByPlacement, createBannerItem } from "@/lib/services/atria-banners";

export async function GET() {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageMarketing)) return jsonError("Forbidden", 403);
  const collections = await listBannersByPlacement("atria-collection");
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
  const config: Record<string, unknown> = {
    slug: String(form.get("slug") ?? "").trim(),
    imageUrl: String(form.get("imageUrl") ?? "").trim() || undefined,
    productIds: form.getAll("productIds") as string[],
  };
  const collection = await createBannerItem(
    {
      title: String(form.get("name") ?? "").trim(),
      subtitle: String(form.get("shortDescription") ?? "").trim(),
      imageUrl: String(form.get("imageUrl") ?? "").trim() || undefined,
      href: `/collections/${String(form.get("slug") ?? "").trim()}`,
      placement: "atria-collection",
      enabled: String(form.get("status") ?? "DRAFT") === "ACTIVE",
      sortOrder: Number(form.get("sortOrder") ?? 0),
      config,
    },
    session!.id,
  );
  return Response.redirect(new URL("/admin/collections", getBrand().siteUrl), 303);
}
