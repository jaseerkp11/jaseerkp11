import { z } from "zod";

export const emailSchema = z.string().trim().email().max(255);
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-() ]{8,20}$/, "Enter a valid phone number");
export const pincodeSchema = z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");
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

export const checkoutSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["cod", "razorpay"]),
  couponCode: z.string().optional(),
});

export type ApiErrorBody = {
  error: string;
  details?: unknown;
};

export function jsonError(error: string, status = 400, details?: unknown): Response {
  return Response.json({ error, details } satisfies ApiErrorBody, { status });
}
