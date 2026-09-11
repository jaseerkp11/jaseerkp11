import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { getBrand } from "@/config/brand";
import { writeAudit } from "@/lib/audit";
import { redirectTo } from "@/lib/http";
import type { OrderStatus } from "@prisma/client";
import { adjustInventory } from "@/lib/services/inventory";

const allowed: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

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
  if (!hasPermission(session!.role, PERMISSIONS.viewOrders)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  const form = await request.formData();
  const status = String(form.get("status")) as OrderStatus;
  if (!allowed.includes(status)) return jsonError("Invalid status", 400);
  const trackingNumber = String(form.get("trackingNumber") ?? "").trim() || null;
  const note = String(form.get("note") ?? "").trim();
  if (note.length > 1000) return jsonError("Note too long", 400);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return jsonError("Not found", 404);

  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    for (const item of order.items) {
      if (item.productId) {
        await adjustInventory({
          productId: item.productId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: "RELEASE",
          note: `Order ${order.orderNumber} cancelled`,
          actorId: session!.id,
        });
      }
    }
  }
  if (status === "DELIVERED" && order.status !== "DELIVERED") {
    for (const item of order.items) {
      if (item.productId) {
        await adjustInventory({
          productId: item.productId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: "SALE",
          note: `Order ${order.orderNumber} delivered`,
          actorId: session!.id,
        });
      }
    }
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: order.paymentStatus === "COD_PENDING" ? "PAID" : order.paymentStatus,
        fulfillmentStatus: "FULFILLED",
      },
    });
  }

  await prisma.order.update({
    where: { id },
    data: { status, trackingNumber },
  });
  await prisma.orderEvent.create({
    data: {
      orderId: id,
      status,
      note,
      actorId: session!.id,
    },
  });
  await writeAudit({
    actorId: session!.id,
    action: "order.status",
    entity: "Order",
    entityId: id,
    metadata: { status },
  });
  return redirectTo(request, `/admin/orders/${id}`);
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
  if (!hasPermission(session!.role, PERMISSIONS.refundOrders)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await prisma.order.delete({ where: { id } });
  await writeAudit({
    actorId: session!.id,
    action: "order.delete",
    entity: "Order",
    entityId: id,
  });
  return Response.json({ ok: true });
}
