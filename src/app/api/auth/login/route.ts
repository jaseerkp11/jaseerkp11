import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const brand = getBrand();
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) {
    return Response.redirect(new URL(`/login?error=${encodeURIComponent("Too many attempts")}`, brand.siteUrl), 303);
  }
  const form = await request.formData();
  const nextPath = String(form.get("next") ?? "/account");
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) {
    return Response.redirect(new URL(`/login?error=${encodeURIComponent("Invalid credentials")}`, brand.siteUrl), 303);
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || user.status !== "ACTIVE") {
    return Response.redirect(new URL(`/login?error=${encodeURIComponent("Invalid credentials")}`, brand.siteUrl), 303);
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return Response.redirect(new URL(`/login?error=${encodeURIComponent("Invalid credentials")}`, brand.siteUrl), 303);
  }
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  const dest = nextPath.startsWith("/") ? nextPath : "/account";
  return Response.redirect(new URL(dest, brand.siteUrl), 303);
}
