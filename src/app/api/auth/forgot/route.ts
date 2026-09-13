import { NextRequest } from "next/server";
import { emailProvider } from "@/lib/notifications/email";
import { getBrand } from "@/config/brand";
import { jsonError } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!emailProvider.configured) {
    return jsonError("Email provider is not configured. No reset message was sent.", 503);
  }
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  await emailProvider.send({
    to: email,
    subject: "Password reset",
    text: "A reset transport is configured but not fully connected.",
  });
  return Response.redirect(new URL("/forgot-password", getBrand().siteUrl), 303);
}
