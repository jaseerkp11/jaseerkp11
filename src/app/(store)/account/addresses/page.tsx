import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/addresses");
  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">Addresses</h1>
      {addresses.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No addresses" description="Add a delivery address for faster checkout." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
              <p className="font-medium">{a.label} · {a.fullName}</p>
              <p className="text-muted">
                {a.line1}, {a.city}, {a.state} {a.pincode}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form action="/api/account/addresses" method="post" className="mt-8 grid gap-3 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-medium">Add address</h2>
        <input name="label" placeholder="Label" defaultValue="Home" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="fullName" required placeholder="Full name" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="line1" required placeholder="Line 1" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="line2" placeholder="Line 2" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="city" required placeholder="City" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="state" required placeholder="State" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <input name="pincode" required placeholder="Pincode" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <button className="h-11 rounded-full bg-primary text-sm text-[#f6f1ea]">Save address</button>
      </form>
    </div>
  );
}
