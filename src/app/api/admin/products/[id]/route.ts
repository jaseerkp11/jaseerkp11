import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { rupeesToPaise } from "@/lib/money";
import { writeAudit } from "@/lib/audit";
import { jsonError } from "@/lib/validation";
import { productInputSchema } from "@/lib/validation";
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
  const parsed = productInputSchema.safeParse({
    sku: form.get("sku"),
    name: form.get("name"),
    slug: form.get("slug"),
    description: form.get("description"),
    shortDescription: form.get("shortDescription"),
    categoryId: form.get("categoryId"),
    supplierId: form.get("supplierId") || null,
    brand: form.get("brand"),
    costPaise: rupeesToPaise(Number(form.get("costRupees") ?? 0)),
    sellingPaise: rupeesToPaise(Number(form.get("sellingRupees") ?? 0)),
    compareAtPaise: form.get("compareRupees") ? rupeesToPaise(Number(form.get("compareRupees"))) : null,
    lowStockThreshold: Number(form.get("lowStockThreshold") ?? 5),
    status: form.get("status") || "ACTIVE",
    featured: form.get("featured") === "on",
    trending: form.get("trending") === "on",
    bestSeller: form.get("bestSeller") === "on",
    newArrival: form.get("newArrival") === "on",
    seoTitle: form.get("seoTitle") || null,
    seoDescription: form.get("seoDescription") || null,
  });
  if (!parsed.success) return jsonError("Invalid product", 400, parsed.error.flatten());
  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
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
