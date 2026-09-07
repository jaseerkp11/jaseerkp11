import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminTicketSchema } from "@/lib/validation";
import { redirectTo } from "@/lib/http";
import type { TicketStatus } from "@prisma/client";

const allowed: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  const { id } = await context.params;
  const form = await request.formData();
  const status = String(form.get("status")) as TicketStatus;
  if (!allowed.includes(status)) return jsonError("Invalid status", 400);
  const parsed = adminTicketSchema.safeParse({
    status,
    note: form.get("note"),
  });
  if (!parsed.success) return jsonError("Invalid ticket update", 400, parsed.error.flatten());
  await prisma.supportTicket.update({ where: { id }, data: { status: parsed.data.status } });
  return redirectTo(request, `/admin/tickets/${id}`);
}
