import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { computeOrderTotals, DELIVERY_PAISE } from "@/lib/money";
import { evaluateCoupon } from "@/lib/services/coupons";

const CART_COOKIE = "store_cart";

export async function loadCart() {
  const user = await getSessionUser();
  const jar = await cookies();
  const sessionId = jar.get(CART_COOKIE)?.value;
  if (user) {
    return prisma.cart.findUnique({
      where: { userId: user.id },
      include: cartInclude,
    });
  }
  if (!sessionId) return null;
  return prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });
}

export async function getOrCreateCart() {
  const user = await getSessionUser();
  const jar = await cookies();
  let sessionId = jar.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (user) {
    const userCart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    const guest = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (guest && guest.id !== userCart.id && guest.items.length) {
      for (const item of guest.items) {
        const existing = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
          },
        });
        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              savedForLater: item.savedForLater,
            },
          });
        }
      }
      await prisma.cart.delete({ where: { id: guest.id } });
    }
    return prisma.cart.findUniqueOrThrow({
      where: { id: userCart.id },
      include: cartInclude,
    });
  }

  return prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
    include: cartInclude,
  });
}

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { position: "asc" as const }, take: 1 } } },
      variant: true,
    },
  },
} as const;

export async function addToCart(input: {
  productId: string;
  variantId?: string | null;
  quantity: number;
}) {
  const quantity = Math.max(1, Math.min(20, Math.floor(input.quantity)));
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || product.status !== "ACTIVE") {
    throw new Error("This product is unavailable.");
  }
  let available = product.stock - product.reservedStock;
  if (input.variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId } });
    if (!variant || variant.productId !== product.id) {
      throw new Error("This variant is unavailable.");
    }
    available = variant.stock - variant.reservedStock;
  }
  if (available < quantity) {
    throw new Error("Not enough stock for this quantity.");
  }
  const cart = await getOrCreateCart();
  const existing = cart.items.find(
    (item) => item.productId === input.productId && item.variantId === (input.variantId ?? null),
  );
  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (nextQty > available) throw new Error("Not enough stock for this quantity.");
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty, savedForLater: false },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? undefined,
        quantity,
      },
    });
  }
  return getOrCreateCart();
}

export async function quoteCart(pincode?: string, shippingMethod = "standard") {
  const existing = await loadCart();
  const cart =
    existing ??
    ({
      id: "",
      couponCode: null,
      items: [],
    } as unknown as NonNullable<Awaited<ReturnType<typeof loadCart>>>);
  const activeItems = cart.items.filter((item) => !item.savedForLater);
  const subtotalPaise = activeItems.reduce((sum, item) => {
    const price = item.variant?.sellingPaise ?? item.product.sellingPaise;
    return sum + price * item.quantity;
  }, 0);
  let discountPaise = 0;
  let couponMessage: string | undefined;
  if (cart.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: cart.couponCode } });
    const usageCount = coupon
      ? await prisma.couponRedemption.count({ where: { couponId: coupon.id } })
      : 0;
    const user = await getSessionUser();
    const customerUsageCount =
      coupon && user
        ? await prisma.couponRedemption.count({
            where: { couponId: coupon.id, userId: user.id },
          })
        : 0;
    const evaluation = evaluateCoupon({
      coupon,
      subtotalPaise,
      productIds: activeItems.map((i) => i.productId),
      categoryIds: activeItems.map((i) => i.product.categoryId),
      customerId: user?.id,
      usageCount,
      customerUsageCount,
    });
    if (evaluation.ok) discountPaise = evaluation.discountPaise;
    else couponMessage = evaluation.message;
  }

  void pincode;
  void shippingMethod;
  const shippingPaise = DELIVERY_PAISE;
  const shippingLabel = "Delivery";


  return {
    cart,
    activeItems,
    totals: computeOrderTotals({
      subtotalPaise,
      discountPaise,
      shippingPaise,
      taxPaise: 0,
    }),
    shippingLabel,
    couponMessage,
  };
}
