import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";
import { redirectTo } from "@/lib/http";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const form = await request.formData();
  await prisma.siteSetting.upsert({
    where: { id: "announcement" },
    update: { value: String(form.get("announcement") ?? "") },
    create: { id: "announcement", value: String(form.get("announcement") ?? "") },
  });
  const pages = await prisma.cmsPage.findMany({ select: { id: true } });
  for (const page of pages) {
    const title = form.get(`title_${page.id}`);
    const body = form.get(`body_${page.id}`);
    if (typeof title === "string" && typeof body === "string") {
      await prisma.cmsPage.update({ where: { id: page.id }, data: { title, body } });
    }
  }
  const faqs = await prisma.faq.findMany({ select: { id: true } });
  for (const faq of faqs) {
    const question = form.get(`faqQuestion_${faq.id}`);
    const answer = form.get(`faqAnswer_${faq.id}`);
    if (typeof question === "string" && typeof answer === "string") {
      await prisma.faq.update({ where: { id: faq.id }, data: { question, answer } });
    }
  }
  await writeAudit({
    actorId: session!.id,
    action: "content.update",
    entity: "SiteSetting",
    entityId: "announcement",
  });
  return redirectTo(request, "/admin/content");
}
