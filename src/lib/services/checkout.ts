import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { quoteCart } from "@/lib/services/cart";
import { adjustInventory } from "@/lib/services/inventory";
import { paymentProviders } from "@/lib/payments/provider";
import { shippingProvider } from "@/lib/shipping/provider";
import { trackEvent } from "@/lib/analytics/track";
import { writeAudit } from "@/lib/audit";
import type { addressSchema } from "@/lib/validation";
import type { z } from "zod";

function orderNumber(): string {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `AT${Date.now().toString().slice(-8)}${n.toString().slice(0, 2)}`;
}

export async function placeOrder(input: {
  email: string;
  phone: string;
  address: z.infer<typeof addressSchema>;
  shippingMethod: "standard" | "express";
  paymentMethod: "cod" | "razorpay";
}) {
  const user = await getSessionUser();
  const quote = await quoteCart(input.address.pincode, input.shippingMethod);
  if (quote.activeItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const quotes = await shippingProvider.quote(input.address.pincode);
  const shipping = quotes.find((q) => q.method === input.shippingMethod && q.available);
  if (!shipping) throw new Error("Shipping is not available for this pincode.");

  const provider = paymentProviders[input.paymentMethod];
  const intent = await provider.createIntent(quote.totals.totalPaise, "INR");
  if (!intent.configured) {
    throw new Error(intent.message);
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const item of quote.activeItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("A product in your cart is no longer available.");
      const available = product.stock - product.reservedStock;
      if (available < item.quantity) {
        throw new Error(`${product.name} does not have enough stock.`);
      }
      await adjustInventory({
        productId: item.productId,
        variantId: item.variantId,
        delta: item.quantity,
        reason: "RESERVE",
        tx,
      });
    }

    const created = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: user?.id,
        email: input.email,
        phone: input.phone,
        subtotalPaise: quote.totals.subtotalPaise,
        discountPaise: quote.totals.discountPaise,
        shippingPaise: quote.totals.shippingPaise,
        taxPaise: quote.totals.taxPaise,
        totalPaise: quote.totals.totalPaise,
        costPaise: quote.activeItems.reduce((sum, item) => {
          const cost = item.variant?.costPaise ?? item.product.costPaise;
          return sum + cost * item.quantity;
        }, 0),
        couponCode: quote.cart.couponCode,
        paymentStatus: input.paymentMethod === "cod" ? "COD_PENDING" : "PENDING",
        status: "PENDING",
        shippingName: input.address.fullName,
        shippingPhone: input.address.phone,
        shippingLine1: input.address.line1,
        shippingLine2: input.address.line2,
        shippingCity: input.address.city,
        shippingState: input.address.state,
        shippingPincode: input.address.pincode,
        shippingCountry: input.address.country ?? "IN",
        shippingMethod: shipping.label,
        items: {
          create: quote.activeItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.product.name,
            sku: item.variant?.sku ?? item.product.sku,
            variantLabel: item.variant?.name ?? "",
            quantity: item.quantity,
            unitPricePaise: item.variant?.sellingPaise ?? item.product.sellingPaise,
            unitCostPaise: item.variant?.costPaise ?? item.product.costPaise,
            imageUrl: item.product.images[0]?.url,
          })),
        },
        payments: {
          create: {
            provider: provider.id,
            amountPaise: quote.totals.totalPaise,
            currency: "INR",
            status: input.paymentMethod === "cod" ? "COD_PENDING" : "PENDING",
            method: input.paymentMethod,
            metadata: JSON.stringify({ intent: intent.message }),
          },
        },
        events: {
          create: {
            status: "PENDING",
            note:
              input.paymentMethod === "cod"
                ? "Order placed with cash on delivery. Payment will be collected on delivery."
                : "Order placed. Waiting for payment confirmation.",
            actorId: user?.id,
          },
        },
      },
    });

    if (quote.cart.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: quote.cart.couponCode } });
      if (coupon) {
        await tx.couponRedemption.create({
          data: { couponId: coupon.id, userId: user?.id, orderId: created.id },
        });
      }
    }

    await tx.cartItem.deleteMany({
      where: { cartId: quote.cart.id, savedForLater: false },
    });
    await tx.cart.update({
      where: { id: quote.cart.id },
      data: { couponCode: null },
    });

    return created;
  });

  await trackEvent({ name: "purchase", metadata: { orderId: order.id } });
  await writeAudit({
    actorId: user?.id,
    action: "order.create",
    entity: "Order",
    entityId: order.id,
    metadata: { paymentMethod: input.paymentMethod, totalPaise: order.totalPaise },
  });

  return order;
}
