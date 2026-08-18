import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { rupeesToPaise } from "@/lib/money";
import { writeAudit } from "@/lib/audit";
import { jsonError } from "@/lib/validation";
import { syncProductImages } from "@/lib/services/product-images";

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
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: String(form.get("sku") ?? ""),
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      shortDescription: String(form.get("shortDescription") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
      supplierId: String(form.get("supplierId") ?? "") || null,
      brand: String(form.get("brand") ?? ""),
      costPaise: rupeesToPaise(Number(form.get("costRupees") ?? 0)),
      sellingPaise: rupeesToPaise(Number(form.get("sellingRupees") ?? 0)),
      compareAtPaise: form.get("compareRupees")
        ? rupeesToPaise(Number(form.get("compareRupees")))
        : null,
      lowStockThreshold: Number(form.get("lowStockThreshold") ?? 5),
      status: String(form.get("status") ?? "ACTIVE") as "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK",
      featured: form.get("featured") === "on",
      trending: form.get("trending") === "on",
      bestSeller: form.get("bestSeller") === "on",
      newArrival: form.get("newArrival") === "on",
      seoTitle: String(form.get("seoTitle") ?? "") || null,
      seoDescription: String(form.get("seoDescription") ?? "") || null,
    },
  });
  await syncProductImages(product.id, product.name, form);
  await writeAudit({
    actorId: session!.id,
    action: "product.update",
    entity: "Product",
    entityId: product.id,
  });
  return Response.redirect(new URL(`/admin/products/${product.id}`, request.url), 303);
}
