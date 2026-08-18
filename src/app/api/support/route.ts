import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { emailSchema, jsonError } from "@/lib/validation";
import { redirectTo } from "@/lib/http";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const form = await request.formData();
  const email = emailSchema.safeParse(form.get("email"));
  const subject = String(form.get("subject") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (!email.success || subject.length < 3 || message.length < 10) {
    return jsonError("Please complete the support form.", 400);
  }
  await prisma.supportTicket.create({
    data: {
      userId: user?.id,
      email: email.data,
      subject,
      message,
      orderId: String(form.get("orderId") ?? "") || undefined,
    },
  });
  return redirectTo(request, "/pages/contact?sent=1");
}
