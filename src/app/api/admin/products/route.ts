import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { rupeesToPaise } from "@/lib/money";
import { writeAudit } from "@/lib/audit";
import { jsonError } from "@/lib/validation";
import { adjustInventory } from "@/lib/services/inventory";
import { syncProductImages } from "@/lib/services/product-images";

function parseProduct(form: FormData) {
  return {
    sku: String(form.get("sku") ?? "").trim(),
    name: String(form.get("name") ?? "").trim(),
    slug: String(form.get("slug") ?? "").trim(),
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
    stock: Number(form.get("stock") ?? 0),
    lowStockThreshold: Number(form.get("lowStockThreshold") ?? 5),
    status: String(form.get("status") ?? "DRAFT") as "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK",
    featured: form.get("featured") === "on",
    trending: form.get("trending") === "on",
    bestSeller: form.get("bestSeller") === "on",
    newArrival: form.get("newArrival") === "on",
    seoTitle: String(form.get("seoTitle") ?? "") || null,
    seoDescription: String(form.get("seoDescription") ?? "") || null,
  };
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.editProducts)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  const data = parseProduct(form);
  if (!data.sku || !data.name || !data.slug || !data.categoryId) {
    return jsonError("Missing required fields", 400);
  }
  const product = await prisma.product.create({
    data: {
      ...data,
      stock: 0,
    },
  });
  await syncProductImages(product.id, data.name, form);
  if (data.stock > 0) {
    await adjustInventory({
      productId: product.id,
      delta: data.stock,
      reason: "RECEIPT",
      note: "Initial stock on create",
      actorId: session!.id,
    });
  }
  await writeAudit({
    actorId: session!.id,
    action: "product.create",
    entity: "Product",
    entityId: product.id,
  });
  return Response.redirect(new URL(`/admin/products/${product.id}`, request.url), 303);
}
