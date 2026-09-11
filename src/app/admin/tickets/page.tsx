import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminFilters } from "@/components/admin/filters-form";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));
  const pageSize = 20;
  const where: Record<string, unknown> = {};
  if (status && ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"].includes(status)) {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { subject: { contains: q } },
      { email: { contains: q } },
    ];
  }
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supportTicket.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <h1 className="font-display text-3xl">Support tickets</h1>
      <p className="mt-2 text-sm text-muted">Messages from the Contact form.</p>
      <AdminFilters defaultQ={q ?? ""} defaultStatus={status ?? ""} />
      {tickets.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No tickets yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>
                <Link href={`/admin/tickets/${ticket.id}`} className="font-medium underline">
                  {ticket.subject}
                </Link>
                <p className="text-muted">
                  {ticket.status} · {ticket.email} · {ticket.createdAt.toLocaleString("en-IN")}
                </p>
              </span>
              <form action={`/api/admin/tickets/${ticket.id}`} method="post" onSubmit={(event) => { if (!confirm("Delete this ticket?")) event.preventDefault(); }}>
                <input type="hidden" name="_method" value="DELETE" />
                <button type="submit" className="text-xs text-red-600 hover:text-red-700">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} baseUrl="/admin/tickets" searchParams={{ q, status }} />
    </div>
  );
}
