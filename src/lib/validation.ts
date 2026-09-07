import { z } from "zod";

export function indiaMobile(value: unknown): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  let ten = digits;
  if (digits.length === 12 && digits.startsWith("91")) ten = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) ten = digits.slice(1);
  if (!/^\d{10}$/.test(ten)) return null;
  return ten;
}

export const emailSchema = z.string().trim().email().max(255);
export const phoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const mobile = indiaMobile(value);
    if (!mobile) {
      ctx.addIssue({ code: "custom", message: "Enter a 10-digit mobile number" });
      return z.NEVER;
    }
    return mobile;
  });
export const pincodeSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const pin = value.replace(/\D/g, "");
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid 6-digit pincode" });
      return z.NEVER;
    }
    return pin;
  });
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Home"),
  fullName: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: pincodeSchema,
  country: z.string().trim().length(2).default("IN"),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(20),
});

export const couponCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .transform((v) => v.toUpperCase());

export const productInputSchema = z.object({
  sku: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().max(20000),
  shortDescription: z.string().max(400),
  categoryId: z.string().min(1),
  supplierId: z.string().optional().nullable(),
  brand: z.string().max(80),
  costPaise: z.number().int().min(0),
  sellingPaise: z.number().int().min(0),
  compareAtPaise: z.number().int().min(0).optional().nullable(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"]),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});

export const checkoutFormSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  addrPhone: phoneSchema,
  line1: z.string().trim().min(2, "Enter your address").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Enter your state").max(60),
  pincode: pincodeSchema,
});

export const checkoutSchema = checkoutFormSchema.transform((value) => ({
  email: value.email,
  phone: value.phone,
  shippingMethod: "standard" as const,
  paymentMethod: "cod" as const,
  address: {
    label: "Checkout",
    fullName: value.fullName,
    phone: value.addrPhone,
    line1: value.line1,
    line2: value.line2 || undefined,
    city: value.city,
    state: value.state,
    pincode: value.pincode,
    country: "IN",
  },
}));

export type ApiErrorBody = {
  error: string;
  details?: unknown;
};

export function jsonError(error: string, status = 400, details?: unknown): Response {
  return Response.json({ error, details } satisfies ApiErrorBody, { status });
}

const jsonString = z.string().transform((v, ctx) => {
  try {
    return JSON.parse(v);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional().default(""),
  parentId: z.string().optional().nullable(),
  status: z.string().default("ACTIVE"),
  sortOrder: z.number().int().min(0).default(0),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(180).optional().nullable(),
});

export const adminCouponSchema = z.object({
  code: z.string().trim().min(3).max(32),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().min(1),
  minOrderPaise: z.number().int().min(0).default(0),
  maxDiscountPaise: z.number().int().min(0).optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).default(1),
  productIds: jsonString.optional().default("[]"),
  categoryIds: jsonString.optional().default("[]"),
  customerIds: jsonString.optional().default("[]"),
  active: z.boolean().default(true),
});

export const adminContentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().min(1).max(20000),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(180).optional().nullable(),
});

export const adminSupplierSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contactPerson: z.string().trim().max(80).optional().nullable(),
  email: z.string().email().max(120).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(200).optional().nullable(),
  website: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  status: z.string().default("ACTIVE"),
});

export const adminInventorySchema = z.object({
  delta: z.number().int().min(1),
  reason: z.enum(["RECEIPT", "SALE", "RESERVE", "RELEASE", "ADJUSTMENT", "RETURN", "DAMAGE"]),
  note: z.string().trim().max(1000).optional().default(""),
});

export const adminSectionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().max(400).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  coverImage: z.string().trim().url().max(2000).optional().nullable(),
  status: z.enum(["DRAFT", "LIVE", "ENDED", "ARCHIVED"]).default("DRAFT"),
  productIds: z.array(z.string().min(1)).default([]),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const adminSettingsSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  supportEmail: z.string().email().max(120).optional().nullable(),
  supportPhone: z.string().trim().max(20).optional().nullable(),
  currency: z.string().trim().length(3).optional().default("INR"),
  currencySymbol: z.string().trim().max(3).optional().default("₹"),
  tagline: z.string().trim().max(200).optional().nullable(),
  freeShippingThresholdPaise: z.number().int().min(0).optional().nullable(),
  shippingRatePaise: z.number().int().min(0).optional().nullable(),
  codEnabled: z.boolean().default(true),
  taxBps: z.number().int().min(0).max(5000).optional().nullable(),
});

export const adminStoreSettingsSchema = z.object({
  gstin: z.string().trim().max(15).optional().default(""),
  pan: z.string().trim().max(10).optional().default(""),
  businessAddress: z.string().trim().max(500).optional().default(""),
  warehouseAddress: z.string().trim().max(500).optional().default(""),
  whatsapp: z.string().trim().max(20).optional().default(""),
  invoiceNote: z.string().trim().max(1000).optional().default(""),
  freeShippingRupees: z.string().trim().max(10).optional().default("0"),
  standardShippingRupees: z.string().trim().max(10).optional().default("0"),
  expressShippingRupees: z.string().trim().max(10).optional().default("0"),
});

export const adminTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]),
  note: z.string().trim().max(2000).optional().default(""),
});
