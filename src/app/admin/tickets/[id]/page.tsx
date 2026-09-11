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
      <form action={`/api/admin/tickets/${ticket.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this ticket?")) event.preventDefault(); }} className="mt-4 inline-block">
        <input type="hidden" name="_method" value="DELETE" />
        <button type="submit" className="inline-flex h-10 items-center rounded-full border border-red-200 bg-red-50 px-4 text-sm text-red-700 hover:bg-red-100">Delete ticket</button>
      </form>
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
