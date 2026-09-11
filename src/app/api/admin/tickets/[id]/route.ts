import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, assertStaff, hasPermission, PERMISSIONS } from "@/lib/auth";
import { jsonError } from "@/lib/validation";
import { adminTicketSchema } from "@/lib/validation";
import { redirectTo } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
  if (!hasPermission(session!.role, PERMISSIONS.manageContent)) return jsonError("Forbidden", 403);
  const { id } = await context.params;
  await prisma.supportTicket.delete({ where: { id } });
  await writeAudit({
    actorId: session!.id,
    action: "ticket.delete",
    entity: "SupportTicket",
    entityId: id,
  });
  return Response.json({ ok: true });
}
