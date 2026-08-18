import { describe, expect, it } from "vitest";
import { applyCouponDiscount, computeOrderTotals, marginPercent, profitPaise } from "./money";
import { evaluateCoupon } from "./services/coupons";
import { hasPermission, PERMISSIONS } from "./permissions";
import { previewProductImport } from "./imports/products";
import type { Coupon } from "@prisma/client";

describe("money", () => {
  it("computes totals in minor units", () => {
    expect(
      computeOrderTotals({
        subtotalPaise: 100000,
        discountPaise: 10000,
        shippingPaise: 4900,
        taxPaise: 16200,
      }),
    ).toEqual({
      subtotalPaise: 100000,
      discountPaise: 10000,
      shippingPaise: 4900,
      taxPaise: 16200,
      totalPaise: 111100,
    });
  });

  it("caps discount at subtotal", () => {
    expect(
      computeOrderTotals({
        subtotalPaise: 5000,
        discountPaise: 9000,
        shippingPaise: 0,
        taxPaise: 0,
      }).discountPaise,
    ).toBe(5000);
  });

  it("calculates margin from selling price", () => {
    expect(profitPaise(20000, 8000)).toBe(12000);
    expect(marginPercent(20000, 8000)).toBe(60);
    expect(marginPercent(0, 100)).toBe(0);
  });

  it("applies percentage and fixed coupons", () => {
    expect(
      applyCouponDiscount({ type: "PERCENTAGE", value: 10, subtotalPaise: 100000, maxDiscountPaise: 5000 }),
    ).toBe(5000);
    expect(applyCouponDiscount({ type: "FIXED", value: 20000, subtotalPaise: 15000 })).toBe(15000);
  });
});

const coupon = (overrides: Partial<Coupon>): Coupon =>
  ({
    id: "c1",
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrderPaise: 99900,
    maxDiscountPaise: 50000,
    startsAt: null,
    expiresAt: null,
    usageLimit: 10,
    perCustomerLimit: 1,
    productIds: "[]",
    categoryIds: "[]",
    customerIds: "[]",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Coupon;

describe("coupons", () => {
  it("rejects inactive and under-minimum coupons", () => {
    expect(
      evaluateCoupon({
        coupon: coupon({ active: false }),
        subtotalPaise: 200000,
        productIds: [],
        categoryIds: [],
        usageCount: 0,
        customerUsageCount: 0,
      }).ok,
    ).toBe(false);
    expect(
      evaluateCoupon({
        coupon: coupon({}),
        subtotalPaise: 1000,
        productIds: [],
        categoryIds: [],
        usageCount: 0,
        customerUsageCount: 0,
      }).ok,
    ).toBe(false);
  });

  it("applies a valid percentage coupon", () => {
    const result = evaluateCoupon({
      coupon: coupon({}),
      subtotalPaise: 200000,
      productIds: ["p1"],
      categoryIds: ["cat"],
      usageCount: 0,
      customerUsageCount: 0,
    });
    expect(result.ok).toBe(true);
    expect(result.discountPaise).toBe(20000);
  });
});

describe("permissions", () => {
  it("keeps customers out of admin permissions", () => {
    expect(hasPermission("CUSTOMER", PERMISSIONS.editProducts)).toBe(false);
    expect(hasPermission("STAFF", PERMISSIONS.editProducts)).toBe(true);
    expect(hasPermission("STAFF", PERMISSIONS.manageSettings)).toBe(false);
    expect(hasPermission("SUPER_ADMIN", PERMISSIONS.manageSettings)).toBe(true);
  });
});

describe("imports", () => {
  it("does not mark invalid rows as valid", () => {
    const preview = previewProductImport([{ sku: "", name: "" }, { sku: "A", name: "B", price: "10" }]);
    expect(preview.invalid).toHaveLength(1);
    expect(preview.valid).toHaveLength(1);
  });
});
