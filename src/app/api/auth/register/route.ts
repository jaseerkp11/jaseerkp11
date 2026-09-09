import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema, jsonError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { emailProvider, notificationTemplates } from "@/lib/notifications/email";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`register:${ip}`, 8, 60_000);
  if (!limited.ok) return jsonError("Too many attempts. Try again shortly.", 429);

  const form = await request.formData();
  const parsed = registerSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone") || undefined,
    password: form.get("password"),
  });
  if (!parsed.success) {
    return redirectError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return redirectError("An account with this email already exists.");
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || undefined,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  try {
    await emailProvider.send({
      to: user.email,
      ...notificationTemplates.welcome(user.name),
    });
  } catch {
    /* registration should still succeed even if email fails */
  }
  return Response.redirect(new URL("/account", request.url), 303);
}

function redirectError(message: string) {
  return Response.redirect(
    new URL(`/register?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    303,
  );
}
