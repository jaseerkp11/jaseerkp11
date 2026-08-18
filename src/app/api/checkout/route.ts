import { NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { CheckoutError, placeOrder } from "@/lib/services/checkout";
import { rateLimit } from "@/lib/rate-limit";

function fieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[issue.path.length - 1] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`checkout:${ip}`, 20, 60_000).ok) {
    return Response.json({ ok: false, message: "Please wait a moment and try again.", fields: {} }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return Response.json({ ok: false, message: "Please fill the form and try again.", fields: {} }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse({
    email: body.email,
    phone: body.phone,
    fullName: body.fullName,
    addrPhone: body.addrPhone || body.phone,
    line1: body.line1,
    line2: body.line2 ?? "",
    city: body.city,
    state: body.state,
    pincode: body.pincode,
  });

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: "Please correct the highlighted fields.",
        fields: fieldErrors(parsed.error.issues),
      },
      { status: 400 },
    );
  }

  try {
    const order = await placeOrder(parsed.data);
    return Response.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const fields: Record<string, string> = {};
      if (error.code === "pincode") fields.pincode = error.message;
      if (error.code === "phone") fields.phone = error.message;
      if (error.code === "stock") fields.form = error.message;
      return Response.json({ ok: false, message: error.message, fields }, { status: 400 });
    }
    console.error("checkout.api", error);
    return Response.json(
      { ok: false, message: "The order could not be saved. Please try again.", fields: {} },
      { status: 500 },
    );
  }
}
