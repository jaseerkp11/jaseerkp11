import type { Coupon, Product } from "@prisma/client";
import { applyCouponDiscount } from "@/lib/money";

export type CouponEvaluation = {
  ok: boolean;
  discountPaise: number;
  message: string;
};

export function evaluateCoupon(input: {
  coupon: Coupon | null;
  subtotalPaise: number;
  productIds: string[];
  categoryIds: string[];
  customerId?: string | null;
  usageCount: number;
  customerUsageCount: number;
  now?: Date;
}): CouponEvaluation {
  const { coupon } = input;
  if (!coupon || !coupon.active) {
    return { ok: false, discountPaise: 0, message: "This coupon is not valid." };
  }
  const now = input.now ?? new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, discountPaise: 0, message: "This coupon is not active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, discountPaise: 0, message: "This coupon has expired." };
  }
  if (coupon.usageLimit != null && input.usageCount >= coupon.usageLimit) {
    return { ok: false, discountPaise: 0, message: "This coupon has reached its usage limit." };
  }
  if (input.customerUsageCount >= coupon.perCustomerLimit) {
    return { ok: false, discountPaise: 0, message: "You have already used this coupon." };
  }
  if (input.subtotalPaise < coupon.minOrderPaise) {
    return {
      ok: false,
      discountPaise: 0,
      message: "This order does not meet the coupon minimum.",
    };
  }
  const productIds = JSON.parse(coupon.productIds) as string[];
  const categoryIds = JSON.parse(coupon.categoryIds) as string[];
  const customerIds = JSON.parse(coupon.customerIds) as string[];
  if (productIds.length > 0 && !input.productIds.some((id) => productIds.includes(id))) {
    return { ok: false, discountPaise: 0, message: "This coupon does not apply to these products." };
  }
  if (categoryIds.length > 0 && !input.categoryIds.some((id) => categoryIds.includes(id))) {
    return { ok: false, discountPaise: 0, message: "This coupon does not apply to this category." };
  }
  if (customerIds.length > 0 && (!input.customerId || !customerIds.includes(input.customerId))) {
    return { ok: false, discountPaise: 0, message: "This coupon is not assigned to your account." };
  }
  const discountPaise = applyCouponDiscount({
    type: coupon.type,
    value: coupon.value,
    subtotalPaise: input.subtotalPaise,
    maxDiscountPaise: coupon.maxDiscountPaise,
  });
  if (discountPaise <= 0) {
    return { ok: false, discountPaise: 0, message: "This coupon does not change the total." };
  }
  return { ok: true, discountPaise, message: "Coupon applied." };
}

export function lineSubtotal(items: Array<Pick<Product, "sellingPaise"> & { quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.sellingPaise * item.quantity, 0);
}
