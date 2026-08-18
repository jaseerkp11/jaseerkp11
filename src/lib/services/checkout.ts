import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { quoteCart } from "@/lib/services/cart";
import { adjustInventory } from "@/lib/services/inventory";
import { paymentProviders } from "@/lib/payments/provider";
import { shippingProvider } from "@/lib/shipping/provider";
import { trackEvent } from "@/lib/analytics/track";
import { writeAudit } from "@/lib/audit";
import { emailProvider, notificationTemplates } from "@/lib/notifications/email";
import { formatMoney } from "@/lib/money";
import type { addressSchema } from "@/lib/validation";
import type { z } from "zod";

export class CheckoutError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

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
  if (quote.activeItems.length === 0 || !quote.cart.id) {
    throw new CheckoutError("empty", "Your cart is empty.");
  }

  const quotes = await shippingProvider.quote(input.address.pincode);
  const shipping = quotes.find((q) => q.method === input.shippingMethod && q.available);
  if (!shipping) {
    throw new CheckoutError("pincode", "Enter a valid 6-digit pincode so we can deliver.");
  }

  const provider = paymentProviders[input.paymentMethod];
  if (!provider) {
    throw new CheckoutError("payment", "Please choose cash on delivery.");
  }
  const intent = await provider.createIntent(quote.totals.totalPaise, "INR");
  if (!intent.configured) {
    throw new CheckoutError("payment", "Please choose cash on delivery.");
  }

  const reserved: Array<{ productId: string; variantId: string | null; quantity: number }> = [];
  try {
    for (const item of quote.activeItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new CheckoutError("stock", "A product in your cart is no longer available.");
      const available = product.stock - product.reservedStock;
      if (available < item.quantity) {
        throw new CheckoutError("stock", `${product.name} does not have enough stock.`);
      }
      await adjustInventory({
        productId: item.productId,
        variantId: item.variantId,
        delta: item.quantity,
        reason: "RESERVE",
      });
      reserved.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: user?.id,
        email: input.email,
        phone: input.phone,
        subtotalPaise: quote.totals.subtotalPaise,
        discountPaise: quote.totals.discountPaise,
        shippingPaise: quote.totals.shippingPaise,
        taxPaise: 0,
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
        shippingLine2: input.address.line2 || null,
        shippingCity: input.address.city,
        shippingState: input.address.state,
        shippingPincode: input.address.pincode,
        shippingCountry: "IN",
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
                ? "Order placed. Pay cash when the parcel arrives."
                : "Order placed. Waiting for payment confirmation.",
          },
        },
      },
    });

    if (quote.cart.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: quote.cart.couponCode } });
      if (coupon) {
        await prisma.couponRedemption.create({
          data: { couponId: coupon.id, userId: user?.id, orderId: order.id },
        });
      }
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: quote.cart.id, savedForLater: false },
    });
    await prisma.cart.update({
      where: { id: quote.cart.id },
      data: { couponCode: null },
    });

    try {
      await emailProvider.send({
        to: order.email,
        ...notificationTemplates.orderConfirmed(
          order.orderNumber,
          formatMoney(order.totalPaise),
          "Cash on delivery",
        ),
      });
    } catch {
      /* order is already saved */
    }
    try {
      await trackEvent({ name: "purchase", metadata: { orderId: order.id } });
      await writeAudit({
        actorId: user?.id,
        action: "order.create",
        entity: "Order",
        entityId: order.id,
        metadata: { paymentMethod: input.paymentMethod, totalPaise: order.totalPaise },
      });
    } catch {
      /* order is already saved */
    }

    return order;
  } catch (error) {
    for (const item of reserved) {
      try {
        await adjustInventory({
          productId: item.productId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: "RELEASE",
          note: "Checkout rolled back",
        });
      } catch {
        /* keep trying remaining lines */
      }
    }
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError("save", "The order could not be saved. Please try again.");
  }
}
