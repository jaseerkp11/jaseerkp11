import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { redirectTo } from "@/lib/http";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const orderNumber = String(form.get("orderNumber") ?? "").trim();
  const phone = digits(String(form.get("phone") ?? ""));
  if (!orderNumber || phone.length < 10) {
    return redirectTo(request, "/track?error=1");
  }
  const order = await prisma.order.findFirst({
    where: { orderNumber },
  });
  if (!order) return redirectTo(request, "/track?error=1");
  const orderPhone = digits(order.phone);
  const shipPhone = digits(order.shippingPhone);
  if (!orderPhone.endsWith(phone.slice(-10)) && !shipPhone.endsWith(phone.slice(-10))) {
    return redirectTo(request, "/track?error=1");
  }
  return redirectTo(request, `/track/${order.id}?phone=${encodeURIComponent(phone.slice(-10))}`);
}
