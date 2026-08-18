import { NextRequest } from "next/server";
import { checkoutSchema, jsonError } from "@/lib/validation";
import { placeOrder } from "@/lib/services/checkout";
import { rateLimit } from "@/lib/rate-limit";
import { redirectTo } from "@/lib/http";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`checkout:${ip}`, 12, 60_000).ok) {
    return jsonError("Too many checkout attempts", 429);
  }
  const form = await request.formData();
  const parsed = checkoutSchema.safeParse({
    email: form.get("email"),
    phone: form.get("phone"),
    shippingMethod: form.get("shippingMethod"),
    paymentMethod: form.get("paymentMethod"),
    address: {
      label: "Checkout",
      fullName: form.get("fullName"),
      phone: form.get("addrPhone"),
      line1: form.get("line1"),
      line2: form.get("line2") || undefined,
      city: form.get("city"),
      state: form.get("state"),
      pincode: form.get("pincode"),
      country: "IN",
    },
  });
  if (!parsed.success) {
    return redirectTo(request, "/checkout/failure");
  }
  try {
    const order = await placeOrder(parsed.data);
    return redirectTo(request, `/checkout/success?order=${order.orderNumber}`);
  } catch {
    return redirectTo(request, "/checkout/failure");
  }
}
