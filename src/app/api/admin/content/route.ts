import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminContentSchema } from "@/lib/validation";
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
  const announcement = String(form.get("announcement") ?? "").trim();
  if (announcement.length > 20000) return jsonError("Announcement too long", 400);
  await prisma.siteSetting.upsert({
    where: { id: "announcement" },
    update: { value: announcement },
    create: { id: "announcement", value: announcement },
  });
  const pages = await prisma.cmsPage.findMany({ select: { id: true } });
  for (const page of pages) {
    const title = form.get(`title_${page.id}`);
    const body = form.get(`body_${page.id}`);
    if (typeof title === "string" && typeof body === "string") {
      const parsed = adminContentSchema.safeParse({ title, body });
      if (!parsed.success) continue;
      await prisma.cmsPage.update({ where: { id: page.id }, data: { title: parsed.data.title, body: parsed.data.body } });
    }
  }
  const faqs = await prisma.faq.findMany({ select: { id: true } });
  for (const faq of faqs) {
    const question = form.get(`faqQuestion_${faq.id}`);
    const answer = form.get(`faqAnswer_${faq.id}`);
    if (typeof question === "string" && typeof answer === "string") {
      const q = question.trim();
      const a = answer.trim();
      if (q.length > 0 && q.length <= 200 && a.length > 0 && a.length <= 2000) {
        await prisma.faq.update({ where: { id: faq.id }, data: { question: q, answer: a } });
      }
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
