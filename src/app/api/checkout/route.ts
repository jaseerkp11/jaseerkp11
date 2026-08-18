import { NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { CheckoutError, placeOrder } from "@/lib/services/checkout";
import { rateLimit } from "@/lib/rate-limit";
import { redirectTo } from "@/lib/http";

function fail(request: NextRequest, code: string) {
  return redirectTo(request, `/checkout?error=${encodeURIComponent(code)}`);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`checkout:${ip}`, 20, 60_000).ok) {
    return fail(request, "wait");
  }
  const form = await request.formData();
  const parsed = checkoutSchema.safeParse({
    email: form.get("email"),
    phone: form.get("phone"),
    shippingMethod: form.get("shippingMethod") || "standard",
    paymentMethod: form.get("paymentMethod") || "cod",
    address: {
      label: "Checkout",
      fullName: form.get("fullName"),
      phone: form.get("addrPhone") || form.get("phone"),
      line1: form.get("line1"),
      line2: String(form.get("line2") ?? "").trim() || undefined,
      city: form.get("city"),
      state: form.get("state"),
      pincode: form.get("pincode"),
      country: "IN",
    },
  });
  if (!parsed.success) {
    const phoneIssue = parsed.error.issues.some((issue) => issue.path.includes("phone"));
    const pinIssue = parsed.error.issues.some((issue) => issue.path.includes("pincode"));
    if (phoneIssue) return fail(request, "phone");
    if (pinIssue) return fail(request, "pincode");
    return fail(request, "details");
  }
  try {
    const order = await placeOrder({
      ...parsed.data,
      paymentMethod: "cod",
    });
    return redirectTo(request, `/checkout/success?order=${order.orderNumber}`);
  } catch (error) {
    if (error instanceof CheckoutError) return fail(request, error.code);
    return fail(request, "save");
  }
}
