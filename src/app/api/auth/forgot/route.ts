import { NextRequest } from "next/server";
import { emailProvider } from "@/lib/notifications/email";
import { getBrand } from "@/config/brand";
import { jsonError } from "@/lib/validation";
import { redirectTo } from "@/lib/http";

export async function POST(request: NextRequest) {
  if (!emailProvider.configured) {
    return jsonError("Email is not configured. Contact support to reset your password.", 503);
  }
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const brand = getBrand();
  await emailProvider.send({
    to: email,
    subject: "Password help",
    text: `If this address has an account at ${brand.brandName}, email ${brand.supportEmail} from the same inbox to reset your password.`,
  });
  return redirectTo(request, "/forgot-password");
}
