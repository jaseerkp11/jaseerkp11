import { NextRequest } from "next/server";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordSchema, jsonError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return jsonError("Sign in required", 401);
  const form = await request.formData();
  const next = passwordSchema.safeParse(form.get("next"));
  if (!next.success) return jsonError("New password is too short", 400);
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return jsonError("User not found", 404);
  const ok = await verifyPassword(String(form.get("current") ?? ""), user.passwordHash);
  if (!ok) return jsonError("Current password is incorrect", 400);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next.data) },
  });
  await writeAudit({
    actorId: user.id,
    action: "user.password_change",
    entity: "User",
    entityId: user.id,
  });
  return Response.redirect(new URL("/account/settings", getBrand().siteUrl), 303);
}
