import { NextRequest } from "next/server";
import { emailSchema, jsonError } from "@/lib/validation";
import { emailProvider } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const parsed = emailSchema.safeParse(form.get("email"));
  if (!parsed.success) return jsonError("Enter a valid email", 400);
  const result = await emailProvider.send({
    to: parsed.data,
    subject: "Newsletter",
    text: "A newsletter provider is not fully connected. This request was not added to a mailing list.",
  });
  return Response.json({
    accepted: result.sent,
    message: result.reason ?? "Recorded.",
  });
}
