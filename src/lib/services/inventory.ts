import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function adjustInventory(input: {
  productId: string;
  variantId?: string | null;
  delta: number;
  reason: "RECEIPT" | "SALE" | "RESERVE" | "RELEASE" | "ADJUSTMENT" | "RETURN" | "DAMAGE";
  note?: string;
  actorId?: string | null;
  tx?: Prisma.TransactionClient;
}) {
  const db = input.tx ?? prisma;
  const product = await db.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new Error("Product not found");

  if (input.reason === "RESERVE") {
    const available = product.stock - product.reservedStock;
    if (available < input.delta) throw new Error("Insufficient stock");
    await db.product.update({
      where: { id: product.id },
      data: { reservedStock: { increment: input.delta } },
    });
  } else if (input.reason === "RELEASE") {
    await db.product.update({
      where: { id: product.id },
      data: { reservedStock: { decrement: input.delta } },
    });
  } else if (input.reason === "SALE") {
    await db.product.update({
      where: { id: product.id },
      data: {
        stock: { decrement: input.delta },
        reservedStock: { decrement: input.delta },
      },
    });
  } else {
    await db.product.update({
      where: { id: product.id },
      data: { stock: { increment: input.delta } },
    });
  }

  if (input.variantId) {
    if (input.reason === "RESERVE") {
      await db.productVariant.update({
        where: { id: input.variantId },
        data: { reservedStock: { increment: input.delta } },
      });
    } else if (input.reason === "RELEASE") {
      await db.productVariant.update({
        where: { id: input.variantId },
        data: { reservedStock: { decrement: input.delta } },
      });
    } else if (input.reason === "SALE") {
      await db.productVariant.update({
        where: { id: input.variantId },
        data: {
          stock: { decrement: input.delta },
          reservedStock: { decrement: input.delta },
        },
      });
    } else {
      await db.productVariant.update({
        where: { id: input.variantId },
        data: { stock: { increment: input.delta } },
      });
    }
  }

  await db.inventoryEvent.create({
    data: {
      productId: input.productId,
      variantId: input.variantId ?? undefined,
      delta: input.reason === "RECEIPT" || input.reason === "ADJUSTMENT" || input.reason === "RETURN"
        ? input.delta
        : -Math.abs(input.delta),
      reason: input.reason,
      note: input.note ?? "",
      actorId: input.actorId ?? undefined,
    },
  });

  if (!input.tx) {
    await writeAudit({
      actorId: input.actorId,
      action: `inventory.${input.reason.toLowerCase()}`,
      entity: "Product",
      entityId: input.productId,
      metadata: { delta: input.delta, variantId: input.variantId },
    });
  }
}

export function availableStock(stock: number, reserved: number): number {
  return Math.max(0, stock - reserved);
}
