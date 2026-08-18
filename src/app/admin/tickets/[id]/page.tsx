import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">{ticket.subject}</h1>
      <p className="mt-2 text-sm text-muted">
        {ticket.email} · {ticket.status}
        {ticket.orderId ? ` · order ${ticket.orderId}` : ""}
      </p>
      <p className="mt-6 whitespace-pre-wrap rounded-2xl border border-line bg-card p-5 text-sm">{ticket.message}</p>
      <form action={`/api/admin/tickets/${ticket.id}`} method="post" className="mt-6 grid max-w-sm gap-3">
        <select name="status" defaultValue={ticket.status} className="h-11 rounded-xl border border-line px-3 text-sm">
          <option>OPEN</option>
          <option>IN_PROGRESS</option>
          <option>WAITING</option>
          <option>RESOLVED</option>
          <option>CLOSED</option>
        </select>
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Update ticket</button>
      </form>
    </div>
  );
}
