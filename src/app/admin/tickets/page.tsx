import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Support tickets</h1>
      <p className="mt-2 text-sm text-muted">Messages from the Contact form.</p>
      {tickets.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No tickets yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="px-4 py-3 text-sm">
              <Link href={`/admin/tickets/${ticket.id}`} className="font-medium underline">
                {ticket.subject}
              </Link>
              <p className="text-muted">
                {ticket.status} · {ticket.email} · {ticket.createdAt.toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
